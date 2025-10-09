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
	let openDeletePathModal = $state(false);
	let pathToBeDeleted = $state(null);
	let isDeletingPath = $state(false);
	let templateTitle = data.templateDetails.Title;
	let assessmentNode = $derived(data.assessmentNode)
	console.log('data.assessmentNode', data.assessmentNode);
	console.log('View page - correctAnswer:', data.assessmentNode.CorrectAnswer, 'type:', typeof data.assessmentNode.CorrectAnswer);
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
	$inspect('options', options);
	let childrenNodes = $derived(assessmentNode.Children ?? []);
	let displayCode = $derived(assessmentNode.DisplayCode);
	let sequence = $derived(assessmentNode.Sequence);
	let tags_ = $derived(Array.isArray(assessmentNode?.Tags) ? assessmentNode.Tags : []);
	let tags = $derived(tags_.join(', '));
	let correctAnswer = $derived(assessmentNode.CorrectAnswer ?? null);
	let resolutionScore = $derived(assessmentNode.Score ?? 'Not specified');

    let rawData = $state(
                        typeof data.assessmentNode.RawData === 'string'
                            ? data.assessmentNode.RawData
                            : data.assessmentNode.RawData
                            ? JSON.stringify(data.assessmentNode.RawData, null, 2)
                            : ''
                        );
	let isJsonData = $derived(rawData !== 'Not specified' && rawData !== assessmentNode.RawData);

	let fieldIdentifier = $derived(assessmentNode.FieldIdentifier !== null && assessmentNode.FieldIdentifier!== '' ? assessmentNode.FieldIdentifier : 'Not specified' );
	let fieldIdentifierUnit = $derived(assessmentNode.FieldIdentifierUnit !== null && assessmentNode.FieldIdentifierUnit!== '' ? assessmentNode.FieldIdentifierUnit : 'Not specified' );

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

	let model = $state(false);
	const closeModal = async () => {
		model = false;
	};

	function toLabel(identifier: string) {
		const parts = identifier.split(':');
		const lastPart = parts[parts.length - 1];
		return lastPart.replace(/([a-z])([A-Z])/g, '$1 $2'); // adds space before capital letters
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
    const createPathRoute = (optionId) => `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/create`
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

	const handleDeletePathClick = (path: any) => {
		openDeletePathModal = true;
		pathToBeDeleted = path;
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

	const handlePathDelete = async () => {
		if (!pathToBeDeleted) return;
		
		isDeletingPath = true;
		try {
			const response = await fetch(
				`/api/server/assessments/paths/${pathToBeDeleted.id}?templateId=${templateId}&nodeId=${nodeId}`,
				{
					method: 'DELETE',
					headers: { 'content-type': 'application/json' }
				}
			);

			const res = await response.json();

			if (res.HttpCode === 200) {
				toastMessage(res);
				openDeletePathModal = false;
				pathToBeDeleted = null;
				await invalidateAll();
			} else {
				toastMessage(res);
			}
		} catch (error) {
			console.error('Error deleting path:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Error deleting path'
			});
		} finally {
			isDeletingPath = false;
		}
	};

</script>


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
				<td class="table-label">Required</td>
				<td class="table-data">
					{assessmentNode.Required ? 'True' : 'False'}
				</td>
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
							{#if queryType === 'Single Choice Selection'}
								<div class="space-y-2">
									{#each options as option, index}
										{@const optionSequence = option.Sequence}
										{@const existingPath = assessmentNode.Paths?.find(path => 
											path.Condition?.SecondOperand?.Value === optionSequence
										)}
										<div class="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
											<span class="font-medium">{optionSequence}. {option.Text}</span>
											<div class="flex items-center gap-2">
												{#if existingPath}
													<Button 
														href={`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${option.id}/paths/${existingPath.id}/view`}
														text="View Path" 
														variant="secondary" 
														iconBefore="mdi:eye" 
														iconSize="sm"
													/>
													<Button 
														href={`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${option.id}/paths/${existingPath.id}/edit`}
														text="Edit Path" 
														variant="primary" 
														iconBefore="mdi:edit" 
														iconSize="sm"
													/>
													<Button 
														onclick={() => handleDeletePathClick({...existingPath, optionId: option.id})}
														text="Delete Path" 
														variant="outline" 
														iconBefore="mdi:delete" 
														iconSize="sm"
													/>
												{:else}
													<Button 
														href={createPathRoute(option.id)}
														text="Add Path" 
														variant="secondary" 
														iconBefore="mdi:plus" 
														iconSize="sm"
													/>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<ol class="ml-3 list-decimal">
									{#each options as option}
										<li>{option.Text}</li>
									{/each}
								</ol>
							{/if}
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
				{:else if queryType === 'Boolean'}
					<tr class="tables-row">
						<td class="table-label">Correct Answer</td>
						<td class="table-data">
							{#if correctAnswer !== null && correctAnswer !== undefined}
								{(() => {
									// Handle all possible boolean representations
									if (correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1') {
										return 'True';
									} else if (correctAnswer === false || correctAnswer === 'false' || correctAnswer === 0 || correctAnswer === '0') {
										return 'False';
									} else {
										return 'Invalid';
									}
								})()}
							{:else}
								<span>Not specified</span>
							{/if}
						</td>
					</tr>
				{/if}
				{#if $scoringApplicableCondition === true}
					<tr class="tables-row">
						<td class="table-label">Score</td>
						<td class="table-data">
							<div class="flex items-center justify-between">
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

<Confirmation
	bind:isOpen={openDeletePathModal}
	title="Delete Path"
	message="Are you sure you want to delete this path? This action cannot be undone."
	onConfirm={handlePathDelete}
	confirmText="Delete Path"
	cancelText="Cancel"
/>
