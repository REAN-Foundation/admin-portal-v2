<script lang="ts">
	import CollapsibleSection from './collapsibleSection.svelte';
	import Icon from '@iconify/svelte';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { userId, careplanId, classifiedByDay ,handleCareplanScheduleDelete} = $props();

	const viewRoute = (id) =>
		`/users/${userId}/careplan/careplans/${careplanId}/scheduling/${id}/view`;
	const editRoute = (id) =>
		`/users/${userId}/careplan/careplans/${careplanId}/scheduling/${id}/edit`;

</script>

<section class="space-y-4 overflow-auto bg-white p-4 dark:bg-inherit">
	{#each classifiedByDay.slice().sort((a, b) => a.Day - b.Day) as day, i}
		<CollapsibleSection headerText={`Day ${day.Day}`}>
			<div class="border-secondary-100 dark:border-surface-700 overflow-x-auto rounded-lg border">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class="text px-4 py-2">Id</th>
							<th class="text px-4 py-2">Asset Type</th>
							<th class="text px-4 py-2">Code</th>
							<th class="text px-4 py-2">Time Slot</th>
							<th class="text px-4 py-2 text-center" colspan="2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each day.Activities as activity, i}
							<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800">
								<td class="text">{i + 1}</td>
								<td class="text">{activity.AssetType}</td>
								<td class="text">{activity.Code}</td>
								<td class="text">{activity.TimeSlot}</td>
								<td class="text">
									<Tooltip text="Edit" forceShow={true}>
										<button class="">
											<a href={editRoute(activity.id)} class="health-system-btn group">
												<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
											</a>
										</button>
									</Tooltip>
								</td>
								<td>
									<Tooltip text="View" forceShow={true}>
										<button>
											<a href={viewRoute(activity.id)} class=" health-system-btn group"
												><Icon icon="icon-park-outline:preview-open" class="health-system-icon" />
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
</section>
