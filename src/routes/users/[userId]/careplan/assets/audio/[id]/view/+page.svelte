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
	const audioRoute = `/users/${userId}/careplan/assets/audio/create`;

	let { data }: { data: PageServerData } = $props();

	let audio = $state(data.audio);
	let assetCode = audio.AssetCode;
	let name = audio.Name;
	let transcript = data.audio.Transcript !== null ? data.audio.Transcript : 'Not specified';
	let pathUrl = data.audio.Url !== null ? data.audio.Url : 'Not specified';
	let tags_ = data.audio.Tags;
	let tags = tags_.join(', ');
	let version = data.audio.Version;

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
		<h2 class="form-title">View Audio</h2>
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
					<td class="table-label">Transcript</td>
					<td class="table-data">{transcript}</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Url</td>
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
		<div class=" btn-container">
		<a
			href={editRoute}
			class="edit-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
</div>
