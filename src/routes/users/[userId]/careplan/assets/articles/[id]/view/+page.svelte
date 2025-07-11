<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const articleId = page.params.id;
	const selectedAssetType = 'Article';
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${selectedAssetType}`;
	const editRoute = `/users/${userId}/careplan/assets/articles/${articleId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/articles/${articleId}/view`;
	const articleRoute = `/users/${userId}/careplan/assets/articles/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.article.AssetCode;
	let name = data.article.Name;
	let summary = data.article.Description !== null ? data.article.Summary : 'Not specified';
	let pathUrl = data.article.Url !== null ? data.article.Url : 'Not specified';
	let tags_ = data.article.Tags;
	let version = data.article.Version;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Article',
			path: articleRoute
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
		<Heading text="View Article" />
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
				<Label text="Summary" />
				<td class="table-data">{summary}</td>
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
