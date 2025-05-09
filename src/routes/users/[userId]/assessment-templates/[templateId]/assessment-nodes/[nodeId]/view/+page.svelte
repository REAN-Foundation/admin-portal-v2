<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	// import UpdateScoringCondition from '$lib/components/modal/update.scoring.condition.modal.svelte';
	import { scoringApplicableCondition, showScoringConditionModal } from '$lib/store/general.store';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	// import Confirm from '$lib/components/modal/confirm.modal.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	// import Confirmation from '$lib/components/confirmation.modal.svelte';

	////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let sessionId = data.sessionId;
	let assessmentNodes = $state(data.assessmentNode);

	let nodeType = assessmentNodes.NodeType;
	let title = assessmentNodes.Title;
	let description =
		assessmentNodes.Description !== null && assessmentNodes.Description !== ''
			? assessmentNodes.Description
			: 'Not specified';
	let message = assessmentNodes.Message !== null ? assessmentNodes.Message : 'Not specified';
	let serveListNodeChildrenAtOnce = assessmentNodes.ServeListNodeChildrenAtOnce ?? null;
	let queryType = assessmentNodes.QueryResponseType;
	let options = assessmentNodes.Options ?? [];
	let childrenNodes = assessmentNodes.Children ?? [];
	let displayCode = assessmentNodes.DisplayCode;
	let sequence = assessmentNodes.Sequence;
	let tags_ = Array.isArray(assessmentNodes?.Tags) ? assessmentNodes.Tags : [];
	let tags = tags_.join(', ');
	let correctAnswer = assessmentNodes.CorrectAnswer ?? null;

	let resolutionScore = $state();

	if (nodeType === 'Question') {
		resolutionScore = assessmentNodes.ScoringCondition?.ResolutionScore;
	}

	scoringApplicableCondition.set(data.templateScoringCondition.ScoringApplicable);

	// console.log('assessmentNode', assessmentNodes);

	const userId = $page.params.userId;
	const templateId = $page.params.templateId;
	const nodeId = $page.params.nodeId;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;
	const editRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/edit`;
	const viewRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const assessmentNodeRoutes = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes`;
	const createNodeRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/create`;
	const assessmentTemplateView = `/users/${userId}/assessment-templates/${templateId}/view`;
	const editNodeRoute = (id) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${id}/edit`;

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
			name: 'View',
			path: viewRoute
		}
	];
	const handleAssessmentNodeDelete = async (id) => {
		const assessmentNodeId = id;
		console.log('assessmentNodeId', assessmentNodeId);
		const model = {
			sessionId: data.sessionId,
			assessmentTemplateId: templateId,
			assessmentNodeId: assessmentNodeId
		};
		await fetch(`/api/server/assessments/assessment-nodes`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		window.location.href = viewRoute;
	};

	// async function Delete(model) {
	// 	await fetch(`/api/server/assessments/assessment-nodes`, {
	// 		method: 'DELETE',
	// 		body: JSON.stringify(model),
	// 		headers: { 'content-type': 'application/json' }
	// 	});
	// 	console.log();
	// }

	const onUpdateScoringCondition = async (resolutionScore: number) => {
		const scoringId = data.assessmentNode.ScoringCondition.id;
		console.log(scoringId);
		await updateScoringCondition({
			sessionId,
			templateId,
			nodeId,
			scoringConditionId: data.assessmentNode.ScoringCondition.id,
			resolutionScore: resolutionScore
		});
	};

	async function updateScoringCondition(model) {
		const response = await fetch(`/api/server/assessment-nodes/update-scoring-condition`, {
			method: 'POST',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
		const resp = await response.text();
		const scoringCondition = JSON.parse(resp);
		resolutionScore = scoringCondition.ResolutionScore;
		console.log(response);
	}
</script>

<!-- <UpdateScoringCondition
	on:updateScoringCondition={async (e) => await onUpdateScoringCondition(e.detail.resolutionScore)}
/> -->

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		{#if nodeType === 'Node list'}
			<a
				href={createNodeRoute}
				class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
				>Add child</a
			>
		{/if}
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>

	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Assessment Node</th>
						<th class="text-end">
							<a href={assessmentNodeRoutes} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Node Type</td>
						<td>{nodeType}</td>
					</tr>
					<tr>
						<td>Parent Node</td>
						<td>{displayCode}</td>
					</tr>
					<tr>
						<td>Title</td>
						<td>{title}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
					<tr>
						<td>Sequence</td>
						<td>{sequence}</td>
					</tr>
					<tr>
						<td>Tags</td>
						<td>
							{#if tags.length <= 0}
								<span class="span">Tags not specified</span>
							{:else}
								<span class="span">{tags}</span>
							{/if}
						</td>
					</tr>
					{#if nodeType === 'Question'}
						<tr>
							<td>Query Response Type</td>
							<td>{queryType}</td>
						</tr>
						{#if options.length > 0}
							<tr>
								<td class="align-top">Options</td>
								<td>
									<ol class="ml-3 list-decimal">
										{#each options as option}
											<li>{option.Text}</li>
										{/each}
									</ol>
								</td>
							</tr>
						{/if}
						{#if queryType === 'Single Choice Selection'}
							<tr>
								<td>Correct Answer</td>
								<td>
									{#if correctAnswer}
										{#if options.length > 0}
											{#each options as option}
												{#if option.Sequence == correctAnswer}
													{option.Text}
												{/if}
											{/each}
											<!-- {:else}
								<span class="span" >No options available</span> -->
										{/if}
									{:else}
										<span class="span">Not specified</span>
									{/if}
								</td>
							</tr>
						{/if}
						{#if $scoringApplicableCondition === true}
							<tr>
								<td>Resolution Score</td>
								<td>
									<div class="flex items-center">
										<span>{resolutionScore}</span>

										<button
											onclick={async () => showScoringConditionModal.set(true)}
											class="px-2 text-center text-gray-500 hover:text-blue-600"
										>
											<Icon icon="material-symbols:edit-outline" class="text-lg" />
										</button>
									</div>
								</td>
							</tr>
						{/if}
					{:else if nodeType === 'Message'}
						<tr>
							<td>Message</td>
							<td>{message}</td>
						</tr>
					{:else if nodeType === 'Node list'}
						<tr>
							<td>Serve List Node Children At Once</td>
							<td>{serveListNodeChildrenAtOnce}</td>
						</tr>
						<tr>
							<td class="align-top">Children Nodes</td>
							<td>
								{#if childrenNodes.length <= 0}
									<span class="span">Children nodes not available!</span>
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
														<!-- <td>
															<a
																href={editNodeRoute(node.id)}
																class="btn hover:variant-soft-primary -my-1 p-2"
															>
																<Icon icon="material-symbols:edit-outline" class="text-lg" />
															</a>
														</td> -->
														<td role="gridcell" aria-colindex={2} tabindex="0">
															<div class="flex">
																<Tooltip text="Edit" forceShow={true}>
																	<button class="">
																		<a
																			href={editNodeRoute(node.id)}
																			class="health-system-btn group"
																		>
																			<Icon
																				icon="material-symbols:edit-outline"
																				class="health-system-icon"
																			/>
																		</a>
																	</button>
																</Tooltip>

																<Tooltip text="View" forceShow={true}>
																	<button>
																		<a href={viewRoute} class=" health-system-btn group"
																			><Icon
																				icon="icon-park-outline:preview-open"
																				class="health-system-icon"
																			/>
																		</a>
																	</button>
																</Tooltip>

																<Tooltip text="Delete" forceShow={true}>
																	<button
																		class="health-system-btn !text-red-600"
																		onclick={() => handleAssessmentNodeDelete(node.id)}
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
		</div>
	</div>
</div>

<!-- <Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete Assessment Template"
	onConfirm={handleAssessmentNodeDelete}
	id={idToBeDeleted}
/> -->
