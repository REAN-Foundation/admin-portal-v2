<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var consultationId = page.params.id;

	const assetType = page.url.searchParams.get('assetType') || 'Consultation';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const editRoute = `/users/${userId}/careplan/assets/consultations/${consultationId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/consultations/${consultationId}/view`;
	const consultationRoute = `/users/${userId}/careplan/assets/consultations/create`;

	let { data }: { data: PageServerData } = $props();

	let consultation = $state(data.consultation);
	let assetCode = consultation.AssetCode;
	let name = consultation.Name;
	let description = consultation.Description !== null ? consultation.Description : 'Not specified';
	let consultationType = consultation.ConsultationType;
	let tags_ = consultation.Tags;
	let tags = tags_.join(', ');
	let version = consultation.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Consultation',
			path: consultationRoute
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
		<h2 class="form-titles">View Consultation</h2>
		<a href={assetRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Asset Code</td>
				<td class="table-data">{assetCode}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Consultation Type</td>
				<td class="table-data">{consultationType}</td>
			</tr>
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
			<tr class="tables-row">
				<td class="table-label">Version</td>
				<td class="table-data">{version}</td>
			</tr>
		</tbody>
	</table>

	<div class=" btn-container">
        <Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
        ></Button>
	</div>
</div>

