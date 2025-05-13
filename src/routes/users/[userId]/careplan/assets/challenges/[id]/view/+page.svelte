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
			name: 'Challenges',
			path: challengesRoute
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
					<th>View Challenges</th>
					<th class="text-end">
						<a href={assetRoute} class=" cancel-btn">
							<Icon icon="material-symbols:close-rounded" class="" />
						</a>
					</th>
				</tr>
			</thead>
			<tbody>
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
					<td>Tags</td>
					<td>
						{#if tags.length <= 0}
							<span class="span">Tags not specified</span>
						{:else}
							<span class="span">{tags}</span>
						{/if}
					</td>
				</tr>
				<tr>
					<td>Version</td>
					<td>{version}</td>
				</tr>
		</tbody>
	</table>
</div>
</div>
</div>
