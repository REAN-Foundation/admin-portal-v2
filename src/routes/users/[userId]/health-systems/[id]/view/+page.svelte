<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var healthSystemId = page.params.id;
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

<div class="px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Action Plan</h2>
		<a href={healthSystemRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
			<table class="w-full">
				<tbody>
					<tr class="tables-row">
						<td class="table-label">Name</td>
						<td class="table-data">{healthSystemName}</td>
					</tr>
					<tr class="tables-row">
						<td class="table-label">Tags</td>
						<td class="table-data">
							{#if tags.length <= 0}
								<span class="span">Tags not specified</span>
							{:else}
								<span class="span">{tags}</span>
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
