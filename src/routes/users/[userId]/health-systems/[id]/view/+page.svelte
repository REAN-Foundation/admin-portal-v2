<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	////////////////////////////////////////////////////////

	const userId = $page.params.userId;
	var healthSystemId = $page.params.id;
	const editRoute = `/users/${userId}/health-systems/${healthSystemId}/edit`;
	const viewRoute = `/users/${userId}/health-systems/${healthSystemId}/view`;
	const healthSystemRoute = `/users/${userId}/health-systems`;

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let healthSystem = $state(data.healthSystem);
	let healthSystemName = healthSystem.Name;
	let tags_ = data.healthSystem.Tags;
	let tags = tags_.join(', ');

	const breadCrumbs = [
		{
			name: 'Health Systems',
			path: healthSystemRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<!-- <div class="flex flex-wrap gap-2">
    <a
        href={editRoute}
        class="health-system-btn variant-filled-secondary ml-auto my-2"
    >
        <Icon icon="material-symbols:edit-outline" />
        <span>Edit</span>
    </a>
</div> -->

<div class="p-6">
	<div class="mx-auto">
		<div class="mb-6 rounded-lg bg-white shadow dark:bg-neutral-800">
			<table class="health-system-table">
				<thead class="">
					<tr>
						<th>View Health System</th>
						<th class="text-end">
							<a
								href={healthSystemRoute}
								class="health-system-btn variant-soft-secondary"
							>
								<Icon icon="material-symbols:close-rounded" class="" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody class="">
					<tr class="">
						<td>Name</td>
						<td>{healthSystemName}</td>
					</tr>
					<tr class="">
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
