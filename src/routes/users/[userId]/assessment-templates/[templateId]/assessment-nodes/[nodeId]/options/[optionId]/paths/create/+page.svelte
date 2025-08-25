<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { page } from '$app/state';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	// Form state
	let optionText = $state(data.optionData?.Text || '');
	let optionSequence = $state(data.optionData?.Sequence || 0);
	$inspect('options',optionText);
	let messageBeforeQuestion = $state('');
	let isExitPath = $state(false);
	let nextNode = $state('');
	let nextNodeId = $state('');
	let nextNodeDisplayCode = $state('');
	let errors: Record<string, string> = $state({});
	let isSubmitting = $state(false);

	$effect(() => {
		if (nextNode && data.childNodes.length > 0) {
			const selectedNode = data.childNodes.find(node => node.id === nextNode);
			if (selectedNode) {
				nextNodeDisplayCode = selectedNode.DisplayCode || '';
				nextNodeId = selectedNode.id;
			}
		}
	});

	// Get route parameters
	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	const optionId = page.params.optionId;

	console.log('option ID in create:', optionId);

	const asssemsntPath = `/users/${userId}/assessment-templates`
	const nodePath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const nodeViewPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const createPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/create`;
	const viewPath = (pathId) => `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/view`;

	// Breadcrumb navigation
	const breadCrumbs = [
		{
			name: 'Assessments',
			path: asssemsntPath
		},
		// {
		// 	name: 'Assessment Templates',
		// 	path: `/users/${userId}/assessment-templates/${templateId}/view`
		// },
		{
			name: 'Nodes',
			path: nodePath
		},
		{
			name: 'View Node',
			path: nodeViewPath
		},
		{
			name: 'Create Path',
			path: createPath
		}
	];

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
			// Basic validation
			if (data.childNodes.length === 0) {
				errors.nextNode = 'No child nodes available. Please create child nodes first.';
				isSubmitting = false;
				return;
			}
			if (!nextNode.trim()) {
				errors.nextNode = 'Next Node is required';
			}

			if (Object.keys(errors).length > 0) {
				isSubmitting = false;
				return;
			}

			// Create path data
			const pathData = {
				TemplateId: templateId,
				NodeId: nodeId,
				MessageBeforeQuestion: messageBeforeQuestion.trim() || undefined,
				IsExitPath: isExitPath,
				NextNodeId: nextNodeId,
				NextNodeDisplayCode: nextNodeDisplayCode.trim() || undefined,
				// OptionSequence: optionSequence
			};

			// Call API to create path
			const response = await fetch('/api/server/assessments/paths', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(pathData)
			});

			const result = await response.json();

			console.log('result',result);

			if (result.Status === 'success' && (result.HttpCode === 200 || result.HttpCode === 201)) {
				// Get the path ID from the response
				const pathId = result.Data?.NodePath?.id;
				console.log('Path ID:', pathId);
				console.log('Path ID:', result.Data);
				if (pathId) {

					console.log("optionSequence",optionSequence);
					try {
						// Call the conditions API with pathId and optionSequence
						const conditionResponse = await fetch(`/api/server/assessments/paths/${pathId}/conditions`, {
							method: 'POST',
							headers: { 'content-type': 'application/json' },
							body: JSON.stringify({	
								TemplateId: templateId,
								NodeId: nodeId,
								PathId: pathId,
								OptionSequence: optionSequence
							})
						});

						const conditionResult = await conditionResponse.json();
						
						if (conditionResult.Status === 'success' && (conditionResult.HttpCode === 200 || conditionResult.HttpCode === 201)) {
							toastMessage({
								HttpCode: 200,
								Message: 'Path and condition created successfully'
							});
							// goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/view`);
							goto(nodeViewPath);

						} else {
							console.warn('Condition creation failed:', conditionResult.Message);
							toastMessage({
								Status: 'success',
								Message: 'Path created successfully, but condition creation failed'
							});
							goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`);
						}
					} catch (conditionError) {
						console.error('Error creating condition:', conditionError);
						toastMessage({
							Status: 'success',
							Message: 'Path created successfully, but condition creation failed'
						});
						goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`);
					}
				} else {
					toastMessage({
						Status: 'success',
						Message: 'Path created successfully'
					});
					goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`);
				}

				// window.location.href = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
			} else {
				toastMessage({
					Status: 'error',
					Message: result.Message || 'Failed to create path'
				});
			}

		} catch (error) {
			console.error('Error creating path:', error);
			toastMessage({
				Status: 'error',
				Message: 'Failed to create path'
			});
		} finally {
			isSubmitting = false;
		}
	};

	const handleCancel = () => {
		goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`);
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">Create Path</h2>
		<button onclick={handleCancel} class="form-cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</button>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Option Text <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							id="options"
							bind:value={optionText}
							class="input bg-gray-100 text-gray-600 cursor-not-allowed"
							placeholder="Enter option text here..."
							disabled
						/>
						<!-- <p class="text-xs text-gray-500 mt-1">This field shows the selected option text and cannot be edited</p> -->
						{#if errors?.options}
							<p class="text-error">{errors.options}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Message Before Question</td>
					<td class="table-data">
						<textarea
							id="messageBeforeQuestion"
							bind:value={messageBeforeQuestion}
							rows="3"
							class="input {errors?.messageBeforeQuestion ? 'input-text-error' : ''}"
							placeholder="Enter message before question here..."
						></textarea>
						{#if errors?.messageBeforeQuestion}
							<p class="text-error">{errors.messageBeforeQuestion}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Is Exit Path</td>
					<td class="table-data">
						<div class="flex items-center space-x-6">
							<label class="flex items-center">
															<input
								type="radio"
								bind:group={isExitPath}
								value={true}
								class="radio-input"
							/>
							<span class="ml-2 text-sm text-[var(--color-info)]">Yes</span>
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								bind:group={isExitPath}
								value={false}
								class="radio-input"
							/>
								<span class="ml-2 text-sm text-[var(--color-info)]">No</span>
							</label>
						</div>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Next Node <span class="text-red-700">*</span></td>
					<td class="table-data">
						<div class="relative">
							<select
								id="nextNode"
								bind:value={nextNode}
								disabled={data.childNodes.length === 0}
								class="select {errors?.nextNode ? 'input-text-error' : ''}"
							>
								<option value="">
									{data.childNodes.length === 0 ? 'No child nodes available' : 'Select next node'}
								</option>
								{#each data.childNodes as node}
									<option value={node.id}>
										{node.Title} - {node.DisplayCode || 'No Display Code'}
									</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
						{#if errors?.nextNode}
							<p class="text-error">{errors.nextNode}</p>
						{/if}
						{#if data.childNodes.length === 0}
							<div class="mt-3 space-y-3">
								<p class="text-sm text-amber-600">
									No child nodes found. You need to create child nodes for this node first before creating paths.
								</p>
								<Button
									type="button"
									onclick={() => window.location.href = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/create?parentNodeId=${nodeId}`}
									text="Create Child Node"
									variant="primary"
								/>
							</div>
						{/if}
					</td>
				</tr>

			</tbody>
		</table>

		<!-- Next Node Display Code (Handled internally) -->
		<input type="hidden" id="nextNodeDisplayCode" bind:value={nextNodeDisplayCode} />

		<div class="btn-container">
			<!-- <Button
				size="md"
				type="button"
				text="Cancel"
				variant="secondary"
				onclick={handleCancel}
			/> -->
			<Button
				size="md"
				type="submit"
				text={isSubmitting ? 'Submitting...' : 'Submit'}
				variant="primary"
				disabled={isSubmitting}
			/>
		</div>
	</form>
</div>

 