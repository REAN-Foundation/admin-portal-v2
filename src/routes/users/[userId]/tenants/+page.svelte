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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let tenants = $state(data.tenants.Items);
	let retrivedTenants = $derived(tenants);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	// let searchKeyword = $state(undefined);

	let debounceTimeout;
	let searchKeyword = $state(undefined);
	let promise = $state();

	const userId = page.params.userId;

	const tenantRoute = `/users/${userId}/tenants`;
	const editRoute = (id) => `/users/${userId}/tenants/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/tenants/${id}/view`;
	const createRoute = `/users/${userId}/tenants/create`;

	const breadCrumbs = [{ name: 'Tenants', path: tenantRoute }];

	let nameSearch = $state(undefined);
	let codeSearch = $state(undefined);

	let totalTenantsCount = $state(data.tenants.TotalCount);
	$inspect('totalTenantsCount', totalTenantsCount);
	let isSortingName = $state(false);
	let isSortingCode = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalTenantsCount,
		amounts: [10, 20, 30, 50]
	});

	// $inspect('retrivedTenants', tenants);

	async function searchTenants(filters) {
	try {
		if (filters.name || filters.code) {
			paginationSettings.page = 0;
		}

		let url = `/api/server/tenants/search?`;
		url += `sortOrder=${filters.sortOrder ?? sortOrder}`;
		url += `&sortBy=${filters.sortBy ?? sortBy}`;
		url += `&itemsPerPage=${filters.itemsPerPage ?? paginationSettings.limit}`;
		url += `&pageIndex=${filters.pageIndex ?? paginationSettings.page}`;
		if (filters.name) url += `&name=${filters.name}`;
		if (filters.code) url += `&code=${filters.code}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});

		if (!res.ok) {
			console.error(`Search failed with status ${res.status}`);
			const errorText = await res.text();
			console.error('Error body:', errorText);
			throw new Error(`Search failed: ${res.status}`);
		}

		const searchResult = await res.json();
		console.log('searchResult', searchResult);

		totalTenantsCount = searchResult.Data.TenantRecords.TotalCount;
		paginationSettings.size = totalTenantsCount;

		tenants = searchResult.Data.TenantRecords.Items.map((item, index) => ({
			...item,
			index: index + 1
		}));

		searchKeyword = filters.name;
	} catch (err) {
		console.error('Search failed:', err);
	} finally {
		isLoading = false;
	}
}

function onSearchInput(e, field: 'name' | 'code') {
		clearTimeout(debounceTimeout);
		const keyword = e.target.value;

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;

			if (field === 'name') nameSearch = keyword;
			if (field === 'code') codeSearch = keyword;

			searchTenants({
				nameSearch,
				codeSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}


	// $effect(() => {
	// 	searchTenants({
	// 		name: nameSearch,
	// 		code: codeSearch,
	// 		itemsPerPage: paginationSettings.limit,
	// 		pageIndex: paginationSettings.page,
	// 		sortBy,
	// 		sortOrder
	// 	});

	// 	if (isDeleting) {
	// 		retrivedTenants;
	// 		isDeleting = false;
	// 	}
	// });

	function sortTable(columnName) {
		isSortingName = false;
		isSortingCode = false;

		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		if (columnName === 'Code') {
			isSortingCode = true;
		}
		sortBy = columnName;
		searchTenants({
				nameSearch,
				codeSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
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
		searchTenants({
				nameSearch,
				codeSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
	}

	function onPageChange() {
		searchTenants({
				nameSearch,
				codeSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}

	const handleTenantsDelete = async (id) => {
		console.log('Inside handleTenantsDelete', id);
		const response = await fetch(`/api/server/tenants/${id}`, {
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
		searchTenants({
				nameSearch,
				codeSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-2">
	<div class="mx-auto">
		
		<div class="table-container mb-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative flex-1 pr-1.5">
						<input
							type="text"
							name="name"
							placeholder="Search by name"
							oninput={(event) => onSearchInput(event, 'name')}
							class="table-input-field !pr-4 !pl-10"
						/>
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<!-- {#if nameSearch}
							<button type="button" onclick={() => (nameSearch = '')} class="close-btn">
								<Icon icon="material-symbols:close" />
							</button>
						{/if} -->
					</div>

					<div class="relative flex-1 pr-1.5">
						<input
							type="text"
							name="code"
							placeholder="Search by code"
							oninput={(event) => onSearchInput(event, 'code')}
							class="table-input-field !pr-4 !pl-10"
						/>
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<!-- {#if codeSearch}
							<button type="button" onclick={() => (codeSearch = '')} class="close-btn">
								<Icon icon="material-symbols:close" />
							</button>
						{/if} -->
					</div>

					<button class="table-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead class="">
						<tr>
							<th class="w-12"></th>
							<th class="text-start">
								<button onclick={() => sortTable('Name')}>
									Name {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
									<!-- Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''} -->
								</button>
							</th>
							<th class="text-start">
								<button onclick={() => sortTable('Code')}>
									Code {#if isSortingCode}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
									<!-- Code {isSortingCode ? (sortOrder === 'ascending' ? '▲' : '▼') : ''} -->
								</button>
							</th>
							<th data-sort="Phone">Contact Number</th>
							<th>Email</th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedTenants.length <= 0}
							<tr>
								<td colspan="6">
									{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedTenants as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Code || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{row.Code !== null ? row.Code : 'Not specified'}</td
									>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{row.Phone !== null ? row.Phone : 'Not specified'}</td
									>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{row.Email !== null ? row.Email : 'Not specified'}</td
									>
									<td>
										<div class="flex">
											<Tooltip text="Edit" forceShow={true}>
												<button>
													<a href={editRoute(row.id)} class="table-btn group">
														<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
													</a>
												</button>
											</Tooltip>

											<Tooltip text="View" forceShow={true}>
												<button>
													<a href={viewRoute(row.id)} class="table-btn group">
														<Icon
															icon="icon-park-outline:preview-open"
															class="health-system-icon"
														/>
													</a>
												</button>
											</Tooltip>

											<Tooltip text="Delete" forceShow={true}>
												<button
													class="table-btn !text-red-600"
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
	title="Delete Tenant"
	onConfirm={handleTenantsDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
