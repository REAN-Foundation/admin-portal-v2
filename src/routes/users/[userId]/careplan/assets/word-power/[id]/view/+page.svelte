<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	/////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const wordPowerId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/word-power/${wordPowerId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/word-power/${wordPowerId}/view`;
	const wordpowerRoute = `/users/${userId}/careplan/assets/word-power/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.wordPower.AssetCode;
	let name = data.wordPower.Name;
	let description =
		data.wordPower.Description !== null ? data.wordPower.Description : 'Not specified';
	let additionalResources = data.wordPower.AdditionalResources;
	let tags_ = data.wordPower.Tags;
	let version = data.wordPower.Version;
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
	<div class="flex flex-wrap justify-end gap-2 py-4">
		<a href={editRoute} class="edit-btn variant-filled-secondary hover:!variant-soft-secondary">
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
	<div class="forms-container">
		<div class="form-header">
			<h2 class="form-title">View Word-Power</h2>
			<a href={assetRoute} class="cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="form-table">
			<tbody>
				<tr>
					<td class="form-td-left">Asset Code</td>
					<td class="form-td-right">{assetCode}</td>
				</tr>
				<tr>
					<td class="form-td-left">Name</td>
					<td class="form-td-right">{name}</td>
				</tr>
				<tr>
					<td class="form-td-left">Description</td>
					<td class="form-td-right">{description}</td>
				</tr>
				<tr>
					<td class="form-td-left">Additional Resources</td>
					<td class="form-td-right">{additionalResources}</td>
				</tr>
				<tr>
					<td class="form-td-left">Tags</td>
					<td class="form-td-right">
						{#if tags.length <= 0}
							<span>Tags not specified</span>
						{:else}
							<span>{tags}</span>
						{/if}
					</td>
				</tr>
				<tr>
					<td class="form-td-left">Version</td>
					<td class="form-td-right">{version}</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
