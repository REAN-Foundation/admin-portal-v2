<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let isLoading = $state(false);
	let assessmentTemplates = $state(data.assessmentTemplate.Items);
	let retrivedAssessmentTemplates = $derived(assessmentTemplates);
	let debounceTimeout;

	const userId = page.params.userId;
	const assessmentRoute = `/users/${userId}/assessment-templates`;
	const editRoute = (id) => `/users/${userId}/assessment-templates/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/assessment-templates/${id}/view`;
	const createRoute = `/users/${userId}/assessment-templates/create`;
	const importRoute = `/users/${userId}/assessment-templates/import`;

	const breadCrumbs = [{ name: 'Assessments', path: assessmentRoute }];

	let title = $state(undefined);
	let type = $state(undefined);
	let tags = $state(undefined);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	let sortBy = $state('Title');
	let sortOrder = $state('ascending');

	let totalAssessmentTemplatesCount = $state(data.assessmentTemplate.TotalCount);
	let isSortingTitle = $state(false);
	let isSortingType = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalAssessmentTemplatesCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchAssessmentTemplate(model) {
		if (searchKeyword !== model.title) {
			paginationSettings.page = 0;
		}
		if (searchKeyword !== model.type) {
			paginationSettings.page = 0;
		}
		if (searchKeyword !== model.tags) {
			paginationSettings.page = 0;
		}
		let url = `/api/server/assessments/assessment-templates/search?`;
		url += `sortOrder=${model.sortOrder ?? sortOrder}`;
		url += `&sortBy=${model.sortBy ?? sortBy}`;
		url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
		url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
		if (title) url += `&title=${model.title}`;
		if (type) url += `&type=${model.type}`;
		if (tags) url += `&tags=${tags}`;
		console.log('URL: ' + url);
		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalAssessmentTemplatesCount = searchResult.Data.AssessmentTemplate.TotalCount;
			paginationSettings.size = totalAssessmentTemplatesCount;
			assessmentTemplates = searchResult.Data.AssessmentTemplate.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		console.log('healthSystemName**', title);
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchAssessmentTemplate({
				title: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}
	// $effect(() => {
	// 	searchAssessmentTemplate({
	// 		title,
	// 		type,
	// 		tags,
	// 		itemsPerPage: paginationSettings.limit,
	// 		pageIndex: paginationSettings.page,
	// 		sortBy,
	// 		sortOrder
	// 	});
	// 	if (isDeleting) {
	// 		retrivedAssessmentTemplates;
	// 		isDeleting = false;
	// 	}
	// });

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchAssessmentTemplate({
			title: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchAssessmentTemplate({
			title: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function sortTable(columnName) {
		isSortingTitle = false;
		isSortingType = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Title') {
			isSortingTitle = true;
		} else if (columnName === 'Type') {
			isSortingType = true;
		}
		sortBy = columnName;
		searchAssessmentTemplate({
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

	const handleAssessmentTemplateDelete = async (id) => {
		const response = await fetch(`/api/server/assessments/assessment-templates/${id}`, {
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
		searchAssessmentTemplate({
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
		<div class="health-system-table-container mb-6 shadow">
			<div class="health-system-search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<!-- <div class="flex gap-4 flex-row"> -->
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="title"
							placeholder="Search by title"
							bind:value={title}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if title}
							<button
								type="button"
								onclick={() => {
									title = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>

					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="type"
							placeholder="Search by type"
							bind:value={type}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if type}
							<button
								type="button"
								onclick={() => {
									type = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="tags"
							placeholder="Search by tags"
							bind:value={tags}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if tags}
							<button
								type="button"
								onclick={() => {
									tags = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<!-- </div> -->
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={importRoute}>Import</a>
						<!-- <a href={createRoute} class="btn variant-filled-secondary">Add New</a> -->
					</button>
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute}>Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-12">Id</th>
							<th>
								<button onclick={() => sortTable('Title')}>
									Title
									{#if isSortingTitle}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th>
								<button onclick={() => sortTable('Type')}>
									Type
									{#if isSortingType}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th>Tags</th>
							<th>Provider</th>
							<th />
							<th />
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedAssessmentTemplates <= 0}
							<tr>
								<td aria-colindex={1} colspan="8">
									{isLoading ? 'Loading...' : 'No records found'}
								</td>
							</tr>
						{:else}
							{#each retrivedAssessmentTemplates as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td role="gridcell" aria-colindex={2} tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Title !== null && row.Title !== ''
													? Helper.truncateText(row.Title, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={3} tabindex="0">
										{Helper.truncateText(row.Type, 40)}
									</td>
									<td role="gridcell" aria-colindex={2} tabindex="0"
										>{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td
									>
									<td role="gridcell" aria-colindex={2} tabindex="0">
										{row.Provider !== null && row.Provider !== ''
											? Helper.truncateText(row.Provider, 40)
											: 'Not specified'}
									</td>

									<td role="gridcell" aria-colindex={2} tabindex="0">
										<div class="flex">
											<Tooltip text="Edit" forceShow={true}>
												<button class="">
													<a href={editRoute(row.id)} class="health-system-btn group">
														<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
													</a>
												</button>
											</Tooltip>

											<Tooltip text="View" forceShow={true}>
												<button>
													<a href={viewRoute(row.id)} class=" health-system-btn group"
														><Icon
															icon="icon-park-outline:preview-open"
															class="health-system-icon"
														/>
													</a>
												</button>
											</Tooltip>

											<Tooltip text="Delete" forceShow={true}>
												<button
													class="health-system-btn !text-red-600"
													onclick={() => handleDeleteClick(row.id)}
												>
													<Icon icon="material-symbols:delete-outline-rounded" />
												</button>
											</Tooltip>
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
	title="Delete Assessment Template"
	onConfirm={handleAssessmentTemplateDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
