<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var physiotherapyId = page.params.id;
	const assetType = 'Physiotherapy';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const editRoute = `/users/${userId}/careplan/assets/physiotherapy/${physiotherapyId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/physiotherapy/${physiotherapyId}/view`;
	const physiotherapyRoute = `/users/${userId}/careplan/assets/physiotherapy/create`;

	let { data }: { data: PageServerData } = $props();

	let physiotherapy = $state(data.physiotherapy);
	let assetCode = physiotherapy.AssetCode;
	let name = physiotherapy.Name;
	let description =
		physiotherapy.Description !== null ? physiotherapy.Description : 'Not specified';
	let recommendedDurationMin = physiotherapy.RecommendedDurationMin;
	let tags_ = physiotherapy.Tags;
	let tags = tags_.join(', ');
	let version = physiotherapy.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Physiotherapy',
			path: physiotherapyRoute
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
		<Heading text="View Physiotherapy" />
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
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Recommended Duration Min" />
				<td class="table-data">{recommendedDurationMin}</td>
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
