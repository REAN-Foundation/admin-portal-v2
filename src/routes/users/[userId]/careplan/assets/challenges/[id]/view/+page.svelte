<script lang="ts">
	// import type { PageServerData } from './$types';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var challengesId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/challenges/${challengesId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/challenges/${challengesId}/view`;
	const challengesRoute = `/users/${userId}/careplan/assets/challenges`;

	let { data }: { data: PageServerData } = $props();

	let challenges = $state(data.challenges);
	let assetCode = challenges.AssetCode;
	let name = challenges.Name;
	let description = challenges.Description !== null ? challenges.Description : 'Not specified';
	let tags_ = challenges.Tags;
	let tags = tags_.join(', ');
	let version = challenges.Version;

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
		<h2 class="form-titles">View Challenges</h2>
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
