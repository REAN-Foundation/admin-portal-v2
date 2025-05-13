<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var audioId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/audio/${audioId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/audio/${audioId}/view`;
	const audioRoute = `/users/${userId}/careplan/assets/audio`;

	let { data }: { data: PageServerData } = $props();

	let audio = $state(data.audio);
	let assetCode = audio.AssetCode;
	let name = audio.Name;
	let transcript = audio.Transcript !== null ? audio.Transcript : 'Not specified';
	let pathUrl = (audio.Url !== null && audio.PathUrl !== '') ? audio.PathUrl : 'Not specified';
	let tags_ = audio.Tags;
	let tags = tags_.join(', ');
	let version = audio.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Audio',
			path: audioRoute
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
					<th>View Audio</th>
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
					<td>Transcript</td>
					<td>{transcript}</td>
				</tr>
				<tr>
					<td>Path Url</td>
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
				<tr>
					<td>Version</td>
					<td>{version}</td>
				</tr>
		</tbody>
	</table>
</div>
</div>
</div>
