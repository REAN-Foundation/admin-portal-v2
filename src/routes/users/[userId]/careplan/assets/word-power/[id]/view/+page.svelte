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
			name: 'Word-Power',
			path: wordpowerRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View Word power</th>
						<th class="text-end">
							<a href={assetRoute} class="table-btn variant-soft-secondary">
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
						<td>Additional Resources</td>
						<td>{additionalResources}</td>
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
