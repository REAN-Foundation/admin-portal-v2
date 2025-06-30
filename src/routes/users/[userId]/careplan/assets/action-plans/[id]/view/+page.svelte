<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const actionPlanId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/action-plans/${actionPlanId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/action-plans/${actionPlanId}/view`;
	const actionPlanRoute = `/users/${userId}/careplan/assets/action-plans/create`;

	let { data }: { data: PageServerData } = $props();

	let assetCode = data.actionPlan.AssetCode;
	let name = data.actionPlan.Name;
	let description =
		data.actionPlan.Description !== null ? data.actionPlan.Description : 'Not specified';
	let tags_ = data.actionPlan.Tags;
	let version = data.actionPlan.Version;
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
		<Heading text="View Action Plan" />
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
