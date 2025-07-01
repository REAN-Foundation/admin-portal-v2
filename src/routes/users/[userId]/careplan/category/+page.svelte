<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let categories = $state(data.careplanCategories);
	let retrievedCategories = $derived(categories);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);
	let promise = $state();
	const userId = page.params.userId;
	const categoryRoute = `/users/${userId}/careplan/category`;
	const editRoute = (id) => `/users/${userId}/careplan/category/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/careplan/category/${id}/view`;
	const createRoute = `/users/${userId}/careplan/category/create`;
	const breadCrumbs = [{ name: 'Careplan Categories', path: categoryRoute }];
	let categoryType = $state(undefined);
	let totalCategoryCount = $state(data.totalCount);
	let isSortingName = $state(false);
	let sortBy = $state('Type');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalCategoryCount,
		amounts: [10, 20, 30, 50]
	});

	async function SearchCategory(model) {
		try {
			let url = `/api/server/careplan/category/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.categoryType) url += `&type=${model.categoryType}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();

			totalCategoryCount = searchResult.Data.Items.TotalCount;
			paginationSettings.size = totalCategoryCount;

			categories = searchResult.Data.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.categoryType;
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
			SearchCategory({
				categoryType: searchKeyword,
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
		if (columnName === 'Type') {
			isSortingName = true;
		}
		sortBy = columnName;
		SearchCategory({
			categoryType: searchKeyword,
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
		SearchCategory({
			categoryType: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		SearchCategory({
			categoryType: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const hanleCategoryDelete = async (id) => {
		const response = await fetch(`/api/server/careplan/category/${id}`, {
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
		SearchCategory({
			categoryType: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-2">
	<div class="mx-auto">
		<div class="table-container my-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<input
							type="text"
							name="categoryType"
							placeholder="Search by name"
							bind:value={categoryType}
							oninput={(event) => onSearchInput(event)}
							class="table-input-field !pr-4 !pl-10"
						/>
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						{#if categoryType}
							<button
								type="button"
								onclick={() => {
									categoryType = '';
									onSearchInput({ target: { value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<Button href={createRoute} text="Add New" variant="primary" />
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-2"></th>
							<th class="text-start">
								<button onclick={() => sortTable('Type')}>
									Type {#if isSortingName}
										<Icon
											icon={`mdi:chevron-${sortOrder === 'ascending' ? 'up' : 'down'}`}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th>Description</th>
							<th class=""></th>
						</tr>
					</thead>
					<tbody>
						{#if retrievedCategories.length <= 0}
							<tr>
								<td class="text-center" colspan="4">
									{isLoading ? 'Loading...' : 'No records found'}
								</td>
							</tr>
						{:else}
							{#each retrievedCategories as row, index}
								<tr>
									<td>{paginationSettings.page * paginationSettings.limit + index + 1}</td>
									<td>
										<a href={viewRoute(row.id)}>{Helper.truncateText(row.Type, 50)}</a>
									</td>
									<td>{row.Description || 'Not specified'}</td>
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
	title="Delete Care Plan Category"
	onConfirm={hanleCategoryDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
