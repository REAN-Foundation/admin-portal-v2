<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let id = data.priority.id;

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/priorities/${id}/edit`;
	const viewRoute = `/users/${userId}/priorities/${id}/view`;
	const priorityRoute = `/users/${userId}/priorities`;

	let type = data.priority.Type;
	let tags_ = data.priority.Tags;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Priorities',
			path: priorityRoute
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
		<h2 class="form-titles">View Priority</h2>
		<a href={priorityRoute} class="cancel-btn">
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
	<div class="btn-container">
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span class="ml-1">Edit</span>
		</a>
	</div>
</div>
