<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import CourseTreeView from '$lib/components/lms/course-tree-view/course-tree-view.svelte';

	///////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let learningJourney = $derived(data.learningJourney || {});
	let courses = $derived(data.courses || []);
	let expandedCourses = $state<Record<string, boolean>>({});
	let courseModules = $state<Record<string, any[]>>({});
	let loadingModules = $state<Record<string, boolean>>({});
	let expandedModules = $state<Record<string, boolean>>({});
	let moduleContents = $state<Record<string, any[]>>({});
	let loadingContents = $state<Record<string, boolean>>({});
	let learningJourneyName = $derived(learningJourney?.Name || learningJourney?.name || 'Not specified');
	let description = $derived(learningJourney?.Description || learningJourney?.description || 'Not specified');
	let imageUrl = $derived(learningJourney?.ImageUrl || learningJourney?.imageUrl);
	let durationInDays = $derived(
		learningJourney?.DurationInDays || learningJourney?.durationInDays
			? (learningJourney.DurationInDays || learningJourney.durationInDays).toString()
			: 'Not specified'
	);
	let preferenceWeight = $derived(
		learningJourney?.PreferenceWeight || learningJourney?.preferenceWeight
			? (learningJourney.PreferenceWeight || learningJourney.preferenceWeight).toString()
			: 'Not specified'
	);
	let enabled = $derived(
		learningJourney?.Enabled !== undefined || learningJourney?.enabled !== undefined
			? (learningJourney.Enabled || learningJourney.enabled) ? 'Yes' : 'No'
			: 'Not specified'
	);

	const userId = page.params.userId;
	var learningPathId = page.params.learningPathId;
	const editRoute = `/users/${userId}/learning-journeys/${learningPathId}/edit`;
	const viewRoute = `/users/${userId}/learning-journeys/${learningPathId}/view`;
	const learningJourneysRoute = `/users/${userId}/learning-journeys`;

	
	const courseViewRoute = (courseId: string) => `/users/${userId}/courses/${courseId}/view`;
	const moduleViewRoute = (courseId: string, moduleId: string) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	const contentViewRoute = (courseId: string, moduleId: string, contentId: string) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;

	

	const breadCrumbs = [
		{
			name: 'Learning Journeys',
			path: learningJourneysRoute
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
		<h2 class="form-titles">View Learning Journey</h2>
		<a href={learningJourneysRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">
					{#if learningJourneyName && learningJourneyName !== 'Not specified'}
						<span class="span">{learningJourneyName}</span>
					{:else}
						<span class="span">Not specified</span>
					{/if}
				</td>
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
					{#if imageUrl == undefined || imageUrl == null || imageUrl === ''}
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
				<td class="table-label">Preference Weight</td>
				<td class="table-data">
					{#if preferenceWeight && preferenceWeight !== 'Not specified'}
						<span class="span">{preferenceWeight}</span>
					{:else}
						<span class="span">Not specified</span>
					{/if}
				</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Enabled</td>
				<td class="table-data">
					<span class="span">{enabled}</span>
				</td>
			</tr>
			<tr class="tables-row !border-b !border-b-secondary-100 dark:!border-b-surface-700">
				<td class="table-label align-top">Courses</td>
				<td class="table-data">
					<CourseTreeView
						mode="courses"
						{courses}
						courseView={courseViewRoute}
						moduleView={moduleViewRoute}
						contentView={contentViewRoute}
						bind:expandedCourses
						bind:expandedModules
						bind:moduleContents
						bind:loadingContents
						bind:courseModules
						bind:loadingModules
					/>
				</td>
			</tr>
		</tbody>
	</table>
	<div class="btn-container">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		></Button>
	</div>
</div>

