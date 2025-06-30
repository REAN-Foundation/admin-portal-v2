<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	///////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const videoId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/video/${videoId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/video/${videoId}/view`;
	const videoRoute = `/users/${userId}/careplan/assets/video/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.video.AssetCode;
	let name = data.video.Name;
	let transcript = data.video.Transcript !== null ? data.video.Transcript : 'Not specified';
	let pathUrl = data.video.Url !== null ? data.video.Url : 'Not specified';
	let tags_ = data.video.Tags;
	let version = data.video.Version;
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
		<Heading text="View Video" />
		<a href={assetRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Asset Code" />
				<td class="table-data">{assetCode}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Transcript" />
				<td class="table-data">{transcript}</td>
			</tr>
			<tr class="tables-row">
				<Label text="URL" />
				<td class="table-data">{pathUrl}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Tags" />
				<td class="table-data">
					{#if tags.length <= 0}
						<span>Tags not specified</span>
					{:else}
						<span>{tags}</span>
					{/if}
				</td>
			</tr>
			<tr class="tables-row">
				<Label text="Version" />
				<td class="table-data">{version}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
			size="md"
		/>
	</div>
</div>
