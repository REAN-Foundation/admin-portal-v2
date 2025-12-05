<script lang="ts">
	import LearningJourneyCourseTreeItem from './learning-journey-course-tree-item.svelte';
	
	let {
		courses,
		courseView,
		moduleView,
		contentView,
		expandedCourses = $bindable({}),
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		courseModules = $bindable({}),
		loadingModules = $bindable({})
	} = $props<{
		courses: Array<{
			id: string;
			Name: string;
			Modules?: Array<{
				id: string;
				Name: string;
				Sequence?: number;
				Contents?: Array<any>;
			}>;
		}>;
		courseView: (courseId: string) => string;
		moduleView: (courseId: string, moduleId: string) => string;
		contentView: (courseId: string, moduleId: string, contentId: string) => string;
		expandedCourses?: Record<string, boolean>;
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		courseModules?: Record<string, any[]>;
		loadingModules?: Record<string, boolean>;
	}>();

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
			let url = `/api/server/lms/modules/search?`;
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
			modulesList = modulesList.filter((module: any) => 
				module.CourseId === courseId || module.courseId === courseId
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

	const toggleModuleContents = async (moduleId: string, courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		
		const key = `${courseId}-${moduleId}`;
		
		if (expandedModules[key]) {
			expandedModules = { ...expandedModules, [key]: false };
		} else {
			expandedModules = { ...expandedModules, [key]: true };
			// Fetch contents if not already loaded
			if (!moduleContents[key] && !loadingContents[key]) {
				await fetchModuleContents(moduleId, courseId);
			}
		}
	};

	const fetchModuleContents = async (moduleId: string, courseId: string) => {
		const key = `${courseId}-${moduleId}`;
		try {
			loadingContents = { ...loadingContents, [key]: true };
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
			
			contentsList = contentsList.filter((content: any) => 
				content.CourseModuleId === moduleId || content.courseModuleId === moduleId
			);
			
			moduleContents = { ...moduleContents, [key]: contentsList };
		} catch (err) {
			console.error('Failed to fetch contents:', err);
			moduleContents = { ...moduleContents, [key]: [] };
		} finally {
			loadingContents = { ...loadingContents, [key]: false };
		}
	};
</script>

<div class="space-y-2 pl-4 hover:text-black">
	{#if courses && courses.length > 0}
		{#each courses as course, i (course.id || course.Id || i)}
			<LearningJourneyCourseTreeItem
				node={course}
				index={i}
				{courseView}
				{moduleView}
				{contentView}
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
	{:else}
		<div class="text-gray-500 italic">Courses are not available</div>
	{/if}
</div>

