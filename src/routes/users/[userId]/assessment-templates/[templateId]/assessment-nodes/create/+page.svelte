<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { scoringApplicableCondition } from '$lib/store/general.store';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Choice from './choice.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	// import { sequence } from '@sveltejs/kit/hooks';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { AssessmentNodeCreateModel } from '$lib/types/assessment-node.types';
	import { createOrUpdateSchema } from '$lib/validation/assessment-node.schema';
	import { page } from '$app/state';

	/////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	const queryResponseTypes = data.queryResponseTypes;
	const assessmentNodes = data.assessmentNodes;
	let parentNodeId = $state(undefined),
		nodeType = $state(undefined),
		providerAssessmentCode = $state(undefined),
		scoringApplicable = $state(undefined),
		title = $state(undefined),
		description = $state(undefined),
		sequence = $state(undefined),
		queryType = $state(undefined),
		correctAnswer = $state(undefined),
		resolutionScore = $state(undefined),
		serveListNodeChildrenAtOnce = $state(undefined),
		message = $state(undefined),
		keywords = $state(undefined),
		required=$state(undefined),
		rawData = $state(undefined);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	let selectedNodeType = $state('Question');
	let selectedQueryType = $state('Text');

	let optionValueStore = $state([]);

	const updateSequences = () => {
		optionValueStore = optionValueStore.map((opt, index) => ({
			...opt,
			Sequence: index + 1
		}));
	};

	const addOptionField = () => {
		const newOption = { Text: '', Sequence: optionValueStore.length + 1 };
		optionValueStore = [...optionValueStore, newOption];
	};

	const removeOptionField = (option) => {
		optionValueStore = optionValueStore.filter((opt) => opt.id !== option.id);
	};

	let showConfirm = $state(false);

	const confirmDelete = (option) => {
		if (option.id) {
			optionValueStore = option;
			showConfirm = true;
		} else {
			optionValueStore = optionValueStore.filter((opt) => opt.Text !== option.Text);
		}
	};
	// export let optionValueStore = [{ id: null, Text: '', Sequence: 1 }];
	// export let correctAnswer = '';

	const onSelectNodeType = (val) => {
		selectedNodeType = val.target.value;
	};

	const onSelectQueryResponseType = (val) => {
		selectedQueryType = val.target.value;
	};

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const createRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/create`;
	const assessmentNodeRoutes = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes`;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;
	const assessmentTemplateView = `/users/${userId}/assessment-templates/${templateId}/view`;

	const breadCrumbs = [
		{
			name: 'Assessments',
			path: assessmentsRoutes
		},
		{
			name: 'Assessment-View',
			path: assessmentTemplateView
		},
		{
			name: 'Assessment-Nodes',
			path: assessmentNodeRoutes
		},
		{
			name: 'Create',
			path: createRoute
		}
	];

	$inspect(optionValueStore, 'optionValueStore');
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const assessmentNodeCreateModel: AssessmentNodeCreateModel = {
				NodeType: selectedNodeType,
				ParentNodeId: parentNodeId,
				Title: title,
				Description: description,
				Sequence: sequence,
				QueryType: selectedQueryType,
				ResolutionScore: resolutionScore,
				ProviderAssessmentCode: providerAssessmentCode,
				ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
				ScoringApplicable: scoringApplicable,
				Options: optionValueStore,
				CorrectAnswer: correctAnswer,
				Message: message,
				Tags: keywords,
				RawData: rawData,
				Required: required
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentNodeCreateModel);

			console.log('validationResult', validationResult);
			console.log('assessmentNodeCreateModel', assessmentNodeCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/assessments/assessment-nodes?templateId=${templateId}`, {
				method: 'POST',
				body: JSON.stringify(assessmentNodeCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			console.log('response', response, assessmentNodeCreateModel);
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${assessmentNodeRoutes}/${response?.Data?.AssessmentNode?.id}/view`);
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
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Assessment Node</th>
							<th class="text-end">
								<a href={assessmentNodeRoutes} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Node Type <span class="text-red-700">*</span></td>
							<td>
								<select
									name="nodeType"
									placeholder="Select node type here..."
									class="select w-full"
									onchange={(val) => onSelectNodeType(val)}
								>
									<option>Question</option>
									<option>Message</option>
									<option>Node list</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>Parent Node <span class="text-red-700">*</span></td>
							<td>
								<select
									name="parentNodeId"
									class="health-system-input {form?.errors?.parentNodeId ? 'input-text-error' : ''}"
									placeholder="Select node type here..."
									onchange={(val) => (parentNodeId = val.target.value)}
									bind:value={parentNodeId}
								>
									{#each assessmentNodes as node}
										<!-- <option value="">{JSON.stringify(node)}</option> -->
										{#if node.NodeType === 'Node list'}
											<option value={node.id}
												>{node.NodeType} - {node.Title} - {node.DisplayCode}</option
											>
										{/if}
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td>Title <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="title"
									bind:value={title}
									placeholder="Enter title here...."
									class="health-system-input {form?.errors?.title ? 'input-text-error' : ''}"
								/>
								{#if errors?.Title}
									<p class="text-error">{errors?.Title}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Required</td>
							<td>
								<input
									type="checkbox"
									name="required"
									bind:checked={required}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2
									{form?.errors?.required ? 'input-text-error' : ''}"
								/>
								{#if errors?.Required}
									<p class="text-error">{errors?.Required}</p>
								{/if}
							</td>
						</tr>
						<tr>
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
						<tr>
							<td class="align-top">Raw Data</td>
							<td>
								<textarea
									name="rawData"
									bind:value={rawData}
									placeholder="Enter raw data here..."
									class="health-system-input {form?.errors?.rawData ? 'input-text-error' : ''}"
								></textarea>
								{#if errors?.RawData}
									<p class="text-error">{errors?.RawData}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Sequence</td>
							<td>
								<input
									type="number"
									name="sequence"
									placeholder="Enter sequence here..."
									min="1"
									class="input"
									step="1"
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
							<tr>
								<td class="align-top">Query Response Type <span class=" text-red-600">*</span></td>
								<td>
									<select
										id="mySelect"
										name="queryType"
										class="select select-info w-full"
										placeholder="Select query type here..."
										onchange={(val) => onSelectQueryResponseType(val)}
									>
										{#each queryResponseTypes as responseType}
											<option value={responseType}>{responseType}</option>
										{/each}
									</select>
								</td>
							</tr>
							{#if $scoringApplicableCondition === true}
								{#if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
									<!-- <tr>
										<td class="align-top">Options</td>
										<td>
											<Choice />
										</td>
									</tr>
									<tr>
										<td>Correct Answer</td>
										<td>
											<input
												type="text"
												name="correctAnswer"
												placeholder="Enter correct answer here..."
												class="input w-full
												{form?.errors?. correctAnswer? 'border-error-300 text-error-500' : ''}"
												value={form?.data?.correctAnswer ?? ''}
											/>
										</td>
									</tr> -->
									<tr>
										<td class="align-top">Options</td>
										<td>
											<Choice
												bind:optionValueStore
												{updateSequences}
												{addOptionField}
												{removeOptionField}
												{confirmDelete}
												{showConfirm}
												optionToDelete=null
												mode="create"
											/>
										</td>
									</tr>
									{#if selectedQueryType === 'Single Choice Selection'}
										<tr>
											<td>Correct Answer</td>
											<td>
												<select
													name="correctAnswer"
													class="input w-full"
													bind:value={correctAnswer}
												>
													<option value="" disabled selected>Select correct answer</option>
													{#each optionValueStore as option}
														<option value={option.Sequence}>{option.Text}</option>
													{/each}
												</select>
											</td>
										</tr>
									{/if}
									<tr>
										<td>Resolution Score <span class=" text-red-600">*</span></td>
										<td>
											<input
												type="number"
												name="resolutionScore"
												placeholder="Enter resolution score here..."
												min="1"
												class="input w-full"
												bind:value={resolutionScore}
											/>
											{#if errors?.ResolutionScore}
												<p class="text-error">{errors?.ResolutionScore}</p>
											{/if}
										</td>
									</tr>

									<!-- <tr>
										<td class="align-top">Options</td>
										<Choice
										bind:correctAnswer
										queryType={selectedQueryType}
									/>
									</tr>
									<input
										type="hidden"
										name="CorrectAnswer"
										value={JSON.stringify(correctAnswerString)}
									/> -->
								{:else if selectedQueryType === 'Boolean'}
								<tr>
									<td>Correct Answer</td>
									<td>
										<select name="correctAnswer" class="input w-full" bind:value={correctAnswer}>
											<option value="" disabled selected>Select correct answer</option>
											<option value={true}>true</option>
											<option value={false}>false</option>
										</select>
									</td>
								</tr>
								
									<tr>
										<td>Resolution Score <span class=" text-red-600">*</span></td>
										<td>
											<input
												type="number"
												name="resolutionScore"
												placeholder="Enter resolution score here..."
												min="1"
												class="input w-full
													{form?.errors?.resolutionScore ? 'border-error-300 text-error-500' : ''}"
												bind:value={resolutionScore}
											/>
											{#if errors?.ResolutionScore}
												<p class="text-error">{errors?.ResolutionScore}</p>
											{/if}
										</td>
									</tr>
								{/if}
							{:else if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
								<tr>
									<td class="align-top">Options</td>
									<td>
										<Choice
											bind:optionValueStore
											{updateSequences}
											{addOptionField}
											{removeOptionField}
											{confirmDelete}
											{showConfirm}
											optionToDelete=null
											mode="create"
										/>
									</td>
								</tr>
								{#if selectedQueryType === 'Single Choice Selection'}
									<tr>
										<td>Correct Answer</td>
										<td>
											<select
												name="correctAnswer"
												class="health-system-input {form?.errors?.correctAnswer
													? 'input-text-error'
													: ''}"
												bind:value={correctAnswer}
											>
												<option value="" disabled selected>Select correct answer</option>
												{#each optionValueStore as option}
													<option value={option.Sequence}>{option.Text}</option>
												{/each}
											</select>
										</td>
									</tr>
								{/if}
								<!-- <tr>
										<td class="align-top">Options</td>
										<Choice
										bind:correctAnswer
										queryType={selectedQueryType}
									/>
									</tr>
								
								<input
									type="hidden"
									name="CorrectAnswer"
									value={JSON.stringify(correctAnswerString)}
								/> -->
							{/if}
						{:else if selectedNodeType === 'Message'}
							<tr>
								<td class="align-top">Message <span class=" text-red-600">*</span></td>
								<td>
									<textarea
										name="message"
										required
										placeholder="Enter message here..."
										class="health-system-input {form?.errors?.message ? 'input-text-error' : ''}"
									></textarea>
									{#if errors?.Message}
										<p class="text-error">{errors?.Message}</p>
									{/if}
								</td>
							</tr>
						{:else}
							<tr>
								<td>Serve List Node Children At Once</td>
								<td>
									<input
										type="checkbox"
										name="serveListNodeChildrenAtOnce"
										bind:checked={serveListNodeChildrenAtOnce}
										class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2
									{form?.errors?.serveListNodeChildrenAtOnce ? 'input-text-error' : ''}"
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
					<!-- <button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					> -->
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
