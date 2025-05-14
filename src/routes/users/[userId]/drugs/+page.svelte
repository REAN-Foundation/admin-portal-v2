<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let drugs = $state(data.drugs.Items);
	let retrivedDrugs = $derived(drugs);

	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const drugRoute = `/users/${userId}/drugs`;
	const editRoute = (id) => `/users/${userId}/drugs/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/drugs/${id}/view`;
	const createRoute = `/users/${userId}/drugs/create`;

	const breadCrumbs = [{ name: 'Drugs', path: drugRoute }];

	let drugName = $state(undefined);
	let genericName = $state(undefined);

	let totalDrugsCount = $state(data.drugs.TotalCount);
	let isSortingName = $state(false);
	let isSortingGenericName = $state(false);
	let sortBy = $state('DrugName');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalDrugsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchDrug(model) {
		try {
			// if (searchKeyword !== model.drugName) {
			// 	paginationSettings.page = 0;
			// }
			// if (searchKeyword !== model.genericName) {
			// 	paginationSettings.page = 0;
			// }
			let url = `/api/server/drugs/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			if (drugName) url += `&drugName=${model.drugName}`;
			if (genericName) url += `&genericName=${model.genericName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalDrugsCount = searchResult.Data.Drugs.TotalCount;
			paginationSettings.size = totalDrugsCount;
			drugs = searchResult.Data.Drugs.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.drugName;
			// searchKeyword = model.genericName;
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
			searchDrug({
				drugName: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	// $effect(() => {
	// 	searchDrug({
	// 		drugName,
	// 		genericName,
	// 		itemsPerPage: paginationSettings.limit,
	// 		pageIndex: paginationSettings.page,
	// 		sortBy,
	// 		sortOrder
	// 	});
	// 	if (isDeleting) {
	// 		retrivedDrugs;
	// 		isDeleting = false;
	// 	}
	// });

	function sortTable(columnName) {
		isSortingName = false;
		isSortingGenericName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'DrugName') {
			isSortingName = true;
		} else if (columnName === 'GenericName') {
			isSortingGenericName = true;
		}
		sortBy = columnName;
		searchDrug({
			drugName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchDrug({
			drugName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchDrug({
			drugName: searchKeyword,
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

	const handleDrugDelete = async (id) => {
		const response = await fetch(`/api/server/drugs/${id}`, {
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
		searchDrug({
			drugName: searchKeyword,
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
							name="drugName"
							placeholder="Search by name"
							oninput={(event) => onSearchInput(event)}
							bind:value={drugName}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if drugName}
							<button
								type="button"
								onclick={() => {
									drugName = '';
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
							name="genericName"
							placeholder="Search by generic name"
							oninput={(event) => onSearchInput(event)}
							bind:value={genericName}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if genericName}
							<button
								type="button"
								onclick={() => {
									genericName = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
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
							<th class=" w-70">
								<button onclick={() => sortTable('DrugName')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-64">
								<button onclick={() => sortTable('GenericName')}>
									Generic Name {isSortingGenericName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-24">Ingredients</th>
							<th class="w-32">Created</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedDrugs <= 0}
							<tr>
								<td aria-colindex={1} colspan="8"
									>{isLoading ? 'Loading...' : 'No records found'}</td
								>
							</tr>
						{:else}
							{#each retrivedDrugs as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td role="gridcell" aria-colindex={2} tabindex="0">
										<Tooltip text={row.DrugName || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.DrugName !== null && row.DrugName !== ''
													? Helper.truncateText(row.DrugName, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={3} tabindex="0">
										<Tooltip text={row.GenericName || 'Not specified'}>
											{row.GenericName !== null && row.GenericName !== ''
												? Helper.truncateText(row.GenericName, 40)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={4} tabindex="0">
										<Tooltip text={row.Ingredients || 'Not specified'}>
											{row.Ingredients !== null && row.Ingredients !== ''
												? Helper.truncateText(row.Ingredients, 40)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

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
	title="Delete Drugs"
	onConfirm={handleDrugDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
