<script lang="ts">
	
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Choice from '../../create/choice.svelte';
	import type { PageServerData } from './$types';

	import { goto, invalidate } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/assessment-node.schema';
	import type { AssessmentNodeUpdateModel } from '$lib/types/assessment-node.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import InputChips from '$lib/components/input-chips.svelte';
	import { page } from '$app/state';

	//////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let nodeType = $state(data.assessmentNode.NodeType),
		title = $state(data.assessmentNode.Title),
		description = $state(data.assessmentNode.Description),
		queryType = $state(data.assessmentNode.QueryResponseType),
		options = $state(data.assessmentNode.Options ?? []),
		message = $state(data.assessmentNode.Message ?? null),
		sequence = $state(data.assessmentNode.Sequence),
		serveListNodeChildrenAtOnce = $state(data.assessmentNode.ServeListNodeChildrenAtOnce ?? false),
		tags = $state(data.assessmentNode.Tags),
		correctAnswer = $state(data.assessmentNode.CorrectAnswer ?? null),
		keywords: string[] = $state(data.assessmentNode.Tags);

	let optionValueStore = $derived(options);

	let selectedOption = $derived(
		correctAnswer !== null
			? options.find((option) => String(option.Sequence) === String(correctAnswer))
			: null
	);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	function handleReset() {
		nodeType = data.assessmentNode.NodeType;
		title = data.assessmentNode.Title;
		description = data.assessmentNode.Description;
		queryType = data.assessmentNode.QueryResponseType;
		options = data.assessmentNode.Options ?? [];
		message = data.assessmentNode.Message ?? null;
		sequence = data.assessmentNode.Sequence;
		serveListNodeChildrenAtOnce = data.assessmentNode.ServeListNodeChildrenAtOnce ?? false;
		tags = data.assessmentNode.Tags;
		correctAnswer = data.assessmentNode.CorrectAnswer ?? null;
		errors = {};
	}

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;
	const editRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/edit`;
	const viewRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const assessmentNodeRoutes = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes`;
	const assessmentTemplateView = `/users/${userId}/assessment-templates/${templateId}/view`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'Assessment-View', path: assessmentTemplateView },
		{ name: 'Assessment-Nodes', path: assessmentNodeRoutes },
		{ name: 'Edit', path: editRoute }
	];
	let selectedNodeType = $derived(nodeType);
	let selectedQueryType = $derived(queryType);

	const onSelectQueryResponseType = (val) => (selectedQueryType = val.target.value);

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const assessmentNodeUpdateModel: AssessmentNodeUpdateModel = {
				NodeType: nodeType,
				Title: title,
				Description: description,
				Sequence: sequence,
				QueryType: queryType,
				Options: optionValueStore,
				Message: message,
				ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
				Tags: keywords,
				CorrectAnswer: correctAnswer
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentNodeUpdateModel);

			console.log('validationResult', validationResult);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(`/api/server/assessments/assessment-nodes/${nodeId}`, {
				method: 'PUT',
				body: JSON.stringify(assessmentNodeUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${assessmentsRoutes}/${response?.Data?.HealthSystem?.id}/view`);
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Assessment Node</th>
							<th class="text-end">
								<a href={viewRoute} class="btn variant-soft-secondary -my-2 p-2">
									<Icon icon="material-symbols:close-rounded" class="text-lg" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Node Type <span class=" text-red-600">*</span></td>
							<td>
								<input type="text" disabled bind:value={nodeType} class="input" />
								<input type="hidden" name="nodeType" bind:value={nodeType} class="input" />
							</td>
						</tr>
						<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
							<td>Title <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="title"
									required
									bind:value={title}
									placeholder="Enter title here..."
									class="health-system-input
						{form?.errors?.title ? 'input-text-error' : ''}"
								/>
								{#if errors?.Title}
									<p class="text-error">{errors?.Title}</p>
								{/if}
							</td>
						</tr>
						<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									bind:value={description}
									placeholder="Enter description here..."
									class="health-system-input {form?.errors?.description ? 'input-text-error' : ''}"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
						<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
							<td>Sequence</td>
							<td>
								<input
									type="number"
									name="sequence"
									placeholder="Enter sequence here..."
									class="input"
									step="1"
									min="1"
									bind:value={sequence}
								/>
								{#if errors?.Sequence}
									<p class="text-error">{errors?.Sequence}</p>
								{/if}
							</td>
						</tr>
						<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
							<td class="align-top">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
							</td>
						</tr>
						{#if selectedNodeType === 'Question'}
							<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
								<td class="align-top">Query Response Type <span class=" text-red-600">*</span></td>
								<td>
									<input type="hidden" name="queryType" bind:value={queryType} />
									<select
										id="mySelect"
										name="queryType"
										disabled
										class="health-system-input {form?.errors?.queryType ? 'input-text-error' : ''}"
										placeholder="Select query type here..."
										bind:value={queryType}
									>
										<!-- on:change={(val) => onSelectQueryResponseType(val)} -->

										<option selected value={queryType}>{queryType}</option>
										<!-- {#each queryResponseTypes as responseType}
								<option disabled value={responseType}>{responseType}</option>
							{/each} -->
									</select>
								</td>
							</tr>
							{#if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
								<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
									<td class="align-top">Options</td>
									<td
										><Choice
												bind:optionValueStore
												{updateSequences}
												{addOptionField}
												{removeOptionField}
												{confirmDelete}
												{showConfirm}
												readonly={true}
										/></td
									>
								</tr>

								{#if selectedQueryType === 'Single Choice Selection'}
									<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
										<td>Correct Answer</td>
										<td>
											<select
												name="correctAnswer"
												class="health-system-input {form?.errors?.correctAnswer
													? 'input-text-error'
													: ''}"
												bind:value={correctAnswer}
											>
												<!-- <option value="" disabled>Select correct answer</option> -->
												{#if selectedOption}
													<option selected value={selectedOption.Sequence}
														>{selectedOption.Text}</option
													>
												{/if}
												{#each options as option}
													<option value={option.Sequence}>
														{option.Text}
													</option>
												{/each}
											</select>
										</td>
									</tr>
								{/if}
							{/if}
						{:else if selectedNodeType === 'Message'}
							<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
								<td>Message <span class=" text-red-600">*</span></td>
								<td>
									<textarea
										name="message"
										required
										placeholder="Enter message here..."
										bind:value={message}
										class="textarea w-full
											{form?.errors?.message ? 'border-error-300 text-error-500' : ''}"
									></textarea>
									{#if errors?.Message}
										<p class="text-error">{errors?.Message}</p>
									{/if}
								</td>
							</tr>
						{:else}
							<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
								<td>Serve List Node Children At Once</td>
								<td>
									<input
										type="checkbox"
										name="serveListNodeChildrenAtOnce"
										bind:value={serveListNodeChildrenAtOnce}
										bind:checked={serveListNodeChildrenAtOnce}
										class="health-system-input {form?.errors?.serveListNodeChildrenAtOnce
											? 'input-text-error'
											: ''}"
									/>
									{#if errors?.ServeListNodeChildrenAtOnce}
										<p class="text-error">{errors?.ServeListNodeChildrenAtOnce}</p>
									{/if}
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
