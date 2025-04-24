<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

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

<!-- <div class="flex flex-wrap gap-2">
	<a href={editRoute} class="btn variant-filled-secondary ml-auto">
		<Icon icon="material-symbols:edit-outline" />
		<span>Edit</span>
	</a>
</div> -->

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="admin-portal-v2-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Priority</th>
						<th class="text-end">
							<a href={priorityRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" class="" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Type</td>
						<td>{type}</td>
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
				</tbody>
			</table>
		</div>
	</div>
</div>
