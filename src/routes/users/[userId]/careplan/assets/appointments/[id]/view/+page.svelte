<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////////////

	const userId = $page.params.userId;
	const appointmentId = $page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/appointments/${appointmentId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/appointments/${appointmentId}/view`;
	const appointmentRoute = `/users/${userId}/careplan/assets/appointments/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.appointment.AssetCode;
	let name = data.appointment.Name;
	let description =
		data.appointment.Description !== null ? data.appointment.Description : 'Not specified';
	let appointmentType = data.appointment.AppointmentType;
	let tags_ = data.appointment.Tags;
	let version = data.appointment.Version;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Appointment',
			path: appointmentRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-4">
		<a href={editRoute} class="edit-btn variant-filled-secondary hover:!variant-soft-secondary">
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
	<div class="forms-container">
		<div class="form-header">
			<h2 class="form-title">View Appointment</h2>
			<a href={assetRoute} class="cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="form-table">
			<tbody>
				<tr>
					<td class="form-td-left">Asset Code</td>
					<td class="form-td-right">{assetCode}</td>
				</tr>
				<tr>
					<td class="form-td-left">Name</td>
					<td class="form-td-right">{name}</td>
				</tr>
				<tr>
					<td class="form-td-left">Description</td>
					<td class="form-td-right">{description}</td>
				</tr>
				<tr>
					<td class="form-td-left">Appointment Type</td>
					<td class="form-td-right">{appointmentType}</td>
				</tr>
				<tr>
					<td class="form-td-left">Tags</td>
					<td class="form-td-right">
						{#if tags.length <= 0}
							<span>Tags not specified</span>
						{:else}
							<span>{tags}</span>
						{/if}
					</td>
				</tr>
				<tr>
					<td class="form-td-left">Version</td>
					<td class="form-td-right">{version}</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
