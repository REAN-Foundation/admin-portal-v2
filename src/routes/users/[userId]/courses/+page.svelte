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
	import CourseTreeView from '$lib/components/lms/course/course-tree-view.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let initialCourses = (() => {
		return data.courses?.Items ?? [];
	})();
	let courses = $state(initialCourses);
	let retrivedCourses = $derived(courses);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let openModuleDeleteModal = $state(false);
	let moduleToBeDeleted = $state<{ moduleId: string; courseId: string } | null>(null);
	let openContentDeleteModal = $state(false);
	let contentToBeDeleted = $state<{ contentId: string; moduleId: string } | null>(null);
	let searchKeyword = $state(undefined);

	// State for managing expanded courses and their modules
	let expandedCourses = $state<Record<string, boolean>>({});
	let courseModules = $state<Record<string, any[]>>({});
	let loadingModules = $state<Record<string, boolean>>({});
	let courseModuleCounts = $state<Record<string, number>>({});

	// State for managing expanded modules and their contents
	let expandedModules = $state<Record<string, boolean>>({});
	let moduleContents = $state<Record<string, any[]>>({});
	let loadingContents = $state<Record<string, boolean>>({});
	let moduleContentCounts = $state<Record<string, number>>({});

	// State for managing selected content IDs per module
	let selectedContentIds = $state<Record<string, string | null>>({})
	let courseName = $state(undefined);
	let initialTotalCount = (() => {
		return data.courses?.TotalCount ?? 0;
	})();
	let totalCoursesCount = $state(initialTotalCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: initialTotalCount,
		amounts: [10, 20, 30, 50]
	});

	const userId = page.params.userId;
	const courseRoute = `/users/${userId}/courses`;
	const editRoute = (courseId) => `/users/${userId}/courses/${courseId}/edit`;
	const viewRoute = (courseId) => `/users/${userId}/courses/${courseId}/view`;
	const modulesRoute = (courseId) => `/users/${userId}/courses/${courseId}/modules`;
	const createRoute = `/users/${userId}/courses/create`;

	const breadCrumbs = [{ name: 'Courses', path: courseRoute }];

	let hasInitialized = $state(false);
	$effect(() => {
		if (!hasInitialized && courses.length === 0 && !isLoading) {
			hasInitialized = true;
			searchCourse({
				itemsPerPage: paginationSettings.limit,
				pageIndex: paginationSettings.page,
				sortBy,
				sortOrder
			});
		}
	});

	async function searchCourse(model) {
		try {
			isLoading = true;
			let url = `/api/server/lms/course/search?`;
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

			if (searchResult.Status === 'failure' || searchResult.HttpCode !== 200) {
				toastMessage({
					HttpCode: searchResult.HttpCode || 400,
					Message: searchResult.Message || 'Failed to search courses'
				});
				return;
			}

			if (!searchResult.Data) {
				toastMessage({
					HttpCode: 500,
					Message: 'Invalid response from server'
				});
				return;
			}

			const courseData = searchResult.Data.CourseRecords || searchResult.Data.Courses;
			if (!courseData) {
				toastMessage({
					HttpCode: 500,
					Message: 'No course data in response'
				});
				return;
			}
			totalCoursesCount = courseData.TotalCount || 0;
			paginationSettings.size = totalCoursesCount;

			courses = (courseData.Items || []).map((item, index) => ({
				...item,
				index: index + 1,
				Modules: item.Modules || item.modules || []
			}));
			searchKeyword = model.courseName;
		} catch (err) {
			console.error('Search failed:', err);
			toastMessage({
				HttpCode: 500,
				Message: 'An error occurred while searching courses'
			});
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; 
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
		paginationSettings.page = 0; 
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
		const response = await fetch(`/api/server/lms/course/${id}`, {
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

	const toggleCourseModules = async (courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();

		if (expandedCourses[courseId]) {
			expandedCourses = { ...expandedCourses, [courseId]: false };
		} else {
			expandedCourses = { ...expandedCourses, [courseId]: true };
			if (!loadingModules[courseId]) {
				await fetchCourseModules(courseId);
			}
		}
	};

	const fetchCourseModules = async (courseId: string) => {
		try {
			loadingModules = { ...loadingModules, [courseId]: true };
			let allModules: any[] = [];
			let pageIndex = 0;
			let hasMore = true;
			const itemsPerPage = 100;

			if (!courseId) {
				console.error('fetchCourseModules: courseId is required');
				courseModules = { ...courseModules, [courseId]: [] };
				courseModuleCounts = { ...courseModuleCounts, [courseId]: 0 };
				return;
			}

			while (hasMore) {
				let url = `/api/server/lms/modules/search?`;
				url += `itemsPerPage=${itemsPerPage}`;
				url += `&pageIndex=${pageIndex}`;
				url += `&sortBy=Name`;
				url += `&sortOrder=ascending`;
				url += `&courseId=${encodeURIComponent(courseId)}`;

				console.log(`Fetching modules for courseId: ${courseId}, URL: ${url}`);

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
				console.log(`Modules response for courseId ${courseId}:`, searchResult);
				let modulesList: any[] = [];

				if (searchResult.Data && searchResult.Data.CourseModuleRecords) {
					const courseModuleRecords = searchResult.Data.CourseModuleRecords;

					if (courseModuleRecords.Items && Array.isArray(courseModuleRecords.Items)) {
						modulesList = courseModuleRecords.Items;
						modulesList = modulesList.filter(
							(module) => module.CourseId === courseId || module.courseId === courseId
						);
						console.log(
							`Filtered modules for courseId ${courseId}:`,
							modulesList.length,
							'modules'
						);

						// Check if there are more pages
						const totalCount = courseModuleRecords.TotalCount || 0;
						const currentCount = allModules.length + modulesList.length;
						hasMore = currentCount < totalCount && modulesList.length === itemsPerPage;
					}
					else if (Array.isArray(courseModuleRecords)) {
						modulesList = courseModuleRecords.filter(
							(module) => module.CourseId === courseId || module.courseId === courseId
						);
						hasMore = modulesList.length === itemsPerPage;
					}
				}

				allModules = [...allModules, ...modulesList];

				if (modulesList.length < itemsPerPage) {
					hasMore = false;
				} else {
					pageIndex++;
				}
			}

			console.log(`Total modules fetched for courseId ${courseId}:`, allModules.length);

			const modulesWithCourseId = allModules.map((module) => ({
				...module,
				CourseId: courseId
			}));

			courseModules = { ...courseModules, [courseId]: modulesWithCourseId };
			courseModuleCounts = { ...courseModuleCounts, [courseId]: allModules.length };
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

	const moduleViewRoute = (courseId: string, moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	};

	const moduleEditRoute = (courseId: string, moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/edit`;
	};

	const moduleCreateRoute = (courseId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/create`;
	};

	const contentViewRoute = (courseId: string, moduleId: string, contentId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
	};

	const contentEditRoute = (courseId: string, moduleId: string, contentId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/edit`;
	};

	const contentCreateRoute = (courseId: string, moduleId: string) => {
		return `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/create`;
	};

	const handleContentDeleteClick = (contentId: string) => {
		let moduleId = null;
		for (const [modId, contents] of Object.entries(moduleContents)) {
			if (contents.some((c) => c.id === contentId)) {
				moduleId = modId;
				break;
			}
		}
		if (moduleId) {
			openContentDeleteModal = true;
			contentToBeDeleted = { contentId, moduleId };
		}
	};

	const handleContentDelete = async (data: { contentId: string; moduleId: string }) => {
		const { contentId, moduleId } = data;
		console.log('Deleting content:', contentId);
		const response = await fetch(`/api/server/lms/content/${contentId}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('Delete content response:', res);
		if (res.HttpCode === 200) {
			toastMessage(res);
			if (moduleContents[moduleId]) {
				await fetchModuleContents(moduleId);
			}
		} else {
			toastMessage(res);
		}
		openContentDeleteModal = false;
		contentToBeDeleted = null;
	};

	const handleModuleDeleteClick = (moduleId: string, courseId: string) => {
		openModuleDeleteModal = true;
		moduleToBeDeleted = { moduleId, courseId };
	};

	const handleModuleDelete = async (data: { moduleId: string; courseId: string }) => {
		const { moduleId, courseId } = data;
		console.log('Deleting module:', moduleId);
		const response = await fetch(`/api/server/lms/modules/${moduleId}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('Delete module response:', res);
		if (res.HttpCode === 200) {
			toastMessage(res);
			if (courseModules[courseId]) {
				await fetchCourseModules(courseId);
			}
		} else {
			toastMessage(res);
		}
		openModuleDeleteModal = false;
		moduleToBeDeleted = null;
	};

	const toggleModuleContents = async (moduleId: string, courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();

		if (expandedModules[moduleId]) {
			// Collapse
			expandedModules = { ...expandedModules, [moduleId]: false };
		} else {
			expandedModules = { ...expandedModules, [moduleId]: true };

			if (!moduleContents[moduleId] && !loadingContents[moduleId]) {
				await fetchModuleContents(moduleId);
			}
		}
	};

	const fetchModuleContentCount = async (moduleId: string) => {
		try {
			let url = `/api/server/lms/content/search?`;
			url += `itemsPerPage=1`;
			url += `&pageIndex=0`;
			url += `&sortBy=Title`;
			url += `&sortOrder=ascending`;
			url += `&moduleId=${moduleId}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' },
				credentials: 'include'
			});

			if (res.ok) {
				const searchResult = await res.json();
				const totalCount = searchResult?.Data?.CourseContentRecords?.TotalCount || 0;
				moduleContentCounts = { ...moduleContentCounts, [moduleId]: totalCount };
			}
		} catch (err) {
			console.error('Failed to fetch content count:', err);
		}
	};

	// Fetch contents for a specific module
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
				const errorText = await res.text();
				console.error('HTTP error response:', res.status, errorText);
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const searchResult = await res.json();
			let contentsList = searchResult?.Data?.CourseContentRecords?.Items || [];

			contentsList = contentsList.filter(
				(content) => content.CourseModuleId === moduleId || content.courseModuleId === moduleId
			);

			moduleContents = { ...moduleContents, [moduleId]: contentsList };
			moduleContentCounts = { ...moduleContentCounts, [moduleId]: contentsList.length };
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
								{@const fetchedModules = courseModules[row.id]}
								{@const cachedCount = courseModuleCounts[row.id]}
								{@const moduleCount =
									fetchedModules !== undefined
										? fetchedModules.length
										: cachedCount !== undefined
											? cachedCount
											: (row.ModuleCount ??
												row.ModulesCount ??
												row.moduleCount ??
												row.modulesCount ??
												row.TotalModules ??
												row.totalModules ??
												row.Modules?.length ??
												row.modules?.length ??
												0)}
								{@const isExpanded = expandedCourses[row.id]}
								<tr class={isExpanded ? 'bg-gray-300 hover:!bg-gray-300' : ''}>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Name || 'Not specified'}>
											<button
												onclick={(e) => toggleCourseModules(row.id, e)}
												class="flex cursor-pointer items-center gap-2 text-left hover:underline"
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
										<div class="flex items-center justify-end gap-2">
											<span class="text-sm text-gray-700">Modules ({moduleCount})</span>
											<Button
												href={moduleCreateRoute(row.id)}
												variant="icon"
												icon="material-symbols:add"
												iconSize="sm"
												tooltip="Add New Module"
											/>
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
										<td
											colspan="6"
											class="bg-gray-300 p-4"
											style="position: relative; overflow: visible;"
										>
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
													onModuleDelete={(moduleId, courseId) =>
														handleModuleDeleteClick(moduleId, courseId || row.id)}
													bind:expandedModules
													bind:moduleContents
													bind:loadingContents
													bind:moduleContentCounts
													onModuleExpand={(moduleId, event) =>
														toggleModuleContents(moduleId, row.id, event)}
													contentView={contentViewRoute}
													contentEdit={contentEditRoute}
													contentCreate={contentCreateRoute}
													onContentDelete={handleContentDeleteClick}
													bind:selectedContentIds
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

<Confirmation
	bind:isOpen={openContentDeleteModal}
	title="Delete Content"
	onConfirm={handleContentDelete}
	id={contentToBeDeleted}
	message="Are you sure you want to delete this content?"
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
