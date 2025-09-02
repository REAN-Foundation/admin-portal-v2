<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let id = data.goal.id;
	let type = data.goal.Type;
	let tags_ = data.goal.Tags;
	let tags = tags_.join(', ');

	const userId = $page.params.userId;
	const editRoute = `/users/${userId}/goals/${id}/edit`;
	const viewRoute = `/users/${userId}/goals/${id}/view`;
	const goalRoute = `/users/${userId}/goals`;

	const breadCrumbs = [
		{
			name: 'Goals',
			path: goalRoute
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
		<h2 class="form-titles">View Goal</h2>
		<a href={goalRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Type</td>
				<td class="table-data">{type}</td>
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
		</tbody>
	</table>
	<div class=" btn-container">
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
		></Button>
	</div>
</div>
