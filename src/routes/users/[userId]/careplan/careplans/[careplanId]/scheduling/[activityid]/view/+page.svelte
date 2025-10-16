<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
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
	let sequence = $state(data.careplanActivity.Sequence);

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
<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Careplan Activity</h2>
		<a href={schedulingRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Asset Type</td>
				<td class="table-data">{assetType}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Asset</td>
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Schedule Day</td>
				<td class="table-data">{day}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Time Slot</td>
				<td class="table-data">{timeslot}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Sequence</td>
				<td class="table-data">{sequence || 'Not specified'}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="material-symbols:edit-outline"
			iconSize="md"
		/>
	</div>
</div>
