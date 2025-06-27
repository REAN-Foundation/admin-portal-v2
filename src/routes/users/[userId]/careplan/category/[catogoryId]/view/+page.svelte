<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var categoryId = page.params.catogoryId;
	const editRoute = `/users/${userId}/careplan/category/${categoryId}/edit`;
	const viewRoute = `/users/${userId}/careplan/category/${categoryId}/view`;
	const categoryRoute = `/users/${userId}/careplan/category`;
	let { data }: { data: PageServerData } = $props();
	let careplanCategory = $state(data.careplanCategory);
	let categoryType = careplanCategory.Type ;
	let categoryDescription = careplanCategory.Description;
	const breadCrumbs = [
		{
			name: 'Careplan Categories',
			path: categoryRoute
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
		<h2 class="form-titles">View Careplan Category</h2>
		<a href={categoryRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Type</td>
				<td class="table-data">{categoryType}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">
					{#if !categoryDescription || categoryDescription.length <= 0}
						<span>Description not specified</span>
					{:else}
						<span>{categoryDescription}</span>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
	<div class="btn-container">
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"></Button>
	</div>
</div>
