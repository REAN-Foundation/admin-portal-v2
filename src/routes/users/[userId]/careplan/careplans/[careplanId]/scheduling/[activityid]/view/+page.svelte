<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	const userId = page.params.userId;
	const careplanId = page.params.careplanId;
	const activityId = page.params.activityid;

	const careplansRoute = `/users/${userId}/careplan/careplans`;
	const editRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling/${activityId}/edit`;
	const viewRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling/${activityId}/view`;
	const schedulingRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling`;

	let assetType = $state(data.careplanActivity.AssetType);
	let name = $state(data.careplanActivity.Asset.Name);
	let timeslot = $state(data.careplanActivity.TimeSlot);
	let day = $state(data.careplanActivity.Day);

	const breadCrumbs = [
		{
			name: 'Careplans',
			path: careplansRoute
		},
		{
			name: 'Scheduling',
			path: schedulingRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
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
						<th>View Careplan Activity</th>
						<th class="text-end">
							<a href={schedulingRoute} class=" cancel-btn">
								<Icon icon="material-symbols:close-rounded" class="" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>AssetType</td>
						<td>{assetType}</td>
					</tr>
					<tr>
						<td>Asset</td>
						<td>{name}</td>
					</tr>
					<tr>
						<td>Schedule Day</td>
						<td>{day}</td>
					</tr>
					<tr>
						<td>Time Slot</td>
						<td>{timeslot}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
