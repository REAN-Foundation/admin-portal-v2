<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Helper } from '$lib/utils/helper';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import CourseTreeItem from './course-tree-item.svelte';

	let {
		courses,
		courseView,
		courseEdit,
		onCourseDelete,
		moduleView,
		moduleEdit,
		onModuleDelete,
		moduleCreate,
		contentView,
		contentEdit,
		onContentDelete,
		contentCreate,
		expandedCourses = $bindable({}),
		expandedModules = $bindable({}),
		courseModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingModules = $bindable({}),
		loadingContents = $bindable({}),
		courseModuleCounts = $bindable({}),
		moduleContentCounts = $bindable({}),
		onSort,
		isSortingName = false,
		sortOrder = 'ascending'
	} = $props<{
		courses: Array<{
			id: string;
			Name: string;
			Description?: string;
			DurationInDays?: number;
			CreatedAt?: string;
			Modules?: Array<any>;
		}>;
		courseView: (courseId: string) => string;
		courseEdit?: (courseId: string) => string;
		onCourseDelete?: (courseId: string) => void;
		courseCreate?: string;
		moduleView: (courseId: string, moduleId: string) => string;
		moduleEdit?: (courseId: string, moduleId: string) => string;
		onModuleDelete?: (moduleId: string, courseId?: string) => void;
		moduleCreate?: (courseId: string) => string;
		contentView?: (courseId: string, moduleId: string, contentId: string) => string;
		contentEdit?: (courseId: string, moduleId: string, contentId: string) => string;
		onContentDelete?: (contentId: string) => void;
		contentCreate?: (courseId: string, moduleId: string) => string;
		expandedCourses?: Record<string, boolean>;
		expandedModules?: Record<string, boolean>;
		courseModules?: Record<string, any[]>;
		moduleContents?: Record<string, any[]>;
		loadingModules?: Record<string, boolean>;
		loadingContents?: Record<string, boolean>;
		courseModuleCounts?: Record<string, number>;
		moduleContentCounts?: Record<string, number>;
		onSort?: (columnName: string) => void;
		isSortingName?: boolean;
		sortBy?: string;
		sortOrder?: 'ascending' | 'descending';
	}>();

	const toggleCourseModules = async (courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();

		if (expandedCourses[courseId]) {
			expandedCourses = { ...expandedCourses, [courseId]: false };
		} else {
			expandedCourses = { ...expandedCourses, [courseId]: true };

			if (!loadingModules[courseId] && (!courseModules[courseId] || courseModules[courseId].length === 0)) {
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
				let url = `/api/server/lms/course.modules/search?`;
				url += `itemsPerPage=${itemsPerPage}`;
				url += `&pageIndex=${pageIndex}`;
				url += `&sortBy=Name`;
				url += `&sortOrder=ascending`;
				url += `&courseId=${encodeURIComponent(courseId)}`;

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
				let modulesList: any[] = [];

				if (searchResult.Data && searchResult.Data.CourseModuleRecords) {
					const courseModuleRecords = searchResult.Data.CourseModuleRecords;

					if (courseModuleRecords.Items && Array.isArray(courseModuleRecords.Items)) {
						modulesList = courseModuleRecords.Items;
						modulesList = modulesList.filter(
							(module) => module.CourseId === courseId || module.courseId === courseId
						);

						const totalCount = courseModuleRecords.TotalCount;
						const currentCount = allModules.length + modulesList.length;
						hasMore = currentCount < totalCount && modulesList.length === itemsPerPage;
					} else if (Array.isArray(courseModuleRecords)) {
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

	const toggleModuleContents = async (moduleId: string, courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();

		if (expandedModules[moduleId]) {
			expandedModules = { ...expandedModules, [moduleId]: false };
		} else {
			expandedModules = { ...expandedModules, [moduleId]: true };
			if (!loadingContents[moduleId]) {
				await fetchModuleContents(moduleId);
			}
		}
	};

	const fetchModuleContents = async (moduleId: string) => {
		try {
			loadingContents = { ...loadingContents, [moduleId]: true };
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


	const handleCourseDeleteClick = (courseId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onCourseDelete) {
			onCourseDelete(courseId);
		}
	};
</script>

<div class="w-full">
	<div class="overflow-x-auto">
		<table class="table-c min-w-full">
			<thead>
				<tr>
					<th class="w-[2%]"></th>
					<th class="w-[20%]">
						{#if onSort}
							<button onclick={() => onSort('Name')} class="flex items-center gap-1">
								Name
								{#if isSortingName}
									{#if sortOrder === 'ascending'}
										<Icon icon="mdi:chevron-up" class="inline" width="16" />
									{:else}
										<Icon icon="mdi:chevron-down" class="inline" width="16" />
									{/if}
								{/if}
							</button>
						{:else}
							Name
						{/if}
					</th>
					<th class="w-[20%]">Description</th>
					<th class="w-[15%]">Duration (Days)</th>
					<th class="w-[15%]">Created</th>
					<th class="w-[23%]"></th>
				</tr>
			</thead>
			<tbody>
				{#if courses && courses.length > 0}
					{#each courses as course, courseIndex}
						{@const fetchedModules = courseModules[course.id]}
						{@const cachedCount = courseModuleCounts[course.id]}
						{@const moduleCount =
							fetchedModules !== undefined
								? fetchedModules.length
								: cachedCount !== undefined
									? cachedCount
									: (course.ModuleCount ??
										course.ModulesCount ??
										course.moduleCount ??
										course.modulesCount ??
										course.TotalModules ??
										course.totalModules ??
										course.Modules?.length ??
										course.modules?.length ??
										0)}
						{@const isCourseExpanded = expandedCourses[course.id]}
						
						<!-- Course Row -->
						<tr class={isCourseExpanded ? 'bg-gray-100 hover:!bg-gray-100' : ''}>
							<td>{courseIndex + 1}</td>
							<td>
								<button
									onclick={(e) => toggleCourseModules(course.id, e)}
									class="flex cursor-pointer items-center gap-2 text-left hover:underline"
								>
									<Icon
										icon={isCourseExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
										class="inline"
										width="16"
									/>
									<span>
										{course.Name !== null && course.Name !== ''
											? Helper.truncateText(course.Name, 50)
											: 'Not specified'}
									</span>
								</button>
							</td>
							<td>
								{course.Description !== null && course.Description !== ''
									? Helper.truncateText(course.Description, 50)
									: 'Not specified'}
							</td>
							<td>
								{course.DurationInDays !== null && course.DurationInDays !== undefined
									? course.DurationInDays
									: 'Not specified'}
							</td>
							<td>
								{course.CreatedAt
									? TimeHelper.formatDateToReadable(course.CreatedAt, LocaleIdentifier.EN_US)
									: 'Not specified'}
							</td>
							<td>
								<div class="flex items-center justify-end gap-2">
									<span class="text-sm text-gray-700">Modules ({moduleCount})</span>
									{#if moduleCreate}
										<Button
											href={moduleCreate(course.id)}
											variant="icon"
											icon="material-symbols:add"
											iconSize="sm"
											tooltip="Add New Module"
										/>
									{/if}
									{#if courseEdit}
										<Button
											href={courseEdit(course.id)}
											variant="icon"
											icon="material-symbols:edit-outline"
											iconSize="sm"
											tooltip="Edit"
										/>
									{/if}
									<Button
										href={courseView(course.id)}
										variant="icon"
										icon="icon-park-outline:preview-open"
										iconSize="sm"
										tooltip="View"
									/>
									{#if onCourseDelete}
										<Button
											onclick={(e) => handleCourseDeleteClick(course.id, e)}
											variant="icon"
											icon="material-symbols:delete-outline-rounded"
											iconSize="sm"
											color="red"
											tooltip="Delete"
										/>
									{/if}
								</div>
							</td>
						</tr>

						<!-- Modules Row (when course is expanded) -->
						{#if isCourseExpanded}
							{@const courseModulesList = courseModules[course.id] || course.Modules || []}
							{@const hasModules = courseModulesList && courseModulesList.length > 0}
							{@const isLoading = loadingModules[course.id]}
							
							<tr>
								<td colspan="6" class="bg-gray-100 p-4">
									{#if isLoading}
										<div class="flex items-center gap-2 text-gray-500">
											<Icon icon="svg-spinners:ring-resize" class="inline" width="20" />
											<span>Loading modules...</span>
										</div>
									{:else if hasModules}
										<div class="space-y-2 pl-4">
											{#each courseModulesList as module}
												<CourseTreeItem
													{module}
													courseId={course.id}
													{moduleView}
													{moduleEdit}
													{onModuleDelete}
													bind:expandedModules
													bind:moduleContents
													bind:loadingContents
													bind:moduleContentCounts
													onModuleExpand={toggleModuleContents}
													{contentView}
													{contentEdit}
													{contentCreate}
													{onContentDelete}
												/>
											{/each}
										</div>
									{:else}
										<div class="text-gray-500 italic">No modules found for this course</div>
									{/if}
								</td>
							</tr>
						{/if}
					{/each}
				{:else}
					<tr class="text-center">
						<td colspan="6">No courses found</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
