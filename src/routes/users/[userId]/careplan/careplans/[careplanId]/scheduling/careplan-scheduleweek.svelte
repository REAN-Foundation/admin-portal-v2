<script lang="ts">
	import CollapsibleSection from './collapsibleSection.svelte';
	import Icon from '@iconify/svelte';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { userId, careplanId, classifiedByWeek, handleCareplanScheduleDelete } = $props();

	const viewRoute = (id) =>
		`/users/${userId}/careplan/careplans/${careplanId}/scheduling/${id}/view`;
	const editRoute = (id) =>
		`/users/${userId}/careplan/careplans/${careplanId}/scheduling/${id}/edit`;
		console.log('classifiedByWeek',classifiedByWeek);
</script>

<section class="space-y-4 overflow-auto bg-white p-4 dark:bg-inherit">
	{#each classifiedByWeek as week, i}
		<CollapsibleSection headerText={`Week ${week.Week}`}>
			<div class="space-y-4">
				{#each week.Days as day, j}
					<CollapsibleSection headerText={`Day ${day.Day}`}>
						<div class="health-system-table-container mb-6 shadow">
							<div class="overflow-x-auto">
								<table class="health-system-table min-w-full">
									<thead>
										<tr>
											<th class="w-12">Id</th>
											<th class="text-start">Asset Type</th>
											<th class="text-start">Code</th>
											<th class="text-start">Time Slot</th>
											<th class="w-20 text-center">Actions</th>
										</tr>
									</thead>
									<tbody>
										{#each day.Activities as activity, k}
											<tr>
												<td>{k + 1}</td>
												<td>{activity.AssetType}</td>
												<td>{activity.Code}</td>
												<td>{activity.TimeSlot}</td>
												<td>
													<div class="flex">
														<Tooltip text="Edit" forceShow={true}>
															<button class="">
																<a href={editRoute(activity.id)} class="health-system-btn group">
																	<Icon
																		icon="material-symbols:edit-outline"
																		class="health-system-icon"
																	/>
																</a>
															</button>
														</Tooltip>
														<Tooltip text="View" forceShow={true}>
															<button>
																<a href={viewRoute(activity.id)} class="health-system-btn group">
																	<Icon
																		icon="icon-park-outline:preview-open"
																		class="health-system-icon"
																	/>
																</a>
															</button>
														</Tooltip>
														<Tooltip text="Delete" forceShow={true}>
															<button
																class="health-system-btn !text-red-600"
																onclick={() => handleCareplanScheduleDelete(activity.id)}
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
						</div>
					</CollapsibleSection>
				{/each}
			</div>
		</CollapsibleSection>
	{/each}
</section>
