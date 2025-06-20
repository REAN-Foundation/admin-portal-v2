<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	//////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const nutritionId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/nutritions/${nutritionId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/nutritions/${nutritionId}/view`;
	const nutritionRoute = `/users/${userId}/careplan/assets/nutritions/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.nutrition.AssetCode;
	let name = data.nutrition.Name;
	let description =
		data.nutrition.Description !== null ? data.nutrition.Description : 'Not specified';
	let tags_ = data.nutrition.Tags;
	let version = data.nutrition.Version;
	let tags = tags_.join(', ');

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
	<div class="form-headers">
		<h2 class="form-titles">View Nutrition</h2>
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
