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
						<div
							class="border-secondary-100 dark:border-surface-700 overflow-x-auto rounded-lg border"
						>
							<table class="health-system-table min-w-full table-auto text-sm">
								<thead class="bg-secondary-50 dark:bg-surface-800 text-left">
									<tr class="text-secondary-800 dark:text-black">
										<th class="text px-4 py-2">Id</th>
										<th class="text px-4 py-2">Asset Type</th>
										<th class="text px-4 py-2">Code</th>
										<th class="text px-4 py-2">Time Slot</th>
										<th class="text px-4 py-2 text-center" colspan="2">Actions</th>
									</tr>
								</thead>
								<tbody class="divide-secondary-100 dark:divide-surface-700 divide-y">
									{#each day.Activities as activity, k}
										<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800">
											<td class="text px-4 py-2">{k + 1}</td>
											<td class="text px-4 py-2">{activity.AssetType}</td>
											<td class="text px-4 py-2">{activity.Code}</td>
											<td class="text px-4 py-2">{activity.TimeSlot}</td>
											<td class="text px-2 py-2 text-center">
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
											</td>
											<td>
												<Tooltip text="View" forceShow={true}>
													<button>
														<a href={viewRoute(activity.id)} class=" health-system-btn group"
															><Icon
																icon="icon-park-outline:preview-open"
																class="health-system-icon"
															/>
														</a>
													</button>
												</Tooltip>
											</td>
											<td class="px-2 py-2 text-center">
												<Tooltip text="Delete" forceShow={true}>
													<button
														class="health-system-btn !text-red-600"
														onclick={() => handleCareplanScheduleDelete(activity.id)}
													>
														<Icon icon="material-symbols:delete-outline-rounded" />
													</button>
												</Tooltip>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</CollapsibleSection>
				{/each}
			</div>
		</CollapsibleSection>
	{/each}
</section>
