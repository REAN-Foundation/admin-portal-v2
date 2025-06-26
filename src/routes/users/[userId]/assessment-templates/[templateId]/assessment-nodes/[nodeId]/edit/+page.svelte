<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Choice from './choice.svelte';
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/assessment-node.schema';
	import type { AssessmentNodeUpdateModel } from '$lib/types/assessment-node.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import InputChips from '$lib/components/input-chips.svelte';
	import { page } from '$app/state';

	//////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	console.log(data, 'data from server');
	let nodeTitle = data.assessmentNode.Title;
	let templateTitle = data.templateData.Title;

	let nodeType = $state(data.assessmentNode.NodeType),
		parentNodeId = $state(data.assessmentNode.ParentNodeId),
		title = $state(data.assessmentNode.Title),
		description = $state(data.assessmentNode.Description ?? undefined),
		queryType = $state(data.assessmentNode.QueryResponseType ?? undefined),
		options = $state(data.assessmentNode.Options ?? []),
		message = $state(data.assessmentNode.Message ?? undefined),
		sequence = $state(data.assessmentNode.Sequence ?? undefined),
		serveListNodeChildrenAtOnce = $state(data.assessmentNode.ServeListNodeChildrenAtOnce ?? false),
		tags = $state(data.assessmentNode.Tags || []),
		correctAnswer = $state(data.assessmentNode.CorrectAnswer ?? undefined),
		keywords: string[] = $state(data.assessmentNode.Tags || []),
		resolutionScore = $state(data.assessmentNode.ResolutionScore ?? undefined),
		providerAssessmentCode = $state(data.assessmentNode.ProviderAssessmentCode ?? undefined),
		scoringApplicable = $state(data.assessmentNode.ScoringApplicable ?? false),
		required = $state(data.assessmentNode.Required ?? false),
		fieldIdentifier = $state(data.assessmentNode.FieldIdentifier ?? undefined),
		fieldIdentifierUnit = $state(data.assessmentNode.FieldIdentifierUnit ?? undefined),
		rawData = $state(data.assessmentNode.RawData ?? undefined);

	let optionArray = $derived(options);

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
		resolutionScore = data.assessmentNode.ResolutionScore;
		providerAssessmentCode = data.assessmentNode.ProviderAssessmentCode;
		scoringApplicable = data.assessmentNode.ScoringApplicable;
		required = data.assessmentNode.Required;
		fieldIdentifier = data.assessmentNode.FieldIdentifier ?? null;
		fieldIdentifierUnit = data.assessmentNode.FieldIdentifierUnit ?? null;
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
		{ name: templateTitle, path: assessmentTemplateView },
		{ name: 'Nodes', path: assessmentNodeRoutes },
		{ name: 'Edit', path: editRoute }
	];
	let selectedNodeType = $derived(nodeType);
	let selectedQueryType = $derived(queryType);

	const AssessmentFieldIdentifiers = [
		'General:PersonalProfile:FirstName',
		'General:PersonalProfile:LastName',
		'General:PersonalProfile:Name',
		'General:PersonalProfile:Age',
		'General:PersonalProfile:DateOfBirth',
		'General:PersonalProfile:Gender',
		'Clinical:HealthProfile:BloodGroup',
		'Clinical:HealthProfile:Ethnicity',
		'Clinical:HealthProfile:Race',
		'Clinical:HealthProfile:MaritalStatus',
		'Clinical:HealthProfile:Occupation',
		'Clinical:HealthProfile:Smoking',
		'Clinical:Vitals:BloodPressure:Systolic',
		'Clinical:Vitals:BloodPressure:Diastolic',
		'Clinical:Vitals:Pulse',
		'Clinical:Vitals:Temperature',
		'Clinical:Vitals:Weight',
		'Clinical:Vitals:Height',
		'Clinical:Vitals:OxygenSaturation',
		'Clinical:Vitals:BloodGlucose',
		'Clinical:LabRecords:Cholesterol',
		'Clinical:LabRecords:Triglycerides',
		'Clinical:LabRecords:LDL',
		'Clinical:LabRecords:HDL',
		'Clinical:LabRecords:A1C'
	];

	const sortedIdentifiers = AssessmentFieldIdentifiers;

	function toLabel(identifier: string) {
		const parts = identifier.split(':');
		const lastPart = parts[parts.length - 1];
		return lastPart.replace(/([a-z])([A-Z])/g, '$1 $2'); // adds space before capital letters
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			let processedCorrectAnswer: string | number | boolean | null = correctAnswer;

			if (selectedQueryType === 'Boolean') {
				processedCorrectAnswer =
					correctAnswer === 'true' ? true : correctAnswer === 'false' ? false : null;
			} else if (selectedQueryType === 'Single Choice Selection') {
				const parsed = parseInt(correctAnswer);
				processedCorrectAnswer = isNaN(parsed) ? null : parsed;
			}

			// Custom validation: message required if node type is Message
			if (selectedNodeType === 'Message' && (!message || message.trim() === '')) {
				errors = { ...errors, Message: 'Message is required.' };
				return;
			}

			const assessmentNodeUpdateModel: AssessmentNodeUpdateModel = {
				ParentNodeId: parentNodeId,
				NodeType: selectedNodeType,
				Title: title,
				Description: description,
				Sequence: sequence,
				QueryType: selectedNodeType === 'Question' ? selectedQueryType : undefined,
				ResolutionScore: resolutionScore,
				ProviderAssessmentCode: providerAssessmentCode,
				ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
				ScoringApplicable: scoringApplicable,
				Options: optionArray,
				CorrectAnswer: processedCorrectAnswer,
				Message: message,
				Tags: keywords,
				RawData: rawData,
				Required: required,
				FieldIdentifier: fieldIdentifier,
				FieldIdentifierUnit: fieldIdentifierUnit
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentNodeUpdateModel);

			console.log(
				'validationResult ==============>',
				validationResult,
				'assessmentNodeUpdateModel ==============>',
				assessmentNodeUpdateModel
			);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(
				`/api/server/assessments/assessment-nodes/${nodeId}?templateId=${templateId}`,
				{
					method: 'PUT',
					body: JSON.stringify(assessmentNodeUpdateModel),
					headers: { 'content-type': 'application/json' }
				}
			);

			const response = await res.json();

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

	$effect(() => {
            keywordsStr = keywords?.join(', ');
		});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Node</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
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
										{errors?.title ? 'input-text-error' : ''}"
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
									class="health-system-input {errors?.description ? 'input-text-error' : ''}"
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
									class="health-system-input {errors?.rawData ? 'input-text-error' : ''}"
								></textarea>
								{#if errors?.RawData}
									<p class="text-error">{errors?.RawData}</p>
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
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
							</td>
						</tr>
						<tr>
							<td>Field Identifier</td>
							<td>
								<select
									name="fieldIdentifier"
									bind:value={fieldIdentifier}
									class="health-system-input {errors?.fieldIdentifier ? 'input-text-error' : ''}"
								>
									<option value="" disabled selected>Select field identifier here...</option>
									{#each sortedIdentifiers as identifier}
										<option value={identifier}>{toLabel(identifier)}</option>
									{/each}
								</select>

								{#if errors?.FieldIdentifier}
									<p class="text-error">{errors?.FieldIdentifier}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Field Identifier Unit</td>
							<td>
								<input
									type="text"
									name="fieldIdentifierUnit"
									bind:value={fieldIdentifierUnit}
									placeholder="Enter field identifier unit here...."
									class="health-system-input {errors?.fieldIdentifierUnit
										? 'input-text-error'
										: ''}"
								/>
								{#if errors?.FieldIdentifierUnit}
									<p class="text-error">{errors?.FieldIdentifierUnit}</p>
								{/if}
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
										class="health-system-input {errors?.queryType ? 'input-text-error' : ''}"
										placeholder="Select query type here..."
										bind:value={queryType}
									>
										<option selected value={queryType}>{queryType}</option>
									</select>
								</td>
							</tr>
							{#if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
								<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
									<td class="align-top">Options</td>
									<td>
										<Choice bind:optionArray />
									</td>
								</tr>

								{#if selectedQueryType === 'Single Choice Selection'}
									<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
										<td>Correct Answer</td>
										<td>
											<select
												name="correctAnswer"
												class="health-system-input {errors?.correctAnswer
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
										class="health-system-input w-full
											{errors?.message ? 'border-error-300 text-error-500' : ''}"
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
										bind:checked={serveListNodeChildrenAtOnce}
										class="health-system-input {errors?.serveListNodeChildrenAtOnce
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
