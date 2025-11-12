<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import Button from '$lib/components/button/button.svelte';
	import CourseTreeView from '$lib/components/course-tree-view.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	// Initialize courses and preserve nested Modules if they exist in the API response
	let courses = $state((data.courses?.Items || []).map(item => ({
		...item,
		Modules: item.Modules || item.modules || []
	})));
	let retrivedCourses = $derived(courses);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let openModuleDeleteModal = $state(false);
	let moduleToBeDeleted = $state<{ moduleId: string; courseId: string } | null>(null);
	let searchKeyword = $state(undefined);
	
	// State for managing expanded courses and their modules
	let expandedCourses = $state<Record<string, boolean>>({});
	let courseModules = $state<Record<string, any[]>>({});
	let loadingModules = $state<Record<string, boolean>>({});
	
	// State for managing expanded modules and their contents
	let expandedModules = $state<Record<string, boolean>>({});
	let moduleContents = $state<Record<string, any[]>>({});
	let loadingContents = $state<Record<string, boolean>>({});

	const userId = page.params.userId;
	const courseRoute = `/users/${userId}/courses`;
	const editRoute = (courseId) => `/users/${userId}/courses/${courseId}/edit`;
	const viewRoute = (courseId) => `/users/${userId}/courses/${courseId}/view`;
	const modulesRoute = (courseId) => `/users/${userId}/courses/${courseId}/modules`;
	const createRoute = `/users/${userId}/courses/create`;

	const breadCrumbs = [{ name: 'Courses', path: courseRoute }];

	let courseName = $state(undefined);

	let totalCoursesCount = $state(data.courses?.TotalCount || 0);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: data.courses?.TotalCount || 0,
		amounts: [10, 20, 30, 50]
	});

	// Update pagination size when totalCoursesCount changes
	$effect(() => {
		paginationSettings.size = totalCoursesCount;
	});

	async function searchCourse(model) {
		try {
			isLoading = true;
			let url = `/api/server/educational/course/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.courseName) url += `&name=${model.courseName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			const courseData = searchResult.Data.Courses;
			totalCoursesCount = courseData.TotalCount;
			paginationSettings.size = totalCoursesCount;

			// Map courses and preserve nested Modules if they exist
			courses = courseData.Items.map((item, index) => ({
				...item,
				index: index + 1,
				// Preserve nested Modules if they exist in the API response
				Modules: item.Modules || item.modules || []
			}));
			searchKeyword = model.courseName;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchCourse({
				courseName: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;
		searchCourse({
			courseName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchCourse({
			courseName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchCourse({
			courseName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleCourseDelete = async (id) => {
		console.log('Inside handleCourseDelete', id);
		const response = await fetch(`/api/server/educational/course/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('deleted Response', res);
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchCourse({
			courseName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};

	// Toggle course expansion and fetch modules
	const toggleCourseModules = async (courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		
		if (expandedCourses[courseId]) {
			// Collapse
			expandedCourses = { ...expandedCourses, [courseId]: false };
		} else {
			// Expand
			expandedCourses = { ...expandedCourses, [courseId]: true };
			
			// Check if modules are already in the course object (nested from API)
			const course = courses.find(c => c.id === courseId);
			const nestedModules = course?.Modules || course?.modules || [];
			
			if (nestedModules && nestedModules.length > 0) {
				// Use nested modules from course object (old API behavior)
				courseModules = { ...courseModules, [courseId]: nestedModules };
			} else if (!courseModules[courseId] && !loadingModules[courseId]) {
				// Fetch modules separately if not nested and not already loaded
				await fetchCourseModules(courseId);
			}
		}
	};
	
	// Fetch modules for a specific course
	const fetchCourseModules = async (courseId: string) => {
		try {
			loadingModules = { ...loadingModules, [courseId]: true };
			let url = `/api/server/educational/modules/search?`;
			url += `itemsPerPage=100`; // Get all modules
			url += `&pageIndex=0`;
			url += `&sortBy=Name`;
			url += `&sortOrder=ascending`;
			url += `&courseId=${courseId}`; // Add courseId to filter modules by course

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' },
				credentials: 'include'
			});
			
			if (!res.ok) {
				const errorText = await res.text();
				console.error('HTTP error response:', res.status, errorText);
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			
			const searchResult = await res.json();
			let modulesList = [];
			
			// Match the exact pattern from modules page: searchResult.Data.CourseModules
			if (searchResult.Data && searchResult.Data.CourseModules) {
				const courseModulesData = searchResult.Data.CourseModules;
				
				// Check for Items array (standard structure)
				if (courseModulesData.Items && Array.isArray(courseModulesData.Items)) {
					modulesList = courseModulesData.Items;
				}
				// If CourseModules is directly an array
				else if (Array.isArray(courseModulesData)) {
					modulesList = courseModulesData;
				}
			}
			
			// Update state reactively - store all modules for this course
			// Ensure each module has the courseId for content navigation
			const modulesWithCourseId = modulesList.map(module => ({
				...module,
				CourseId: courseId
			}));
			courseModules = { ...courseModules, [courseId]: modulesWithCourseId };
		} catch (err) {
			console.error('Failed to fetch modules:', err);
			courseModules = { ...courseModules, [courseId]: [] };
			toastMessage({
				HttpCode: 500,
				Message: 'Failed to load modules'
			});
		} finally {
			loadingModules = { ...loadingModules, [courseId]: false };
		}
	};

	// Module route helpers
	const moduleViewRoute = (courseId: string, moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	};
	
	const moduleEditRoute = (courseId: string, moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/edit`;
	};
	
	// Content view route helper
	const contentViewRoute = (courseId: string, moduleId: string, contentId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
	};
	
	// Module delete handler
	const handleModuleDeleteClick = (moduleId: string, courseId: string) => {
		openModuleDeleteModal = true;
		moduleToBeDeleted = { moduleId, courseId };
	};
	
	const handleModuleDelete = async (data: { moduleId: string; courseId: string }) => {
		const { moduleId, courseId } = data;
		console.log('Deleting module:', moduleId);
		const response = await fetch(`/api/server/educational/modules/${moduleId}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('Delete module response:', res);
		if (res.HttpCode === 200) {
			toastMessage(res);
			// Refresh modules for the course
			if (courseModules[courseId]) {
				await fetchCourseModules(courseId);
			}
		} else {
			toastMessage(res);
		}
		openModuleDeleteModal = false;
		moduleToBeDeleted = null;
	};
	
	// Toggle module expansion and fetch contents
	const toggleModuleContents = async (moduleId: string, courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		
		if (expandedModules[moduleId]) {
			// Collapse
			expandedModules = { ...expandedModules, [moduleId]: false };
		} else {
			// Expand
			expandedModules = { ...expandedModules, [moduleId]: true };
			
			// Fetch contents if not already loaded
			if (!moduleContents[moduleId] && !loadingContents[moduleId]) {
				await fetchModuleContents(moduleId);
			}
		}
	};
	
	// Fetch contents for a specific module
	const fetchModuleContents = async (moduleId: string) => {
		try {
			loadingContents = { ...loadingContents, [moduleId]: true };
			let url = `/api/server/educational/content/search?`;
			url += `itemsPerPage=100`; // Get all contents
			url += `&pageIndex=0`;
			url += `&sortBy=Title`;
			url += `&sortOrder=ascending`;
			url += `&moduleId=${moduleId}`; // Filter contents by moduleId

			console.log('Fetching contents for moduleId:', moduleId);
			console.log('Request URL:', url);

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' },
				credentials: 'include'
			});
			
			if (!res.ok) {
				const errorText = await res.text();
				console.error('HTTP error response:', res.status, errorText);
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			
			const searchResult = await res.json();
			console.log('Contents search result:', searchResult);
			let contentsList = [];
			
			// Handle both CourseContents and Contents response structures
			if (searchResult.Data) {
				const contentsData = searchResult.Data.CourseContents || searchResult.Data.Contents;
				console.log('Contents data:', contentsData);
				
				if (contentsData) {
					// Check for Items array (standard structure)
					if (contentsData.Items && Array.isArray(contentsData.Items)) {
						contentsList = contentsData.Items;
						console.log('Found contents in Items array:', contentsList.length);
					}
					// If contentsData is directly an array
					else if (Array.isArray(contentsData)) {
						contentsList = contentsData;
						console.log('Found contents as direct array:', contentsList.length);
					}
				}
			}
			
			console.log('Final contents list for module:', moduleId, contentsList);
			
			// Update state reactively - store all contents for this module
			moduleContents = { ...moduleContents, [moduleId]: contentsList };
		} catch (err) {
			console.error('Failed to fetch contents:', err);
			moduleContents = { ...moduleContents, [moduleId]: [] };
			toastMessage({
				HttpCode: 500,
				Message: 'Failed to load contents'
			});
		} finally {
			loadingContents = { ...loadingContents, [moduleId]: false };
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative pr-1.5">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								name="courseName"
								type="text"
								bind:value={courseName}
								oninput={(event) => onSearchInput(event)}
								placeholder="Search by name"
								class="table-input-field !pr-4 !pl-10"
							/>
							{#if courseName}
								<button
									type="button"
									onclick={() => {
										courseName = '';
										onSearchInput({ target: { name: 'name', value: '' } });
									}}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
								</button>
							{/if}
						</div>
					</div>
					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-[2%]"></th>
							<th class="w-[20%]">
								<button onclick={() => sortTable('Name')}>
									Name {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-[20%]">Description</th>
							<th class="w-[15%]">Duration (Days)</th>
							<th class="w-[15%]">Created</th>
							<th class="w-[23%]"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedCourses.length <= 0}
							<tr class="text-center">
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedCourses as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Name || 'Not specified'}>
											<button
												onclick={(e) => toggleCourseModules(row.id, e)}
												class="hover:underline cursor-pointer text-left flex items-center gap-2"
											>
												<Icon
													icon={expandedCourses[row.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'}
													class="inline"
													width="16"
												/>
												<span>
													{row.Name !== null && row.Name !== ''
														? Helper.truncateText(row.Name, 50)
														: 'Not specified'}
												</span>
											</button>
										</Tooltip>
									</td>
									<td>
										<Tooltip text={row.Description || 'Not specified'}>
											{row.Description !== null && row.Description !== ''
												? Helper.truncateText(row.Description, 50)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td>
										{row.DurationInDays !== null && row.DurationInDays !== undefined
											? row.DurationInDays
											: 'Not specified'}
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

									<td>
										<div class="flex justify-end">
											<Button
												href={editRoute(row.id)}
												variant="icon"
												icon="material-symbols:edit-outline"
												iconSize="sm"
												tooltip="Edit"
											/>
											<Button
												href={viewRoute(row.id)}
												variant="icon"
												icon="icon-park-outline:preview-open"
												iconSize="sm"
												tooltip="View"
											/>
											<Button
												onclick={() => handleDeleteClick(row.id)}
												variant="icon"
												icon="material-symbols:delete-outline-rounded"
												iconSize="sm"
												color="red"
												tooltip="Delete"
											/>
										</div>
									</td>
								</tr>
								{#if expandedCourses[row.id]}
									{@const courseModulesList = courseModules[row.id] || []}
									{@const hasModules = courseModulesList && courseModulesList.length > 0}
									{@const isLoading = loadingModules[row.id]}
									<tr>
										<td colspan="6" class="bg-gray-50 p-4">
											{#if isLoading}
												<div class="flex items-center gap-2 text-gray-500">
													<Icon icon="svg-spinners:ring-resize" class="inline" width="20" />
													<span>Loading modules...</span>
												</div>
											{:else if hasModules}
												<CourseTreeView
													modules={courseModulesList}
													moduleView={(moduleId) => moduleViewRoute(row.id, moduleId)}
													moduleEdit={(moduleId) => moduleEditRoute(row.id, moduleId)}
													onModuleDelete={(moduleId, courseId) => handleModuleDeleteClick(moduleId, courseId || row.id)}
													bind:expandedModules
													bind:moduleContents
													bind:loadingContents
													onModuleExpand={(moduleId, event) => toggleModuleContents(moduleId, row.id, event)}
													contentView={contentViewRoute}
												/>
											{:else}
												<div class="text-gray-500 italic">No modules found for this course</div>
											{/if}
										</td>
									</tr>
								{/if}
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete Course"
	onConfirm={handleCourseDelete}
	id={idToBeDeleted}
	message="Are you sure you want to delete this course?"
/>

<Confirmation
	bind:isOpen={openModuleDeleteModal}
	title="Delete Module"
	onConfirm={handleModuleDelete}
	id={moduleToBeDeleted}
	message="Are you sure you want to delete this module?"
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
