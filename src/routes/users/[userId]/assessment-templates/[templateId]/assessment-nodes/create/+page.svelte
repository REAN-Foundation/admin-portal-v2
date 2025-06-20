<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { scoringApplicableCondition } from '$lib/store/general.store';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Choice from './choice.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { AssessmentNodeCreateModel } from '$lib/types/assessment-node.types';
	import { createOrUpdateSchema } from '$lib/validation/assessment-node.schema';
	import { page } from '$app/state';

	/////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let templateTitle = data.templateData.Title;

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
		required = $state(undefined),
		fieldIdentifier = $state(undefined),
		fieldIdentifierUnit = $state(undefined),
		rawData = $state(undefined);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	let selectedNodeType = $state('Question');
	let selectedQueryType = $state('Text');

	let optionArray = $state([]);

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
			name: templateTitle,
			path: assessmentTemplateView
		},
		{
			name: 'Nodes',
			path: assessmentNodeRoutes
		},
		{
			name: 'Create',
			path: createRoute
		}
	];

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
		// 'Clinical:Vitals:RespiratoryRate',
		'Clinical:Vitals:Temperature',
		'Clinical:Vitals:Weight',
		'Clinical:Vitals:Height',
		// 'Clinical:Vitals:BodyMassIndex',
		'Clinical:Vitals:OxygenSaturation',
		'Clinical:Vitals:BloodGlucose',
		'Clinical:LabRecords:Cholesterol',
		'Clinical:LabRecords:Triglycerides',
		'Clinical:LabRecords:LDL',
		'Clinical:LabRecords:HDL',
		// 'Clinical:LabRecords:Creatinine',
		// 'Clinical:LabRecords:Urea',
		// 'Clinical:LabRecords:Electrolytes',
		// 'Clinical:LabRecords:Hemoglobin',
		'Clinical:LabRecords:A1C'
		// 'Clinical:LabRecords:Platelets',
		// 'Clinical:LabRecords:WBC'
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

			const finalValue = correctAnswer === '' ? undefined : correctAnswer;

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
				Options: optionArray,
				CorrectAnswer: finalValue,
				Message: message,
				Tags: keywords,
				RawData: rawData,
				Required: required,
				FieldIdentifier: fieldIdentifier,
				FieldIdentifierUnit: fieldIdentifierUnit
			};

			console.log('assessmentNodeCreateModel', assessmentNodeCreateModel);
			const validationResult = createOrUpdateSchema.safeParse(assessmentNodeCreateModel);

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
							<th>Create Node</th>
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
									class="health-system-input {form?.errors?.nodeType ? 'input-text-error' : ''}"
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
									step="1"
									bind:value={sequence}
									class="health-system-input {form?.errors?.sequence ? 'input-text-error' : ''}"
								/>
								{#if errors?.Sequence}
									<p class="text-error">{errors?.Sequence}</p>
								{/if}
							</td>
						</tr>
						<tr>
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
						<tr>
							<td>Field Identifier</td>
							<td>
								<select
									name="fieldIdentifier"
									bind:value={fieldIdentifier}
									class="health-system-input {form?.errors?.fieldIdentifier
										? 'input-text-error'
										: ''}"
								>
									<option value="" disabled selected={fieldIdentifier === undefined}>
										Select fieldIdentifier here...
									</option>

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
									placeholder="Enter fieldIdentifierUnit here...."
									class="health-system-input {form?.errors?.fieldIdentifierUnit
										? 'input-text-error'
										: ''}"
								/>
								{#if errors?.FieldIdentifierUnit}
									<p class="text-error">{errors?.FieldIdentifierUnit}</p>
								{/if}
							</td>
						</tr>
						{#if selectedNodeType === 'Question'}
							<tr>
								<td class="align-top">Query Response Type <span class=" text-red-600">*</span></td>
								<td>
									<select
										id="mySelect"
										name="queryType"
										class="health-system-input {form?.errors?.queryType ? 'input-text-error' : ''}"
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
									<tr>
										<td class="align-top">Options</td>
										<td>
											<Choice bind:optionArray />
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
													{#each optionArray as option}
														<option value={option.Sequence}>{option.Text}</option>
													{/each}
												</select>
											</td>
										</tr>
									{/if}
									<tr>
										<td>Resolution Score</td>
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
										<td>Resolution Score</td>
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
										<Choice bind:optionArray />
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
												{#each optionArray as option}
													<option value={option.Sequence}>{option.Text}</option>
												{/each}
											</select>
										</td>
									</tr>
								{/if}
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