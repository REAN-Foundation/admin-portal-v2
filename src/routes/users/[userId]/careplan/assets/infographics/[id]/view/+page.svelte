<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var infographicsId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/infographics/${infographicsId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/infographics/${infographicsId}/view`;
	const infographicsRoute = `/users/${userId}/careplan/assets/infographics`;

	let { data }: { data: PageServerData } = $props();

	let infographics = $state(data.infographics);
	let assetCode = infographics.AssetCode;
	let name = infographics.Name;
	let description = infographics.Description !== null ? infographics.Description : 'Not specified';
	let pathUrl = (infographics.Url !== null && infographics.Url !== '') ? infographics.Url : 'Not specified';
	let tags_ = infographics.Tags;
	let tags = tags_.join(', ');
	let version = infographics.Version;

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
		<h2 class="form-titles">View Infographics</h2>
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
				<td class="table-label">URL</td>
				<td class="table-data">{pathUrl}</td>
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

	<div class="btn-container">
		<a
			href={editRoute}
			class="edit-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
</div>
