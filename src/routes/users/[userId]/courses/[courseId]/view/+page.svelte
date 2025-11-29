<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import ModuleTreeView from '$lib/components/module-tree-view.svelte';

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

	const buildModuleTree = (modules: any[]) => {
		if (!modules || modules.length === 0) return [];
		
		const moduleMap = new Map();
		modules.forEach(module => {
			moduleMap.set(module.id, {
				...module,
				Children: [],
				ParentModuleId: module.ParentModuleId || null
			});
		});
		
		const rootModules: any[] = [];
		moduleMap.forEach((module, id) => {
			if (module.ParentModuleId === null || !moduleMap.has(module.ParentModuleId)) {
				rootModules.push(module);
			} else {
				const parent = moduleMap.get(module.ParentModuleId);
				if (parent) {
					if (!parent.Children) {
						parent.Children = [];
					}
					parent.Children.push(module);
				}
			}
		});
		
		return rootModules;
	};

	const moduleNodes = $derived(buildModuleTree(data.modules || []));

	$effect(() => {
		const modules = data.modules || [];
		if (modules.length > 0) {
			modules.forEach((module: any) => {
				// Initialize modules as collapsed (false) instead of expanded
				if (expandedModules[module.id] === undefined) {
					expandedModules = { ...expandedModules, [module.id]: false };
				}
			});
		}
	});
	
	const moduleView = (moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	};
	
	const contentView = (contentId: string, moduleId?: string) => {
		if (moduleId) {
			return `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
		}
		for (const [modId, contents] of Object.entries(moduleContents)) {
			if (contents.some(c => c.id === contentId)) {
				return `/users/${userId}/courses/${courseId}/modules/${modId}/contents/${contentId}/view`;
			}
		}
		return `/users/${userId}/courses/${courseId}/modules/unknown/contents/${contentId}/view`;
	};

	let expandedModules = $state<Record<string, boolean>>({});
	let moduleContents = $state<Record<string, any[]>>({});
	let loadingContents = $state<Record<string, boolean>>({});
	
	const toggleModuleContents = async (moduleId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		
		if (expandedModules[moduleId]) {
			expandedModules = { ...expandedModules, [moduleId]: false };
		} else {
			expandedModules = { ...expandedModules, [moduleId]: true };
			if (!moduleContents[moduleId] && !loadingContents[moduleId]) {
				await fetchModuleContents(moduleId);
			}
		}
	};
	const fetchModuleContents = async (moduleId: string) => {
		try {
			loadingContents = { ...loadingContents, [moduleId]: true };
			let url = `/api/server/lms/content/search?`;
			url += `itemsPerPage=100`;
			url += `&pageIndex=0`;
			url += `&sortBy=Title`;
			url += `&sortOrder=ascending`;
			url += `&moduleId=${encodeURIComponent(moduleId)}`; 

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' },
				credentials: 'include'
			});
			
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			
			const searchResult = await res.json();
			let contentsList = searchResult?.Data?.CourseContentRecords?.Items || [];
			
			contentsList = contentsList.filter(content => 
				content.CourseModuleId === moduleId || content.courseModuleId === moduleId
			);
			
			moduleContents = { ...moduleContents, [moduleId]: contentsList };
		} catch (err) {
			console.error('Failed to fetch contents:', err);
			moduleContents = { ...moduleContents, [moduleId]: [] };
		} finally {
			loadingContents = { ...loadingContents, [moduleId]: false };
		}
	};
	

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
				<td class="table-label align-top">Modules</td>
				<td class="table-data">
					{#if moduleNodes && moduleNodes.length > 0}
						<ModuleTreeView 
							modules={moduleNodes} 
							{moduleView}
							bind:expandedModules
							bind:moduleContents
							bind:loadingContents
							onModuleExpand={toggleModuleContents}
							{contentView}
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
