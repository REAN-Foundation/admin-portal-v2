<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var courseId = page.params.courseId;
	const editRoute = `/users/${userId}/courses/${courseId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/view`;
	const coursesRoute = `/users/${userId}/courses`;

	let { data }: { data: PageServerData } = $props();

	let course = $state(data.course);
	let courseName = course.Name;
	let description = course.Description || 'Not specified';
	let imageUrl = data.course.ImageResourceUrl;
	let durationInDays = course.DurationInDays ? course.DurationInDays.toString() : 'Not specified';

	const breadCrumbs = [
		{
			name: 'Courses',
			path: coursesRoute
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
		<h2 class="form-titles">View Course</h2>
		<a href={coursesRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name</td>
					<td class="table-data">{courseName}</td>
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
				<td class="table-label align-top">Image</td>
				<td class="table-data">
					{#if imageUrl == undefined || imageUrl == null}
						Not specified
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
					{/if}
				</td>
			</tr>
				<tr class="tables-row">
					<td class="table-label">Duration (Days)</td>
					<td class="table-data">
						{#if durationInDays && durationInDays !== 'Not specified'}
							<span class="span">{durationInDays} days</span>
						{:else}
							<span class="span">Not specified</span>
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

