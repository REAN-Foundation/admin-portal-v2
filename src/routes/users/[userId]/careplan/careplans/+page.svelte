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

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let careplans = $state(data.carePlans.Items);
	let retrivedCarePlan = $derived(careplans);

	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);
	let promise = $state();

	const userId = page.params.userId;
	const careplanRoute = `/users/${userId}/careplan/careplans`;
	const editRoute = (id) => `/users/${userId}/careplan/careplans/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/careplan/careplans/${id}/view`;
	const createRoute = `/users/${userId}/careplan/careplans/create`;
	const importRoute = `/users/${userId}/careplan/careplans/import`;

	const breadCrumbs = [{ name: 'Careplans', path: careplanRoute }];

	let carePlanName = $state(undefined);

	let totalCareplanCount = $state(data.carePlans.TotalCount);

	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalCareplanCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchCareplan(model) {
		try {
			let url = `/api/server/careplan/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.carePlanName) url += `&name=${model.carePlanName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();

			totalCareplanCount = searchResult.Data.TotalCount;
			paginationSettings.size = totalCareplanCount;

			careplans = searchResult.Data.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.carePlanName;
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
			searchCareplan({
				carePlanName: searchKeyword,
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
		searchCareplan({
			carePlanName: searchKeyword,
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
		searchCareplan({
			carePlanName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchCareplan({
			carePlanName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleCareplanDelete = async (id) => {
		const response = await fetch(`/api/server/careplan/${id}`, {
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
		searchCareplan({
			carePlanName: searchKeyword,
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
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="title"
							oninput={(event) => onSearchInput(event)}
							placeholder="Search by name"
							bind:value={carePlanName}
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if carePlanName}
							<button
								type="button"
								onclick={() => {
									carePlanName = '';
									onSearchInput({ target: { name: 'carePlanName', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<Button href={importRoute} text="Import" variant="primary" />

					<Button href={createRoute} text="Add New" variant="primary" />
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-[2%]"></th>
							<th class=" w-[20%]">
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
							<th class="w-[20%]">Created </th>
							<th class="w-[20%]"></th>
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedCarePlan.length <= 0}
							<tr>
								<td class=" text-center" colspan="6"
									>{isLoading ? 'Loading...' : 'No records found'}</td
								>
							</tr>
						{:else}
							{#each retrivedCarePlan as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
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
	title="Delete careplan"
	onConfirm={handleCareplanDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
