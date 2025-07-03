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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let assessmentTemplates = $state(data.assessmentTemplate.Items);
	let retrivedAssessmentTemplates = $derived(assessmentTemplates);
	let totalAssessmentTemplatesCount = $state(data.assessmentTemplate.TotalCount);

	const userId = page.params.userId;
	const assessmentRoute = `/users/${userId}/assessment-templates`;
	const editRoute = (id) => `/users/${userId}/assessment-templates/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/assessment-templates/${id}/view`;
	const createRoute = `/users/${userId}/assessment-templates/create`;
	const importRoute = `/users/${userId}/assessment-templates/import`;

	const breadCrumbs = [{ name: 'Assessments', path: assessmentRoute }];

	let debounceTimeout;
	let isLoading = $state(false);
	let title = $state(undefined);
	let type = $state(undefined);
	let tags = $state(undefined);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	let sortBy = $state('Title');
	let sortOrder = $state('ascending');

	let isSortingTitle = $state(false);
	let isSortingType = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalAssessmentTemplatesCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchAssessmentTemplate(model) {
		try {
			let url = `/api/server/assessments/assessment-templates/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			if (model.title) url += `&title=${model.title}`;
			if (model.type) url += `&type=${model.type}`;
			if (model.tags) url += `&tags=${model.tags}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			const searchResult = await res.json();

			totalAssessmentTemplatesCount = searchResult.Data.AssessmentTemplateRecords.TotalCount;
			paginationSettings.size = totalAssessmentTemplatesCount;

			assessmentTemplates = searchResult.Data.AssessmentTemplateRecords.Items.map(
				(item, index) => ({
					...item,
					index: index + 1
				})
			);

			searchKeyword = model.title;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'title') {
			title = value;
		} else if (name === 'type') {
			type = value;
		} else if (name === 'tags') {
			tags = value;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;
		updateSearchField(name, value);

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchAssessmentTemplate({
				title,
				type,
				tags,
				itemsPerPage: paginationSettings.limit,
				pageIndex: paginationSettings.page,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchAssessmentTemplate({
			title,
			type,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchAssessmentTemplate({
			title,
			type,
			tags,
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
			title,
			type,
			tags,
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

		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchAssessmentTemplate({
			title,
			type,
			tags,
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
		<div class="table-container mb-6 shadow">
			<div class="search-border">
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
							oninput={(event) => onSearchInput(event)}
							placeholder="Search by title"
							bind:value={title}
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

					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="type"
							placeholder="Search by type"
							oninput={(event) => onSearchInput(event)}
							bind:value={type}
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if type}
							<button
								type="button"
								onclick={() => {
									type = '';
									onSearchInput({ target: { name: 'type', value: '' } });
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
							oninput={(event) => onSearchInput(event)}
							placeholder="Search by tags"
							bind:value={tags}
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if tags}
							<button
								type="button"
								onclick={() => {
									tags = '';
									onSearchInput({ target: { name: 'tags', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<!-- </div> -->
					<Button href={importRoute} text="Import" variant="primary"></Button>

					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-[5%]"></th>
							<th class="w-[20%]">
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
							<th class="w-[20%]">
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
							<th class="w-[20%]">Tags</th>
							<th class="w-[20%]">Provider</th>
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedAssessmentTemplates <= 0}
							<tr class="text-center">
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
	title="Delete Assessment Template"
	onConfirm={handleAssessmentTemplateDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
