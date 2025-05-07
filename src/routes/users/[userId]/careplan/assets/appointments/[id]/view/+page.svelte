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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View Action Plan</th>
						<th class="text-end">
							<a href={assetRoute} class="table-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" class="" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody class="!bg-white dark:!bg-inherit"> </tbody><tbody>
					<tr>
						<td>Asset Code</td>
						<td>{assetCode}</td>
					</tr>
					<tr>
						<td>Name</td>
						<td>{name}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
					<tr>
						<td>Appointment Type</td>
						<td>{appointmentType}</td>
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
					<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
						<td>Version</td>
						<td>{version}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
