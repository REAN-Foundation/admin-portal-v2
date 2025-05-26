<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { scoringApplicableCondition, showScoringConditionModal } from '$lib/store/general.store';
	import UpdateScoringCondition from '$lib/components/modal/update.scoring.condition.modal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { page } from '$app/state';
	import { createOrUpdateSchema } from '$lib/validation/scoring.condition.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';

	////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let errors: Record<string, string> = $state({});
	let templateTitle = data.templateDetails.Title;

console.log('This is data',data)
	const assessmentNodes = $state(data.assessmentNode);
	console.log('assessmentNodes', assessmentNodes);

	const nodeType = assessmentNodes.NodeType;
	const title = assessmentNodes.Title;
	const description =
		assessmentNodes.Description !== null && assessmentNodes.Description !== ''
			? assessmentNodes.Description
			: 'Not specified';
	const message = assessmentNodes.Message !== null ? assessmentNodes.Message : 'Not specified';
	const serveListNodeChildrenAtOnce = assessmentNodes.ServeListNodeChildrenAtOnce ?? null;
	const queryType = assessmentNodes.QueryResponseType;
	const options = assessmentNodes.Options ?? [];
	const childrenNodes = assessmentNodes.Children ?? [];
	const displayCode = assessmentNodes.DisplayCode;
	const sequence = assessmentNodes.Sequence;
	const tags_ = Array.isArray(assessmentNodes?.Tags) ? assessmentNodes.Tags : [];
	const tags = tags_.join(', ');
	const correctAnswer = assessmentNodes.CorrectAnswer ?? null;
	const rawData =
		assessmentNodes.RawData !== null && assessmentNodes.RawData !== ''
			? assessmentNodes.RawData
			: 'Not specified';

	const fieldIdentifier = assessmentNodes.FieldIdentifier ?? null;
	const fieldIdentifierUnit = assessmentNodes.FieldIdentifierUnit ?? null;

	let resolutionScore = $state();

	if (nodeType === 'Question') {
		resolutionScore = assessmentNodes.ScoringCondition?.ResolutionScore ?? 'Not specified';
	}

	scoringApplicableCondition.set(data.templateDetails.ScoringApplicable);

	// console.log('assessmentNode', assessmentNodes);

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
		// const scoringId = data.assessmentNode.ScoringCondition.id;
		// console.log(scoringId);
		resolutionScore = score;
		console.log('resolutionScore', resolutionScore);
		handleSubmit(event);
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
			const scoringId = data.assessmentNode.ScoringCondition ?? undefined;

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

			// console.log(scoringId);
			const response = await res.json();
			// const scoringCondition = JSON.parse(resp);

			console.log('response', response);
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// goto(`${assessmentsRoutes}/${response?.Data?.AssessmentTemplate?.id}/view`);
				// resolutionScore = scoringCondition.ResolutionScore;
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

	// async function updateScoringCondition(model) {
	// 	const response = await fetch(`/api/server/assessment-nodes/update-scoring-condition`, {
	// 		method: 'POST',
	// 		body: JSON.stringify(model),
	// 		headers: { 'content-type': 'application/json' }
	// 	});
	// }
</script>

<!-- <UpdateScoringCondition
	on:updateScoringCondition={async (e) => await onUpdateScoringCondition(e.detail.resolutionScore)}
/> -->
{#if model}
	<UpdateScoringCondition {onUpdateScoringCondition} {closeModal} />
{/if}

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
			<span class="ml-1">Edit</span>
		</a>
	</div>

	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Node</th>
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
						<td>Raw Data</td>
						<td>{rawData}</td>
					</tr>
					<tr>
						<td>Sequence</td>
						<td>{sequence}</td>
					</tr>
					<tr>
						<td>Field Identifier</td>
						<td>{fieldIdentifier}</td>
					</tr>
					<tr>
						<td>Field Identifier Unit</td>
						<td>{fieldIdentifierUnit}</td>
					</tr><tr>
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

										<!-- <button
											onclick={openModal}
											class="px-2 text-center text-gray-500 hover:text-blue-600"
										>
											<Icon icon="material-symbols:edit-outline" class="text-lg" />
										</button> -->
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
