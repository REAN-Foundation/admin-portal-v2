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
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

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
		rawData = $state(formatRawDataEdit(data.assessmentNode.RawData));

	let optionArray = $derived(options);

	// Format rawData for editing, similar to view page
	function formatRawDataEdit(data: any) {
		if (!data || data === '{}' || data === '' || data === null || data === undefined) {
			return 'Not specified';
		}
		try {
			if (typeof data === 'object') {
				if (Object.keys(data).length === 0) {
					return 'Not specified';
				}
				return JSON.stringify(data, null, 2);
			}
			if (typeof data === 'string') {
				const parsed = JSON.parse(data);
				if (Object.keys(parsed).length === 0) {
					return 'Not specified';
				}
				return JSON.stringify(parsed, null, 2);
			}
			return 'Not specified';
		} catch (error) {
			return data || 'Not specified';
		}
	}

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

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Node</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label text-gray-500">Node Type <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input type="text" disabled bind:value={nodeType} class="input text-gray-500" />
						<input type="hidden" name="nodeType" bind:value={nodeType} class="input text-gray-500" />
					</td>
				</tr>
				<tr class="tables-row !border-b-secondary-100 dark:!border-b-surface-700 !border-b">
					<td class="table-label">Title <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="title"
							required
							bind:value={title}
							placeholder="Enter title here..."
							class="input {errors?.title ? 'input-text-error' : ''}"
						/>
						{#if errors?.Title}
							<p class="text-error">{errors?.Title}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row !border-b-secondary-100 dark:!border-b-surface-700 !border-b">
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
				<tr class="tables-row !border-b-secondary-100 dark:!border-b-surface-700 !border-b">
					<td class="table-label">Sequence</td>
					<td class="table-data">
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
				<tr class="tables-row !border-b-secondary-100 dark:!border-b-surface-700 !border-b">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Field Identifier</td>
					<td class="table-data">
						<div class="relative">
						<select
							name="fieldIdentifier"
							bind:value={fieldIdentifier}
							class="select {errors?.fieldIdentifier ? 'input-text-error' : ''}"
						>
							<option value="" disabled selected>Select field identifier here...</option>
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
					<td class="table-label">Field Identifier Unit</td>
					<td class="table-data">
						<input
							type="text"
							name="fieldIdentifierUnit"
							bind:value={fieldIdentifierUnit}
							placeholder="Enter field identifier unit here...."
							class="input {errors?.fieldIdentifierUnit
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
						<td class="table-label align-top text-gray-500"
							>Query Response Type <span class="text-red-600">*</span></td
						>
						<td class="table-data">
							<input type="hidden" name="queryType" bind:value={queryType} />
							<select
								id="mySelect"
								name="queryType"
								disabled
								class="input {errors?.queryType
									? 'input-text-error'
									: ''} text-gray-500"
								placeholder="Select query type here..."
								bind:value={queryType}
							>
								<option selected value={queryType}>{queryType}</option>
							</select>
						</td>
					</tr>
					{#if selectedQueryType === 'Single Choice Selection' || selectedQueryType === 'Multi Choice Selection'}
						<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
							<td class="table-label align-top">Options</td>
							<td class="table-data">
								<Choice bind:optionArray />
							</td>
						</tr>

						{#if selectedQueryType === 'Single Choice Selection'}
							<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
								<td class="table-label">Correct Answer</td>
								<td class="table-data">
									<select
										name="correctAnswer"
										class="input {errors?.correctAnswer
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
						<td class="table-label">Message <span class="text-red-600">*</span></td>
						<td class="table-data">
							<textarea
								name="message"
								required
								placeholder="Enter message here..."
								bind:value={message}
								class="input w-full
									{errors?.message ? 'border-error-300 text-error-500' : ''}"
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
								class=" {errors?.serveListNodeChildrenAtOnce
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
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
