<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { browser } from '$app/environment';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { onMount } from 'svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let labRecords = $state(data.labRecordTypes.Items);
	let retrivedLabRecords = $derived(labRecords);

	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const createRoute = `/users/${userId}/lab-records/create`;
	const editRoute = (id) => `/users/${userId}/lab-records/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/lab-records/${id}/view`;
	const labRecordTypesRoute = `/users/${userId}/lab-records`;

	const breadCrumbs = [{ name: 'Lab Records', path: labRecordTypesRoute }];

	let typeName = $state(undefined);
	let displayName = $state(undefined);

	let totalLabRecordsCount = $state(data.labRecordTypes.TotalCount);
	let isSortingName = $state(false);

	let sortBy = $state('TypeName');
	let sortOrder = $state('ascending');
	let isSortingTypeName = $state(false);
	let isSortingDisplayName = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalLabRecordsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchLabRecords(model) {
		try {
			// if (searchKeyword !== model.typeName) {
			// 	paginationSettings.page = 0;
			// }
			// if (searchKeyword !== model.displayName) {
			// 	paginationSettings.page = 0;
			// }
			let url = `/api/server/lab-record-types/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			if (typeName) url += `&typeName=${model.typeName}`;
			if (displayName) url += `&displayName=${model.displayName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalLabRecordsCount = searchResult.Data.LabRecordTypes.TotalCount;
			paginationSettings.size = totalLabRecordsCount;

			labRecords = searchResult.Data.LabRecordTypes.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.typeName;
			// searchKeyword = model.displayName;
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
			searchLabRecords({
				typeName: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	// $effect(() => {
	// 	searchLabRecords({
	// 		typeName,
	// 		displayName,
	// 		itemsPerPage: paginationSettings.limit,
	// 		pageIndex: paginationSettings.page,
	// 		sortBy,
	// 		sortOrder
	// 	});

	// 	if (isDeleting) {
	// 		retrivedLabRecords;
	// 		isDeleting = false;
	// 	}
	// });

	function sortTable(columnName) {
		isSortingTypeName = false;
		isSortingDisplayName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'TypeName') {
			isSortingTypeName = true;
		}
		if (columnName === 'DisplayName') {
			isSortingDisplayName = true;
		}
		sortBy = columnName;
		searchLabRecords({
			typeName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchLabRecords({
			typeName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchLabRecords({
			typeName: searchKeyword,
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

	const handleLabRecordDelete = async (id) => {
		const response = await fetch(`/api/server/lab-record-types/${id}`, {
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
		searchLabRecords({
			typeName: searchKeyword,
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
			<div class="health-system-search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="typeName"
							placeholder="Search by type name"
							bind:value={typeName}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if typeName}
							<button
								type="button"
								onclick={() => {
									typeName = '';
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
							name="displayName"
							placeholder="Search by display name"
							bind:value={displayName}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if displayName}
							<button
								type="button"
								onclick={() => {
									displayName = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" class="text-lg" />
							</button>
						{/if}
					</div>
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute}>Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class="w-12"></th>
							<th class="w-52">
								<button onclick={() => sortTable('TypeName')}>
									Type Name {#if isSortingTypeName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-44">
								<button onclick={() => sortTable('DisplayName')}>
									Display Name
									{#if isSortingDisplayName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-32">Minimum</th>
							<th class="w-32">Maximum</th>
							<th class="w-32">Unit</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedLabRecords <= 0}
							<tr>
								<td colspan="8">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedLabRecords as row, index}
								<tr>
									<!-- <td tabindex="0">{row.index}</td> -->
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td>
										<Tooltip text={row.TypeName || 'Not specified'}>
											<a href={viewRoute(row.id)}
												>{row.TypeName !== null && row.TypeName !== ''
													? Helper.truncateText(row.TypeName, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td tabindex="0">
										<Tooltip text={row.DisplayName || 'Not specified'}>
											{row.DisplayName !== null && row.DisplayName !== ''
												? Helper.truncateText(row.DisplayName, 20)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td>
										{row.NormalRangeMin !== null ? row.NormalRangeMin : 'Not specified'}
									</td>
									<td>{row.NormalRangeMax !== null ? row.NormalRangeMax : 'Not specified'}</td>
									<td tabindex="0"
										>{row.Unit !== null && row.Unit !== '' ? row.Unit : 'Not specified'}</td
									>
									<td>
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
	title="Delete Lab record"
	onConfirm={handleLabRecordDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
