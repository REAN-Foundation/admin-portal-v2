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
	import Button from '$lib/components/button/button.svelte';
	import { onMount } from 'svelte';

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
		keywords: string[] = $state([]),
		required = $state(undefined),
		fieldIdentifier = $state(undefined),
		fieldIdentifierUnit = $state(undefined),
		rawData = $state(undefined);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	let selectedNodeType = $state('Question');
	let selectedQueryType = $derived(queryType || 'Text');

	let optionArray = $state([]);

	const onSelectNodeType = (val: Event) => {
		selectedNodeType = (val.target as HTMLSelectElement).value;
		console.log('val', (val.target as HTMLSelectElement).value);
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
        'General:PersonalProfile:Phone',
        'General:PersonalProfile:EMRId',
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

	function isBiometricField(identifier: string | undefined): boolean {
		if (!identifier) return false;
		return identifier.startsWith('Clinical:Vitals:') || identifier.startsWith('Clinical:LabRecords:');
	}

	const filteredQueryResponseTypes = $derived(() => {
		if (!queryResponseTypes) return [];
		
		if (isBiometricField(fieldIdentifier)) {
			const filtered = queryResponseTypes.filter(type => 
				type === 'Integer' || type === 'Float'
			);

			return filtered.sort((a, b) => {
				if (a === 'Integer' && b === 'Float') return -1;
				if (a === 'Float' && b === 'Integer') return 1;
				return 0;
			});
		}

		return queryResponseTypes;
	});

	$effect(() => {
		if (fieldIdentifier && queryType) {
			const validTypes = filteredQueryResponseTypes();
			if (!validTypes.includes(queryType)) {
				queryType = validTypes.length > 0 ? validTypes[0] : undefined;
			}
		}
	});

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
			} else {
				processedCorrectAnswer = correctAnswer === '' ? undefined : correctAnswer;
			}

			const sequenceValue = sequence === '' ? undefined : sequence;

			// Ensure each option has ProviderGivenCode set to its Text value
			const processedOptions = optionArray.map(option => ({
				...option,
				ProviderGivenCode: option.ProviderGivenCode || option.Text
			}));

			const assessmentNodeCreateModel: AssessmentNodeCreateModel = {
				NodeType: selectedNodeType,
				ParentNodeId: parentNodeId,
				Title: title,
				Description: description,
				Sequence: sequenceValue,
				QueryType: queryType,
				Score: resolutionScore,
				ProviderAssessmentCode: providerAssessmentCode,
				ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
				ScoringApplicable: scoringApplicable,
				Options: processedOptions,
				CorrectAnswer: processedCorrectAnswer,
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

			if (selectedNodeType === 'Message' && (!message || message.trim() === '')) {
				errors = { ...errors, Message: 'Message is required.' };
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

	$effect(() => {
		keywordsStr = keywords?.join(', ');
	});

	onMount(() => {
		scoringApplicableCondition.set(data.templateData.ScoringApplicable);
		console.log('scoringApplicableCondition set to:', data.templateData.ScoringApplicable);
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form
		onsubmit={async (event) => {
			const result = handleSubmit(event);
			if (result && typeof result.then === 'function') {
				promise = result;
			}
		}}
	>
		<div class="form-headers">
			<h2 class="form-titles">Create Node</h2>
			<a href={assessmentNodeRoutes} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Node Type <span class="text-red-700">*</span></td>
					<td class="table-data">
						<div class="relative">
							<select
								name="nodeType"
								placeholder="Select node type here..."
								class="select {errors?.nodeType ? 'input-text-error' : ''}"
								onchange={(val) => onSelectNodeType(val)}
							>
								<option>Question</option>
								<option>Message</option>
								<option>Node list</option>
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Parent Node <span class="text-red-700">*</span></td>
					<td class="table-data">
						<div class="relative">
						<select
							name="parentNodeId"
							class="select {errors?.parentNodeId ? 'input-text-error' : ''}"
							placeholder="Select node type here..."
							onchange={(val: Event) => {
								const target = val.target as HTMLSelectElement;
								parentNodeId = target.value;
							}}
							bind:value={parentNodeId}
						>
							{#each assessmentNodes as node}
								{#if node.NodeType === 'Node list'}
									<option value={node.id}
										>{node.NodeType} - {node.Title} - {node.DisplayCode}</option
									>
								{:else}
									<option value={node.id}>{node.Title} - {node.DisplayCode}</option>
								{/if}
							{/each}
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Title <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="title"
							bind:value={title}
							placeholder="Enter title here...."
							class="input {errors?.title ? 'input-text-error' : ''}"
						/>
						{#if errors?.Title}
							<p class="text-error">{errors?.Title}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Required</td>
					<td class="table-data">
						<input
							type="checkbox"
							name="required"
							bind:checked={required}
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.required
								? 'input-text-error'
								: ''}"
						/>
						{#if errors?.Required}
							<p class="text-error">{errors?.Required}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							bind:value={description}
							placeholder="Enter description here..."
							class="input {errors?.description ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Raw Data</td>
					<td class="table-data">
						<textarea
							name="rawData"
							bind:value={rawData}
							placeholder="Enter raw data here..."
							class="input {errors?.rawData ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.RawData}
							<p class="text-error">{errors?.RawData}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Sequence</td>
					<td class="table-data">
						<input
							type="number"
							name="sequence"
							placeholder="Enter sequence here..."
							min="1"
							step="1"
							bind:value={sequence}
							class="input {errors?.sequence ? 'input-text-error' : ''}"
						/>
						{#if errors?.Sequence}
							<p class="text-error">{errors?.Sequence}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>
				{#if selectedNodeType === 'Question'}
						<tr class="tables-row">
						<td class="table-label">Field Identifier</td>
						<td class="table-data">
							<div class="relative">
							<select
								name="fieldIdentifier"
								bind:value={fieldIdentifier}
								class="select {errors?.fieldIdentifier ? 'input-text-error' : ''}"
							>
								<option value="" disabled selected={fieldIdentifier === undefined}>
									Select field identifier here...
								</option>

								{#each sortedIdentifiers as identifier}
									<option value={identifier}>{toLabel(identifier)}</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
							{#if errors?.FieldIdentifier}
								<p class="text-error">{errors?.FieldIdentifier}</p>
							{/if}
						</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label align-top">Field Identifier Unit</td>
						<td class="table-data">
							<input
								type="text"
								name="fieldIdentifierUnit"
								bind:value={fieldIdentifierUnit}
								placeholder="Enter field identifier unit here...."
								class="input {errors?.fieldIdentifierUnit ? 'input-text-error' : ''}"
							/>
							{#if errors?.FieldIdentifierUnit}
								<p class="text-error">{errors?.FieldIdentifierUnit}</p>
							{/if}
						</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label align-top"
							>Query Response Type <span class=" text-red-600">*</span></td
						>
						<td class="table-data">
							<div class="relative">
							<select
								id="mySelect"
								name="queryType"
								class="select{errors?.queryType ? 'input-text-error' : ''}"
								placeholder="Select query type here..."
								bind:value={queryType}
							>
								<option value="" disabled>Select query type here...</option>
								{#each filteredQueryResponseTypes() as responseType}
									<option value={responseType}>{responseType}</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
						{#if errors?.QueryType}
							<p class="text-error">{errors?.QueryType}</p>
						{/if}
						</td>
					</tr>
			
					{#if $scoringApplicableCondition === true}
						{#if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
							<tr class="tables-row">
								<td class="table-label align-top">Options</td>
								<td class="table-data">
									<Choice bind:optionArray />
								</td>
							</tr>
							{#if selectedQueryType === 'Single Choice Selection'}
								<tr class="tables-row">
									<td class="table-label">Correct Answer</td>
									<td class="table-data">
										<select name="correctAnswer" class="input w-full" bind:value={correctAnswer}>
											<option value="" disabled selected>Select correct answer</option>
											{#each optionArray as option}
												<option value={option.Sequence}>{option.Text}</option>
											{/each}
										</select>
									</td>
								</tr>
							{/if}
							<tr class="tables-row">
								<td class="table-label">Score</td>
								<td class="table-data">
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
							<tr class="tables-row">
								<td class="table-label">Correct Answer</td>
								<td class="table-data">
									<select name="correctAnswer" class="input w-full" bind:value={correctAnswer}>
										<option value="" disabled selected>Select correct answer</option>
										<option value="true">true</option>
										<option value="false">false</option>
									</select>
								</td>
							</tr>

							<tr class="tables-row">
								<td class="table-label">Score</td>
								<td class="table-data">
									<input
										type="number"
										name="resolutionScore"
										placeholder="Enter resolution score here..."
										min="1"
										class="input w-full
											{errors?.resolutionScore ? 'border-error-300 text-error-500' : ''}"
										bind:value={resolutionScore}
									/>
									{#if errors?.ResolutionScore}
										<p class="text-error">{errors?.ResolutionScore}</p>
									{/if}
								</td>
							</tr>
						{/if}
					{:else if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
						<tr class="tables-row">
							<td class="table-label align-top">Options</td>
							<td class="table-data">
								<Choice bind:optionArray />
							</td>
						</tr>
						{#if selectedQueryType === 'Single Choice Selection'}
							<tr class="tables-row">
								<td class="table-label">Correct Answer</td>
								<td class="table-data">
									<select
										name="correctAnswer"
										class="input {errors?.correctAnswer ? 'input-text-error' : ''}"
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
					<tr class="tables-row">
						<td class="table-label align-top">Message <span class=" text-red-600">*</span></td>
						<td class="table-data">
							<textarea
								name="message"
								placeholder="Enter message here..."
								class="input {errors?.message ? 'input-text-error' : ''}"
								bind:value={message}
							></textarea>
							{#if errors?.Message}
								<p class="text-error">{errors?.Message}</p>
							{/if}
						</td>
					</tr>
				{:else}
					<tr class="tables-row">
						<td class="table-label">Serve List Node Children At Once</td>
						<td class="table-data">
							<input
								type="checkbox"
								name="serveListNodeChildrenAtOnce"
								bind:checked={serveListNodeChildrenAtOnce}
								class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.serveListNodeChildrenAtOnce
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
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
