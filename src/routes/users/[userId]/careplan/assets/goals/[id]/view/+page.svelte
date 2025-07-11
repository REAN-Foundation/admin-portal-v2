<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var goalsId = page.params.id;
	// Get asset type from URL params or default to 'Goal'
	const assetType = page.url.searchParams.get('assetType') || 'Goal';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const editRoute = `/users/${userId}/careplan/assets/goals/${goalsId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/goals/${goalsId}/view`;
	const goalsRoute = `/users/${userId}/careplan/assets/goals/create`;

	let { data }: { data: PageServerData } = $props();

	let goals = $state(data.goals);
	let assetCode = goals.AssetCode;
	let name = goals.Name;
	let description = goals.Description !== null ? goals.Description : 'Not specified';
	let tags_ = goals.Tags;
	let tags = tags_.join(', ');
	let version = goals.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Goal',
			path: goalsRoute
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
		<h2 class="form-titles">View Goal</h2>
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
