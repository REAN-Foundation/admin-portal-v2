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
	const moduleId = page.params.moduleId;
	var contentId = page.params.contentId;
	const editRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
	const contentsRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents`;
	const modulesRoute = `/users/${userId}/courses/${courseId}/modules`;
	const courseRoute = `/users/${userId}/courses`;

	let { data }: { data: PageServerData } = $props();
	
	const content = data.content;
	
	// Helper function to get value or 'Not specified'
	const getValue = (value: any) => {
		if (value === null || value === undefined || value === '') {
			return 'Not specified';
		}
		return value;
	};
	
	const title = getValue(content?.Title || content?.title);
	const contentType = getValue(content?.ContentType || content?.contentType);
	const description = getValue(content?.Description || content?.description);
	const sequence = content?.Sequence || content?.sequence ? (content.Sequence || content.sequence).toString() : 'Not specified';
	const resourceLink = getValue(content?.ResourceLink || content?.resourceLink);
	const imageUrl = content?.ImageResourceUrl || content?.imageResourceUrl;
	const durationInMins = content?.DurationInMins || content?.durationInMins ? (content.DurationInMins || content.durationInMins).toString() : 'Not specified';

	const breadCrumbs = [
		{
			name: 'Courses',
			path: courseRoute
		},
		{
			name: 'Modules',
			path: modulesRoute
		},
		{
			name: 'Contents',
			path: contentsRoute
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
		<h2 class="form-titles">View Content</h2>
		<a href={contentsRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Title</td>
					<td class="table-data">{title}</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Content Type</td>
					<td class="table-data">{contentType}</td>
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
					<td class="table-label">Resource Link</td>
					<td class="table-data">
						{#if resourceLink && resourceLink !== 'Not specified'}
							<a href={resourceLink} target="_blank" class="text-blue-600 hover:underline">{resourceLink}</a>
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

