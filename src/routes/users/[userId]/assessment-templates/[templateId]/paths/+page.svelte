<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import AssessmentPathManager from '$lib/components/assessment/assessment-path-manager.svelte';
	import type { CAssessmentNodePath } from '$lib/types/assessment-path.types';

	let { data } = $props();
	let paths = $state<CAssessmentNodePath[]>([]);
	let availableNodes = $state([]);
	let isLoading = $state(false);

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const templateTitle = data.templateDetails.Title;

	const templateViewRoute = `/users/${userId}/assessment-templates/${templateId}/view`;
	const pathsRoute = `/users/${userId}/assessment-templates/${templateId}/paths`;

	const breadCrumbs = [
		{ name: 'Assessments', path: `/users/${userId}/assessment-templates` },
		{ name: templateTitle, path: templateViewRoute },
		{ name: 'Paths', path: pathsRoute }
	];

	// Load available nodes for path creation
	const loadAvailableNodes = async () => {
		try {
			const response = await fetch(`/api/server/assessments/assessment-nodes/search?templateId=${templateId}`);
			const result = await response.json();
			if (result.Data && result.Data.Items) {
				availableNodes = result.Data.Items;
			}
		} catch (error) {
			console.error('Failed to load available nodes:', error);
		}
	};

	// Load existing paths
	const loadPaths = async () => {
		try {
			isLoading = true;
			const response = await fetch(`/api/server/assessments/assessment-paths?templateId=${templateId}`);
			const result = await response.json();
			if (result.Data && result.Data.Items) {
				paths = result.Data.Items;
			}
		} catch (error) {
			console.error('Failed to load paths:', error);
			toastMessage({
				Status: 'failure',
				Message: 'Failed to load assessment paths'
			});
		} finally {
			isLoading = false;
		}
	};

	// Handle path changes
	const handlePathChange = async (updatedPaths: CAssessmentNodePath[]) => {
		paths = updatedPaths;
		// Here you could save the changes to the backend
		console.log('Paths updated:', updatedPaths);
	};

	// Initialize
	loadAvailableNodes();
	loadPaths();
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<div class="form-headers">
		<h2 class="form-titles">Assessment Paths - {templateTitle}</h2>
		<a href={templateViewRoute} class="form-cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	{#if isLoading}
		<div class="flex justify-center items-center py-8">
			<Icon icon="mdi:loading" class="h-8 w-8 animate-spin" />
			<span class="ml-2">Loading paths...</span>
		</div>
	{:else}
		<AssessmentPathManager 
			bind:paths={paths}
			bind:availableNodes={availableNodes}
			onPathChange={handlePathChange}
		/>
	{/if}
</div> 