<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';

	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { onMount } from 'svelte';
	import { redirect } from 'sveltekit-flash-message/server';
	import type { PaginationSettings } from '$lib/types/common.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let hospitals = $state(data.hospitals.Items);
	let retrivedHospitals = $derived(hospitals);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const hospitalRoute = `/users/${userId}/hospitals`;
	const editRoute = (id) => `/users/${userId}/hospitals/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/hospitals/${id}/view`;
	const createRoute = `/users/${userId}/hospitals/create`;

	const breadCrumbs = [{ name: 'Hospitals', path: hospitalRoute }];

	let hospitalName = $state(undefined);
	let tags = $state(undefined);

	let totalHospitalsCount = $state(data.hospitals.TotalCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let isSortingHealthSystemName = $state(false);
	let isSortingTags = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalHospitalsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchHospital(model) {
		try {
			let url = `/api/server/hospitals/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			if (model.hospitalName) url += `&name=${model.hospitalName}`;
			if (model.tags) url += `&tags=${model.tags}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			const searchResult = await res.json();

			console.log('searchResult=>', searchResult);

			totalHospitalsCount = searchResult.Data.Hospitals.TotalCount;
			paginationSettings.size = totalHospitalsCount;

			hospitals = searchResult.Data.Hospitals.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.hospitalName;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'hospitalName') {
			hospitalName = value;
		} else if (name === 'tags') {
			tags = value;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;
		updateSearchField(name, value);

		console.log('healthSystemName**', hospitalName);
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchHospital({
				hospitalName,
				tags,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;
		isSortingHealthSystemName = false;
		isSortingTags = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		} else if (columnName === 'Tags') {
			isSortingTags = true;
		}
		sortBy = columnName;

		searchHospital({
			hospitalName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchHospital({
			hospitalName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortOrder,
			sortBy
		});
	}

	function onPageChange() {
		searchHospital({
			hospitalName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	const handleHospitalDelete = async (id) => {
		const response = await fetch(`/api/server/hospitals/${id}`, {
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

		searchHospital({
			hospitalName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container z-0 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow pl-1.5">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="hospitalName"
							bind:value={hospitalName}
							placeholder="Search by name"
							oninput={(event) => onSearchInput(event)}
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if hospitalName}
							<button
								type="button"
								onclick={() => {
									hospitalName = '';
									onSearchInput({ target: { name: 'hospitalName', value: '' } });
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
							bind:value={tags}
							oninput={(event) => onSearchInput(event)}
							placeholder="Search by tags"
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
					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-10"></th>
							<th class=" w-64 text-start">
								<button onclick={() => sortTable('Name')}>
									Name
									{#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class=" w-64">
								<button> Health System </button>
							</th>
							<th class=" w-36">
								<button onclick={() => sortTable('Tags')}>
									Tags
									{#if isSortingTags}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-40">Created </th>
							<th class="w-16"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedHospitals.length <= 0}
							<tr class="text-center">
								<td colspan="6" class="text-center"
									>{isLoading ? 'Loading...' : 'No records found'}</td
								>
							</tr>
						{:else}
							{#each retrivedHospitals as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td role="gridcell" aria-colindex={2} tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td tabindex="0">
										<Tooltip text={row.HealthSystemName || 'Not specified'}>
											{row.HealthSystemName !== null && row.HealthSystemName !== ''
												? Helper.truncateText(row.HealthSystemName, 50)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td tabindex="0">{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td>
									<td tabindex="0">
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

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
	title="Delete Hospital "
	onConfirm={handleHospitalDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
