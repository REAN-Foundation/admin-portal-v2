<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	///////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const animationId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/animations/${animationId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/animations/${animationId}/view`;
	const animationRoute = `/users/${userId}/careplan/assets/animations/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.animation.AssetCode;
	let name = data.animation.Name;
	let transcript = data.animation.Transcript !== null ? data.animation.Transcript : 'Not specified';
	let pathUrl = data.animation.PathUrl !== null ? data.animation.PathUrl : 'Not specified';
	let tags_ = data.animation.Tags;
	let version = data.animation.Version;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Animation',
			path: animationRoute
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
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View Animation</th>
						<th class="text-end">
							<a href={assetRoute} class="cancel-btn">
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
						<td>Transcript</td>
						<td>{transcript}</td>
					</tr>

					<tr>
						<td>Url</td>
						<td>{pathUrl}</td>
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
