<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const courseId = page.params.courseId;
	var moduleId = page.params.moduleId;
	const editRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	const modulesRoute = `/users/${userId}/courses/${courseId}/modules`;
	const courseRoute = `/users/${userId}/courses`;

	let { data }: { data: PageServerData } = $props();

	let module = $state(data.module);
	let moduleName = module?.Name || 'Not specified';
	let description = module?.Description || 'Not specified';
	let imageUrl = data.module?.ImageResourceUrl;
	let durationInMins = module?.DurationInMins ? module.DurationInMins.toString() : 'Not specified';
	let sequence = module?.Sequence ? module.Sequence.toString() : 'Not specified';

	const breadCrumbs = [
		{
			name: 'Courses',
			path: `courseRoute`
		},
		{
			name: 'Modules',
			path: modulesRoute
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
		<h2 class="form-titles">View Module</h2>
		<a href={modulesRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name</td>
					<td class="table-data">{moduleName}</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						{#if description && description !== 'Not specified'}
							<span class="span">{description}</span>
						{:else}
							<span class="span">Not specified</span>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Duration (Minutes)</td>
					<td class="table-data">
						{#if durationInMins && durationInMins !== 'Not specified'}
							<span class="span">{durationInMins} minutes</span>
						{:else}
							<span class="span">Not specified</span>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Sequence</td>
					<td class="table-data">
						{#if sequence && sequence !== 'Not specified'}
							<span class="span">{sequence}</span>
						{:else}
							<span class="span">Not specified</span>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
				<td class="table-label align-top">Image</td>
				<td class="table-data">
					{#if imageUrl == undefined || imageUrl == null}
						Not specified
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
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

