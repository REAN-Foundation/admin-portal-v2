<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var biometricsId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/biometrics/${biometricsId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/biometrics/${biometricsId}/view`;
	const createRoute = `/users/${userId}/careplan/assets/biometrics/create`;

	let { data }: { data: PageServerData } = $props();

	let biometrics = $state(data.biometrics);
	let assetCode = biometrics.AssetCode;
	let name = biometrics.Name;
	let description = biometrics.Description !== null ? biometrics.Description : 'Not specified';
	let biometricsType = biometrics.BiometricsType;
	let measurementUnit = biometrics.MeasurementUnit;
	let tags_ = biometrics.Tags;
	let tags = tags_.join(', ');
	let version = biometrics.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
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
			<h2 class="form-title">View Biometrics</h2>
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
					<td class="form-td-left">Biometrics Type</td>
					<td class="form-td-right">{biometricsType}</td>
				</tr>
				<tr>
					<td class="form-td-left">Measurement Unit</td>
					<td class="form-td-right">{measurementUnit}</td>
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
