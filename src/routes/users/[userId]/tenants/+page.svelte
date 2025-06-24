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

	let debounceTimeout;
	let isLoading = $state(false);
	let tenants = $state(data.tenants.Items);
	let retrivedTenants = $derived(tenants);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
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

	$inspect('retrivedTenant, tenants');

	async function searchTenants(model) {
		try {
			let url = `/api/server/tenants/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.name) url += `&name=${model.name}`;
			if (model.code) url += `&code=${model.code}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			const searchResult = await res.json();
			console.log('searchResult', searchResult);

			totalTenantsCount = searchResult.Data.TenantRecords.TotalCount;
			paginationSettings.size = totalTenantsCount;

			tenants = searchResult.Data.TenantRecords.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));

			searchKeyword = model.name;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function onSearchInput(e, field: 'name' | 'code') {
		clearTimeout(debounceTimeout);
		let keyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;
			if (field === 'name') nameSearch = keyword;
			if (field === 'code') codeSearch = keyword;

			searchTenants({
				name: nameSearch,
				code: codeSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

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
			name: nameSearch,
			code: codeSearch,
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
		paginationSettings.page = 0;
		searchTenants({
			name: nameSearch,
			code: codeSearch,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchTenants({
			name: nameSearch,
			code: codeSearch,
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
			name: nameSearch,
			code: codeSearch,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container mb-6 shadow">
			<div class="search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="name"
							placeholder="Search by name"
							oninput={(event) => onSearchInput(event, 'name')}
							class="input !pr-4 !pl-10"
						/>
					</div>

					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="code"
							placeholder="Search by code"
							oninput={(event) => onSearchInput(event, 'code')}
							class="input !pr-4 !pl-10"
						/>
					</div>

					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-12"></th>
							<th class=" text-start">
								<button onclick={() => sortTable('Name')}>
									Name {#if isSortingName}{sortOrder === 'ascending' ? '▲' : '▼'}{/if}
								</button>
							</th>
							<th class=" text-start">
								<button onclick={() => sortTable('Code')}>
									Code {#if isSortingCode}{sortOrder === 'ascending' ? '▲' : '▼'}{/if}
								</button>
							</th>
							<th class="w-50">Contact Number</th>
							<th class="">Email</th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedTenants.length <= 0}
							<tr class="text-center">
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedTenants as row, index}
								<tr>
									<td>{paginationSettings.page * paginationSettings.limit + index + 1}</td>

									<td>
										<Tooltip text={row.Code || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>

									<td>{row.Code !== null ? row.Code : 'Not specified'}</td>
									<td>{row.Phone !== null ? row.Phone : 'Not specified'}</td>
									<td>{row.Email !== null ? row.Email : 'Not specified'}</td>

									<td>
										<div class="flex">
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
	title="Delete Tenant"
	onConfirm={handleTenantsDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
