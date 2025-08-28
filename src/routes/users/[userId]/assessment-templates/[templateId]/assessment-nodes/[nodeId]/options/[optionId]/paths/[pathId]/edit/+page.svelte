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

	let messageBeforeQuestion = $state(data.pathData?.MessageBeforeQuestion);
	let isExitPath = $state(data.pathData?.IsExitPath || false);
	let nextNode = $state(data.pathData?.NextNode || '');
	let nextNodeId = $state(data.pathData?.NextNodeId || data.pathData?.NextNode || '');
	let nextNodeDisplayCode = $state(data.pathData?.NextNodeDisplayCode || '');
	let errors: Record<string, string> = $state({});
	let isSubmitting = $state(false);
	let optionText = $state(data.optionData?.Text || '')
	// let optionId = $state(data.optionData?.id);
	// let pathId = $state(data.pathData?.id);
	console.log('data.optionData', data.optionData);
	
	$effect(() => {
		if (data.pathData) {
			messageBeforeQuestion = data.pathData.MessageBeforeQuestion;
			isExitPath = data.pathData.IsExitPath || false;
			nextNode = data.pathData.NextNode || '';
			nextNodeId = data.pathData.NextNodeId || data.pathData.NextNode || '';
			nextNodeDisplayCode = data.pathData.NextNodeDisplayCode || '';
			// pathId = data.pathData.id
		}
	});

	console.log('data.pathData', data.pathData);
	$effect(() => {
		if (nextNode && data.childNodes.length > 0) {
			const selectedNode = data.childNodes.find(node => node.id === nextNode);
			if (selectedNode) {
				nextNodeDisplayCode = selectedNode.DisplayCode || '';
				nextNodeId = selectedNode.id;
			}
		}
	});

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	// const optionId = page.params.optionId;
	// const pathId = page.params.pathId;
	const optionId = $state(data.optionId);
	const pathId = $state(data.pathId)


	const assessmentPath = `/users/${userId}/assessment-templates`;
	const templatePath = `/users/${userId}/assessment-templates/${templateId}/view`;
	const nodePath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const optionPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/view`;
	const viewPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/view`;
	const editPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/edit`;
	const breadCrumbs = [
		{
			name: 'Assessments',
			path: assessmentPath
		},
		{
			name: 'Template',
			path: templatePath
		},
		{
			name: 'Node',
			path: nodePath
		},
		{
			name: 'Edit Path',
			path: editPath
		}
	];

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};
		isSubmitting = true;

		try {
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
			const pathData = {
				MessageBeforeQuestion: messageBeforeQuestion,
				IsExitPath: isExitPath,
				NextNode: nextNodeId,
				NextNodeDisplayCode: nextNodeDisplayCode
			};

			const response = await fetch(`/api/server/assessments/paths/${pathId}?templateId=${templateId}&nodeId=${nodeId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(pathData)
			});

			const result = await response.json();

			if (result.Status === 'success' && (result.HttpCode === 200 || result.HttpCode === 201)) {
				toastMessage({
					Status: 'success',
					Message: 'Path updated successfully'
				});
				goto(viewPath);
			} else {
				toastMessage({
					Status: 'error',
					Message: result.Message || 'Failed to update path'
				});
			}
		} catch (error) {
			console.error('Error updating path:', error);
			toastMessage({
				Status: 'error',
				Message: 'Failed to update path'
			});
		} finally {
			isSubmitting = false;
		}
	};

	const handleCancel = () => {
		goto(viewPath);
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">Edit Assessment Path</h2>
		<button onclick={handleCancel} class="form-cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</button>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Option Text</td>
					<td class="table-data">
						<input
							type="text"
							value={optionText}
							class="input bg-gray-100 text-gray-600 cursor-not-allowed"
							placeholder="Option text"
							disabled
						/>
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
									No child nodes found. You need to create child nodes for this node first before editing paths.
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

		<input type="hidden" id="nextNodeDisplayCode" bind:value={nextNodeDisplayCode} />
		<input type="hidden" id="nextNodeId" bind:value={nextNodeId} />

		<div class="btn-container">
			<Button
				size="md"
				type="button"
				text="Cancel"
				variant="secondary"
				onclick={handleCancel}
			/>
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
