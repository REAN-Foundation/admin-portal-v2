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
    console.log("careplanCategory==>",careplanCategory);
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

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<Button
			size="md"
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		></Button>
	</div>
	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Careplan Category</th>
						<th class="text-end">
							<a href={categoryRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Type</td>
						<td>{categoryType}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>
							{#if !categoryDescription || categoryDescription.length <= 0}
								<span class="span">Description not specified</span>
							{:else}
								<span class="span">{categoryDescription}</span>
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
