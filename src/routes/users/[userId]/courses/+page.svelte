<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import Button from '$lib/components/button/button.svelte';
	import CourseTreeView from '$lib/components/lms/course-table-view/course-table-view.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let expandedCourses = $state<Record<string, boolean>>({});
	let courseModules = $state<Record<string, any[]>>({});
	let loadingModules = $state<Record<string, boolean>>({});
	let courseModuleCounts = $state<Record<string, number>>({});
	let expandedModules = $state<Record<string, boolean>>({});
	let moduleContents = $state<Record<string, any[]>>({});
	let loadingContents = $state<Record<string, boolean>>({});
	let moduleContentCounts = $state<Record<string, number>>({});
	let initialCourses = (() => {
		try {
			const items = data.courses?.Items ?? [];

			return items
				.map((item) => {
					if (!item) return null;
					const modules = item.Modules || item.modules || [];
					const processedModules = modules.map((module) => ({
						...module,
						CourseId: item.id,
						Contents: module.Contents || module.contents || []
					}));

					return {
						...item,
						Modules: processedModules
					};
				})
				.filter(Boolean);
		} catch (error) {
			console.error('Error processing initial courses:', error);
			return [];
		}
	})();
	let courses = $state(initialCourses);
	let hasProcessedInitialData = $state(false);
	let retrivedCourses = $derived(courses);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let openModuleDeleteModal = $state(false);
	let moduleToBeDeleted = $state<{ moduleId: string; courseId: string } | null>(null);
	let openContentDeleteModal = $state(false);
	let contentToBeDeleted = $state<{ contentId: string; moduleId: string } | null>(null);
	let searchKeyword = $state(undefined);
	let courseName = $state(undefined);
	let hasInitialized = $state(false);
	let initialTotalCount = (() => {
		return data.courses?.TotalCount ?? 0;
	})();
	let totalCoursesCount = $state(initialTotalCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state<'ascending' | 'descending'>('ascending');
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
	const createRoute = `/users/${userId}/courses/create`;

	const moduleViewRoute = (courseId, moduleId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	const moduleEditRoute = (courseId, moduleId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/edit`;
	const moduleCreateRoute = (courseId) => `/users/${userId}/courses/${courseId}/modules/create`;
	const contentViewRoute = (courseId, moduleId, contentId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
	const contentEditRoute = (courseId, moduleId, contentId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/edit`;
	const contentCreateRoute = (courseId, moduleId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/create`;

	const breadCrumbs = [{ name: 'Courses', path: courseRoute }];

	$effect(() => {
		if (!hasProcessedInitialData && courses.length > 0) {
			hasProcessedInitialData = true;
			try {
				courses.forEach((item) => {
					if (item.id && item.Modules) {
						courseModules = { ...courseModules, [item.id]: item.Modules };
						courseModuleCounts = { ...courseModuleCounts, [item.id]: item.Modules.length };

						item.Modules.forEach((module) => {
							if (module.id && module.Contents) {
								moduleContents = { ...moduleContents, [module.id]: module.Contents };
								moduleContentCounts = {
									...moduleContentCounts,
									[module.id]: module.Contents.length
								};
							}
						});
					}
				});
			} catch (error) {
				console.error('Error storing modules/contents in state:', error);
			}
		}

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
			let url = `/api/server/lms/courses/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.courseName) url += `&name=${model.courseName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			if (!res.ok) {
				const errorText = await res.text();
				console.error('HTTP error response:', res.status, errorText);
				toastMessage({
					HttpCode: res.status,
					Message: `Failed to fetch courses: ${res.status} ${res.statusText}`
				});
				return;
			}

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

			const courseData = searchResult.Data.CourseRecords;
			if (!courseData) {
				toastMessage({
					HttpCode: 500,
					Message: 'No course data in response'
				});
				return;
			}
			totalCoursesCount = courseData.TotalCount || 0;
			paginationSettings.size = totalCoursesCount;

			courses = (courseData.Items || [])
				.map((item, index) => {
					try {
						if (!item) return null;
						const modules = item.Modules || item.modules || [];
						const processedModules = (modules || []).map((module) => ({
							...module,
							CourseId: item.id,
							Contents: module.Contents || module.contents || []
						}));

						// Store modules and contents in state for easy access
						if (item.id) {
							courseModules = { ...courseModules, [item.id]: processedModules };
							courseModuleCounts = { ...courseModuleCounts, [item.id]: processedModules.length };

							// Store contents for each module
							processedModules.forEach((module) => {
								if (module && module.id) {
									const contents = module.Contents || [];
									moduleContents = { ...moduleContents, [module.id]: contents };
									moduleContentCounts = { ...moduleContentCounts, [module.id]: contents.length };
								}
							});
						}

						return {
							...item,
							index: index + 1,
							Modules: processedModules
						};
					} catch (error) {
						console.error('Error processing course item:', error, item);
						return {
							...item,
							index: index + 1,
							Modules: []
						};
					}
				})
				.filter(Boolean);
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
		const response = await fetch(`/api/server/lms/courses/${id}`, {
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
		const response = await fetch(`/api/server/lms/course.contents/${contentId}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		if (res.HttpCode === 200) {
			toastMessage(res);
			await searchCourse({
				courseName: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: paginationSettings.page,
				sortBy,
				sortOrder
			});
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
		const response = await fetch(`/api/server/lms/course.modules/${moduleId}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		if (res.HttpCode === 200) {
			toastMessage(res);
			// Refresh course data to get updated nested structure
			await searchCourse({
				courseName: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: paginationSettings.page,
				sortBy,
				sortOrder
			});
		} else {
			toastMessage(res);
		}
		openModuleDeleteModal = false;
		moduleToBeDeleted = null;
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
			<CourseTreeView
				courses={retrivedCourses}
				courseView={viewRoute}
				courseEdit={editRoute}
				onCourseDelete={handleDeleteClick}
				courseCreate={createRoute}
				moduleView={moduleViewRoute}
				moduleEdit={moduleEditRoute}
				onModuleDelete={handleModuleDeleteClick}
				moduleCreate={moduleCreateRoute}
				contentView={contentViewRoute}
				contentEdit={contentEditRoute}
				onContentDelete={handleContentDeleteClick}
				contentCreate={contentCreateRoute}
				bind:expandedCourses
				bind:expandedModules
				bind:courseModules
				bind:moduleContents
				bind:loadingModules
				bind:loadingContents
				bind:courseModuleCounts
				bind:moduleContentCounts
				onSort={sortTable}
				{isSortingName}
				{sortBy}
				{sortOrder}
			/>
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
