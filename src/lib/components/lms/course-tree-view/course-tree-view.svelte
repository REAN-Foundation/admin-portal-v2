<script lang="ts">
	import CourseTreeItem from './course-tree-item.svelte';
	import ModuleTreeItem from './module-tree-item.svelte';
	import type { CourseTreeViewProps } from './types';

	let {
		mode = 'modules',
		courses,
		modules,
		courseView,
		moduleView,
		contentView,
		expandedCourses = $bindable({}),
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		courseModules = $bindable({}),
		loadingModules = $bindable({}),
		courseId
	}: CourseTreeViewProps = $props();

	// For courses mode: fetch modules when course is expanded
	const toggleCourseModules = async (courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();

		if (expandedCourses[courseId]) {
			expandedCourses = { ...expandedCourses, [courseId]: false };
		} else {
			expandedCourses = { ...expandedCourses, [courseId]: true };
			// Fetch modules if not already loaded
			if (!courseModules[courseId] && !loadingModules[courseId]) {
				await fetchCourseModules(courseId);
			}
		}
	};

	const fetchCourseModules = async (courseId: string) => {
		try {
			loadingModules = { ...loadingModules, [courseId]: true };
			let url = `/api/server/lms/course.modules/search?`;
			url += `itemsPerPage=100`;
			url += `&pageIndex=0`;
			url += `&sortBy=Name`;
			url += `&sortOrder=ascending`;
			url += `&courseId=${encodeURIComponent(courseId)}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' },
				credentials: 'include'
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const searchResult = await res.json();
			let modulesList = searchResult?.Data?.CourseModuleRecords?.Items || [];

			// Filter modules to ensure they belong to this specific course
			modulesList = modulesList.filter(
				(module: any) => module.CourseId === courseId || module.courseId === courseId
			);

			// Build module tree structure
			const moduleTree = buildModuleTree(modulesList);

			courseModules = { ...courseModules, [courseId]: moduleTree };
		} catch (err) {
			console.error('Failed to fetch modules:', err);
			courseModules = { ...courseModules, [courseId]: [] };
		} finally {
			loadingModules = { ...loadingModules, [courseId]: false };
		}
	};

	const buildModuleTree = (modules: any[]) => {
		if (!modules || modules.length === 0) return [];

		const moduleMap = new Map();
		modules.forEach((module) => {
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

	// For both modes: fetch contents when module is expanded
	const toggleModuleContents = async (moduleId: string, event: Event, courseIdParam?: string) => {
		event.preventDefault();
		event.stopPropagation();

		const key = courseIdParam ? `${courseIdParam}-${moduleId}` : moduleId;

		if (expandedModules[key]) {
			expandedModules = { ...expandedModules, [key]: false };
		} else {
			expandedModules = { ...expandedModules, [key]: true };
			// Fetch contents if not already loaded
			if (!moduleContents[key] && !loadingContents[key]) {
				await fetchModuleContents(moduleId, courseIdParam);
			}
		}
	};

	const fetchModuleContents = async (moduleId: string, courseIdParam?: string) => {
		const key = courseIdParam ? `${courseIdParam}-${moduleId}` : moduleId;
		try {
			loadingContents = { ...loadingContents, [key]: true };
			let url = `/api/server/lms/course.contents/search?`;
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

			contentsList = contentsList.filter(
				(content: any) => content.CourseModuleId === moduleId || content.courseModuleId === moduleId
			);

			moduleContents = { ...moduleContents, [key]: contentsList };
		} catch (err) {
			console.error('Failed to fetch contents:', err);
			moduleContents = { ...moduleContents, [key]: [] };
		} finally {
			loadingContents = { ...loadingContents, [key]: false };
		}
	};

	// Build module tree for modules mode
	const moduleNodes = $derived(
		mode === 'modules' && modules ? buildModuleTree(modules) : []
	);
</script>

<div class="space-y-2 pl-4 hover:text-black">
	{#if mode === 'courses' && courses && courses.length > 0}
		{#each courses as course, i (course.id)}
			<CourseTreeItem
				node={course}
				index={i}
				courseView={courseView}
				moduleView={moduleView as (courseId: string, moduleId: string) => string}
				contentView={contentView as (courseId: string, moduleId: string, contentId: string) => string}
				bind:expandedCourses
				bind:expandedModules
				bind:moduleContents
				bind:loadingContents
				bind:courseModules
				bind:loadingModules
				onCourseExpand={toggleCourseModules}
				onModuleExpand={toggleModuleContents}
			/>
		{/each}
	{:else if mode === 'modules' && moduleNodes && moduleNodes.length > 0}
		{#each moduleNodes as module}
			{#if !module.ParentModuleId || module.ParentModuleId === null}
				<ModuleTreeItem
					node={module}
					{courseId}
					moduleView={moduleView as any}
					contentView={contentView as any}
					bind:expandedModules
					bind:moduleContents
					bind:loadingContents
					onModuleExpand={toggleModuleContents}
				/>
			{/if}
		{/each}
	{:else}
		<div class="text-gray-500 italic">
			{mode === 'courses' ? 'Courses are not available' : 'No modules found'}
		</div>
	{/if}
</div>

