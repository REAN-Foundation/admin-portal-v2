<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { scoringApplicableCondition, showScoringConditionModal } from '$lib/store/general.store';
	import UpdateScoringCondition from '$lib/components/modal/update.scoring.condition.modal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/scoring.condition.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let errors: Record<string, string> = $state({});
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let templateTitle = data.templateDetails.Title;
	let assessmentNode = $derived(data.assessmentNode)
	$inspect('Assesment node', assessmentNode);
	let nodeType = $derived(assessmentNode.NodeType);
	let title = $derived(assessmentNode.Title);
	let description =$derived(
		assessmentNode.Description !== null && assessmentNode.Description !== ''
			? assessmentNode.Description
			: 'Not specified');
	let message =$derived(
		assessmentNode.Message !== null && assessmentNode.Message !== ''
			? assessmentNode.Message
			: 'Not specified');
	let serveListNodeChildrenAtOnce = $derived(assessmentNode.ServeListNodeChildrenAtOnce ?? null);
	let queryType = $derived(assessmentNode.QueryResponseType);
	let options = $derived(assessmentNode.Options ?? []);
	let childrenNodes = $derived(assessmentNode.Children ?? []);
	let displayCode = $derived(assessmentNode.DisplayCode);
	let sequence = $derived(assessmentNode.Sequence);
	let tags_ = $derived(Array.isArray(assessmentNode?.Tags) ? assessmentNode.Tags : []);
	let tags = $derived(tags_.join(', '));
	let correctAnswer = $derived(assessmentNode.CorrectAnswer ?? null);

	let formatRawData = (data: any) => {
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
	};

	let rawData = $derived(formatRawData(assessmentNode.RawData));
	let isJsonData = $derived(rawData !== 'Not specified' && rawData !== assessmentNode.RawData);

	let fieldIdentifier = $derived(assessmentNode.FieldIdentifier !== null && assessmentNode.FieldIdentifier!== '' ? assessmentNode.FieldIdentifier : 'Not specified' );
	let fieldIdentifierUnit = $derived(assessmentNode.FieldIdentifierUnit !== null && assessmentNode.FieldIdentifierUnit!== '' ? assessmentNode.FieldIdentifierUnit : 'Not specified' );

	$inspect('childrenNodes', childrenNodes);
	// Field identifier options for editing
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
	let resolutionScore = $state();

	if (nodeType === 'Question') {
		resolutionScore = assessmentNode.ScoringCondition?.ResolutionScore ?? 'Not specified';
	}

	scoringApplicableCondition.set(data.templateDetails.ScoringApplicable);

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;
	const editRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/edit`;
	const viewRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const assessmentNodeRoutes = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes`;
	const createNodeRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/create`;
	const assessmentTemplateView = `/users/${userId}/assessment-templates/${templateId}/view`;
	const editNodeRoute = (id) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${id}/edit`;
	const viewNodeRoute = (id) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${id}/view`;

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
			name: 'View',
			path: viewRoute
		}
	];

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	const handleAssessmentNodeDelete = async (id) => {
		id = idToBeDeleted;
		const response = await fetch(
			`/api/server/assessments/assessment-nodes/${id}?templateId=${templateId}`,
			{
				method: 'DELETE',
				headers: { 'content-type': 'application/json' }
			}
		);

		const res = await response.json();

		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
			openDeleteModal = false;
			idToBeDeleted = null;
			await invalidateAll();
		} else {
			toastMessage(res);
		}
	};

	let model = $state(false);

	const openModal = async (event) => {
		event.preventDefault();
		event.stopPropagation();
		model = true;
	};
	const closeModal = async () => {
		model = false;
	};
	const onUpdateScoringCondition = async (score: number) => {
		resolutionScore = score;
		console.log('resolutionScore', resolutionScore);
		handleSubmit(event);
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
			let scoringId = assessmentNode.ScoringCondition ?? undefined;

			const scoringConditionUpdateModel = {
				ScoringConditionId: scoringId,
				ResolutionScore: resolutionScore
			};

			const validationResult = createOrUpdateSchema.safeParse(scoringConditionUpdateModel);
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

			const res = await fetch(
				`/api/server/assessments/assessment-nodes/update-scoring-condition?templateId=${templateId}&nodeId=${nodeId}`,
				{
					method: 'PUT',
					body: JSON.stringify(scoringConditionUpdateModel),
					headers: { 'content-type': 'application/json' }
				}
			);

			const response = await res.json();

			console.log('response', response);
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);

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
</script>

{#if model}
	<UpdateScoringCondition {onUpdateScoringCondition} {closeModal} />
{/if}

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Node</h2>
		<a href={assessmentNodeRoutes} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Node Type</td>
				<td class="table-data">{nodeType}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Parent Node</td>
				<td class="table-data">{displayCode}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Title</td>
				<td class="table-data">{title}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Raw Data</td>
				<td class="table-data">
					{#if isJsonData}
						{rawData}
					{:else}
						{rawData}
					{/if}
				</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Sequence</td>
				<td class="table-data">{sequence}</td>
			</tr>
			{#if nodeType === 'Question'}
				<tr class="tables-row">
					<td class="table-label">Field Identifier</td>
					<td class="table-data">{fieldIdentifier ? toLabel(fieldIdentifier) : 'Not specified'}</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Field Identifier Unit</td>
					<td class="table-data">{fieldIdentifierUnit}</td>
				</tr>
			{/if}
			<tr class="tables-row">
				<td class="table-label">Tags</td>
				<td class="table-data">
					{#if tags.length <= 0}
						<span>Tags not specified</span>
					{:else}
						<span>{tags}</span>
					{/if}
				</td>
			</tr>
			{#if nodeType === 'Question'}
				<tr class="tables-row">
					<td class="table-label">Query Response Type</td>
					<td class="table-data">{queryType}</td>
				</tr>
				{#if options.length > 0}
					<tr class="tables-row">
						<td class="table-label align-top">Options</td>
						<td class="table-data">
							<ol class="ml-3 list-decimal">
								{#each options as option}
									<li>{option.Text}</li>
								{/each}
							</ol>
						</td>
					</tr>
				{/if}
				{#if queryType === 'Single Choice Selection'}
					<tr class="tables-row">
						<td class="table-label">Correct Answer</td>
						<td class="table-data">
							{#if correctAnswer}
								{#if options.length > 0}
									{#each options as option}
										{#if option.Sequence == correctAnswer}
											{option.Text}
										{/if}
									{/each}
								{/if}
							{:else}
								<span>Not specified</span>
							{/if}
						</td>
					</tr>
				{/if}
				{#if $scoringApplicableCondition === true}
					<tr class="tables-row">
						<td class="table-label">Resolution Score</td>
						<td class="table-data">
							<div class="flex items-center">
								<span>{resolutionScore}</span>
							</div>
						</td>
					</tr>
				{/if}
			{:else if nodeType === 'Message'}
				<tr class="tables-row">
					<td class="table-label">Message</td>
					<td class="table-data">{message}</td>
				</tr>
			{:else if nodeType === 'Node list'}
				<tr class="tables-row">
					<td class="table-label">Serve List Node Children At Once</td>
					<td class="table-data">{serveListNodeChildrenAtOnce}</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Children Nodes</td>
					<td class="table-data">
						{#if childrenNodes.length <= 0}
							<span>Children nodes not available!</span>
						{:else}
							<div class="health-system-table-container">
								<table class="health-system-table">
									<thead>
										<tr>
											<th>Sequence</th>
											<th>Node type</th>
											<th>Title</th>
											<th />
											<th />
										</tr>
									</thead>
									<tbody class="!bg-white dark:!bg-inherit">
										{#each childrenNodes as node}
											<tr>
												<td>{node.Sequence}</td>
												<td>{node.NodeType}</td>
												<td>{Helper.truncateText(node.Title, 30)}</td>
												<td role="gridcell" aria-colindex={2} tabindex="0">
													<div class="flex">
														<Tooltip text="Edit" forceShow={true}>
															<a href={editNodeRoute(node.id)} class="health-system-btn group">
																<Icon
																	icon="material-symbols:edit-outline"
																	class="health-system-icon"
																/>
															</a>
														</Tooltip>
														<Tooltip text="View" forceShow={true}>
															<a href={viewNodeRoute(node.id)} class=" health-system-btn group"
																><Icon
																	icon="icon-park-outline:preview-open"
																	class="health-system-icon"
																/>
															</a>
														</Tooltip>
														<Tooltip text="Delete" forceShow={true}>
															<button
																class="health-system-btn !text-red-600"
																onclick={() => handleDeleteClick(node.id)}
															>
																<Icon icon="material-symbols:delete-outline-rounded" />
															</button>
														</Tooltip>
													</div>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
	<div class="btn-container">
		{#if nodeType === 'Node list'}
		<Button href={createNodeRoute} text="Add Child" variant="primary" />
		{/if}
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
		></Button>
	</div>
</div>

<Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete Assessment Node"
	onConfirm={handleAssessmentNodeDelete}
/>
