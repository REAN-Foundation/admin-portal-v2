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
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	
	const userId = page.params.userId;
	const courseId = page.params.courseId;
	const moduleId = page.params.moduleId;
	const contentsRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents`;
	const createRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/create`;
	const editRoute = (contentId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/edit`;
	const viewRoute = (contentId) => `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
	const modulesRoute = `/users/${userId}/courses/${courseId}/modules`;
	const courseViewRoute = `/users/${userId}/courses/${courseId}/view`;

	const breadCrumbs = [
		{ name: 'Courses', path: courseViewRoute },
		{ name: 'Modules', path: modulesRoute },
		{ name: 'Contents', path: contentsRoute }
	];

	let title = $state(undefined);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const initialContentData = data.contents;
	const initialContents = initialContentData?.Items || [];
	const initialTotalCount = initialContentData?.TotalCount || 0;
	
	let contents = $state(Array.isArray(initialContents) ? initialContents.map((item, index) => ({
		...item,
		index: index + 1
	})) : []);
	let retrivedContents = $derived(contents);
	let totalContentsCount = $state(initialTotalCount);
	let isSortingTitle = $state(false);
	let sortBy = $state('Title');
	let sortOrder = $state('ascending');
	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: initialTotalCount,
		amounts: [10, 20, 30, 50]
	});

	$effect(() => {
		paginationSettings.size = totalContentsCount;
	});

	async function searchContent(model) {
		try {
			isLoading = true;
			let url = `/api/server/lms/content/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			url += `&moduleId=${moduleId}`;
			if (model.title) url += `&title=${model.title}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			const courseContentRecords = searchResult?.Data?.CourseContentRecords;
			
			totalContentsCount = courseContentRecords?.TotalCount;
			paginationSettings.size = totalContentsCount;

			contents = (courseContentRecords?.Items || []).map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.title;
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
			paginationSettings.page = 0; 
			searchContent({
				title: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingTitle = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Title') {
			isSortingTitle = true;
		}
		sortBy = columnName;
		searchContent({
			title: searchKeyword,
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
		searchContent({
			title: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchContent({
			title: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleContentDelete = async (id) => {
		const response = await fetch(`/api/server/lms/content/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchContent({
			title: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
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
								name="title"
								type="text"
								bind:value={title}
								oninput={(event) => onSearchInput(event)}
								placeholder="Search by title"
								class="table-input-field !pr-4 !pl-10"
							/>
							{#if title}
								<button
									type="button"
									onclick={() => {
										title = '';
										onSearchInput({ target: { name: 'title', value: '' } });
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
							<th class="w-[25%]">
								<button onclick={() => sortTable('Title')}>
									Title {#if isSortingTitle}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-[30%]">Description</th>
							<th class="w-[15%]">Duration (Mins)</th>
							<th class="w-[25%]"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedContents.length <= 0}
							<tr class="text-center">
								<td colspan="5">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedContents as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Title || 'Not specified'}>
											{row.Title !== null && row.Title !== ''
												? Helper.truncateText(row.Title, 50)
												: 'Not specified'}
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
										{row.DurationInMins !== null && row.DurationInMins !== undefined
											? row.DurationInMins
											: 'Not specified'}
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
	title="Delete Content"
	onConfirm={handleContentDelete}
	id={idToBeDeleted}
	message="Are you sure you want to delete this content?"
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />

