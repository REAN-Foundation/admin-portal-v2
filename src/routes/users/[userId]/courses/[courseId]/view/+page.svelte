<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import CourseTreeView from '$lib/components/lms/course-tree-view/course-tree-view.svelte';

	///////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var courseId = page.params.courseId;
	const editRoute = `/users/${userId}/courses/${courseId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/view`;
	const coursesRoute = `/users/${userId}/courses`;
	const createModule = `/users/${userId}/courses/${courseId}/modules/create`;

	let { data }: { data: PageServerData } = $props();

	let course = $state(data.course);
	let courseName = course.Name;
	let description = course.Description || 'Not specified';
	let imageUrl = data.course.ImageResourceUrl;
	let durationInDays = course.DurationInDays ? course.DurationInDays.toString() : 'Not specified';
	let sequence = course.Sequence ? course.Sequence.toString() : 'Not specified';

	// Filter modules for this course
	const filteredModules = $derived(
		(data.modules || []).filter(
			(module: any) => module.CourseId === courseId || module.courseId === courseId
		)
	);

	const moduleView = (moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	};

	const contentView = (contentId: string, moduleId?: string) => {
		if (moduleId) {
			return `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
		}
		// Fallback: try to find moduleId from moduleContents
		for (const [modId, contents] of Object.entries(moduleContents)) {
			if (contents.some((c: any) => c.id === contentId)) {
				return `/users/${userId}/courses/${courseId}/modules/${modId}/contents/${contentId}/view`;
			}
		}
		return `/users/${userId}/courses/${courseId}/modules/unknown/contents/${contentId}/view`;
	};

	let expandedModules = $state<Record<string, boolean>>({});
	let moduleContents = $state<Record<string, any[]>>({});
	let loadingContents = $state<Record<string, boolean>>({});
	

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
				<td class="table-label align-top">Modules</td>
				<td class="table-data">
					{#if filteredModules && filteredModules.length > 0}
						<CourseTreeView
							mode="modules"
							modules={filteredModules}
							{courseId}
							{moduleView}
							{contentView}
							bind:expandedModules
							bind:moduleContents
							bind:loadingContents
						/>
					{:else}
						<span class="span">No modules found</span>
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
	<div class=" btn-container">
		<Button
			href={createModule}
			text="Add Module"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		></Button>
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
		></Button>
	</div>
</div>
