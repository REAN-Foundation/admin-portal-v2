<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	// import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	// import date from 'date-and-time';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Confirm from '$lib/components/modal/confirm.modal.svelte';
	import { onMount } from 'svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;

	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let healthSystems = $state(data.healthSystems.Items);

	let retrivedHealthSystems = $state([]);
	const userId = page.params.userId;
	const healthSystemRoute = `/users/${userId}/health-systems`;
	const editRoute = (id) => `/users/${userId}/health-systems/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/health-systems/${id}/view`;
	const createRoute = `/users/${userId}/health-systems/create`;

	const breadCrumbs = [{ name: 'Health Systems', path: healthSystemRoute }];

	let healthSystemName = $state(undefined);

	let offset = 0;
	let totalHealthSystemsCount = $state(data.healthSystems.TotalCount);
	let isSortingName = $state(false);
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');
	let filteredTemplates = $state([]);
	let paginatedTemplates = $state([]);
	let searchQuery = $state('');

	let retrivedAssessmentTemplates = $state([]);

	let title = $state('');
	let type = $state('');
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let itemsPerPage = $state(10);
	let currentPage = $state(0);
	let isSortingTitle = $state(false);
	let isSortingType = $state(false);

	let items = $state(10);

	let paginationSettings = $derived({
		page: currentPage,
		limit: itemsPerPage,
		size: totalHealthSystemsCount,
		amounts: [10, 20, 30, 50]
	});

	$effect(() => {
		// prevent infinite loop — this is safe because it doesn't change values that trigger it
		const start = paginationSettings.page * paginationSettings.limit;
		const end = start + paginationSettings.limit;
		retrivedHealthSystems = healthSystems.slice(start, end);
	});

	$inspect('retrivedHealth', retrivedHealthSystems);

	async function searchHealthSystem(model) {
		let url = `/api/server/health-systems/search?`;
		url += `sortOrder=${model.sortOrder ?? sortOrder}`;
		url += `&sortBy=${model.sortBy ?? sortBy}`;
		url += `&itemsPerPage=${model.itemsPerPage ?? itemsPerPage}`;
		url += `&pageIndex=${model.pageIndex ?? currentPage}`;
		if (healthSystemName) url += `&name=${model.healthSystemName}`;

		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			// if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const searchResult = await res.json();
			totalHealthSystemsCount = searchResult.TotalCount;
			healthSystems = searchResult.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		if (!browser) return;

		searchHealthSystem({
			healthSystemName,
			itemsPerPage,
			pageIndex: currentPage,
			sortBy,
			sortOrder
		});
	});

	function onPageChange(e: CustomEvent) {
		currentPage = e.detail;
		itemsPerPage = items * (currentPage + 1);
		searchHealthSystem({
			healthSystemName,
			itemsPerPage,
			pageIndex: currentPage,
			sortBy,
			sortOrder
		});
	}

	function onAmountChange(e: CustomEvent) {
		if (healthSystemName) {
			isLoading = true;
			healthSystems = [];
		}
		currentPage = 0;
		items = e.detail;

		itemsPerPage = e.detail * (currentPage + 1);
		searchHealthSystem({
			healthSystemName,
			itemsPerPage,
			pageIndex: currentPage
		});
	}

	function changePage(newPage: number) {
		if (newPage < 0 || newPage >= Math.ceil(totalHealthSystemsCount / paginationSettings.limit))
			return;
		const event = new CustomEvent('page', { detail: newPage });
		onPageChange(event);
	}
	function changeAmount(event: Event) {
		const value = Number((event.target as HTMLSelectElement).value);
		const customEvent = new CustomEvent('amount', { detail: value });
		onAmountChange(customEvent);
	}
	function sortTable(columnName) {
		isSortingName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;
	}

	function closeDeleteModal() {
		deleteButtonClicked = false;
		cardToDelete = null;
	}
	function openDeleteModal(id) {
		deleteButtonClicked = true;
		cardToDelete = id;
	}
	const handleHealthSystemDelete = async (id) => {
		const healthSystemId = id;
		await Delete({
			sessionId: data.sessionId,
			healthSystemId
		});
		invalidate('app:healthSystem');
		deleteButtonClicked = false;
	};

	async function Delete(model) {
		await fetch(`/api/server/health-systems`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
	}

	// let currentPage = $state(1);
	// let itemsPerPage = 2;

	// Derived list based on search, sort and pagination
	// $effect(() => {
	// 	let filtered = healthSystems;

	// 	// Search filter
	// 	if (searchQuery) {
	// 		const lowerQuery = searchQuery.toLowerCase();
	// 		filtered = healthSystems.filter((row) => row.Name?.toLowerCase().includes(lowerQuery));
	// 	}

	// 	// Sort
	// 	filtered.sort((a, b) => {
	// 		const field = isSortingTitle ? 'Title' : null;
	// 		if (!field) return 0;

	// 		const valueA = a[field]?.toLowerCase() || '';
	// 		const valueB = b[field]?.toLowerCase() || '';
	// 		return sortOrder === 'ascending'
	// 			? valueA.localeCompare(valueB)
	// 			: valueB.localeCompare(valueA);
	// 	});

	// 	filteredTemplates = filtered;
	// 	currentPage = 1; // reset to first page when filters change
	// });

	// $effect(() => {
	// 	const start = (currentPage - 1) * itemsPerPage;
	// 	paginatedTemplates = filteredTemplates.slice(start, start + itemsPerPage);
	// });

	// $inspect('paginated template', paginatedTemplates);

	// function changePage(delta: number) {
	// 	const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
	// 	currentPage = Math.max(1, Math.min(currentPage + delta, totalPages));
	// }
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<!-- <div class="mt-1 flex flex-wrap gap-2">
	<div class="relative w-auto grow">
		<input
			type="text"
			name="healthSystemName"
			placeholder="Search by name"
			bind:value={healthSystemName}
			class="input w-full"
		/>
		{#if healthSystemName}
			<button
				type="button"
				onclick={() => {
					healthSystemName = '';
				}}
				class="absolute top-1/2 right-2 -translate-y-1/2 transform cursor-pointer border-0 bg-transparent"
			>
				<Icon icon="material-symbols:close" class="text-lg" />
			</button>
		{/if}
	</div>
	<a href={createRoute} class="health-system-btn variant-filled-secondary">Add New</a>
</div> -->

<div class="px-6">
	<div class="mx-auto">
		<div class="health-system-table-container mb-6 shadow">
			<div class="health-system-search-border p-4 dark:border-gray-700">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative px-1.5">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								name="healthSystemName"
								type="text"
								bind:value={healthSystemName}
								placeholder="Search by name"
								class="health-system-input w-full rounded-lg border border-gray-300 py-2 !pr-4 !pl-10"
							/>
							{#if healthSystemName}
								<button
									type="button"
									onclick={() => {
										healthSystemName = '';
									}}
									class="absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer border-0 bg-transparent"
								>
									<Icon icon="material-symbols:close" class="text-lg" />
								</button>
							{/if}
						</div>
					</div>
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class="w-12"></th>
							<th class=" w-40text-start">
								<button onclick={() => sortTable('Name')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class=" w-40">Created </th>
							<th class="w-20 text-center"></th>
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedHealthSystems.length <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedHealthSystems as row, index}
								<tr>
									<td>
										{currentPage * items + index + 1}
									</td>

									<td role="gridcell" aria-colindex={2} tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 60)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
										{Helper.formatDate(row.CreatedAt)}
									</td>
									<!-- <td class="px-3 py-4 text-sm">
										<a href={editRoute(row.id)} class="health-system-btn">
											<Icon icon="material-symbols:edit-outline" class="text-lg" />
										</a>
									</td> -->
									<td class="">
										<!-- <Confirm confirmTitle="Delete" cancelTitle="Cancel" let:confirm={confirmThis}>
												<button
													onclick={() => confirmThis(handleHealthSystemDelete, row.id)}
													class="btn hover:variant-soft-error -my-1 p-2"
												>
													<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
												</button>
												<span slot="title"> Delete </span>
												<span slot="description">
													Are you sure you want to delete a health system? Hospitals associated with it will
													also get deleted.
												</span>
											</Confirm> -->
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
													onclick={() => openDeleteModal(row.id)}
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

{#if deleteButtonClicked}
	<!-- Overlay -->
	<div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"></div>

	<!-- Modal Container -->
	<div class="fixed inset-0 z-50 flex items-center justify-center px-4">
		<div
			class="w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
		>
			<!-- Header -->
			<div class="text-center sm:text-left">
				<h1 class="text-lg font-semibold text-gray-900 dark:text-white">
					Are you absolutely sure?
				</h1>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
					This action cannot be undone. This will permanently delete your question and remove your
					data from our servers.
				</p>
			</div>

			<!-- Actions -->
			<div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
				<button
					class="mt-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:mt-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
					onclick={closeDeleteModal}
				>
					Cancel
				</button>
				<button
					class="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
					onclick={() => handleHealthSystemDelete(cardToDelete)}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- <div class=" flex items-center justify-between px-6">
	<div class="flex space-x-2">
		<button class="health-system-btn" onclick={() => changePage(-1)} disabled={currentPage === 1}>
			<Icon icon="material-symbols:chevron-left-rounded" width="24" height="24" />
		</button>
		<div class="text-sm text-gray-500">
			Page {currentPage} of {Math.ceil(filteredTemplates.length / itemsPerPage)}
		</div>
		<button
			class="health-system-btn"
			onclick={() => changePage(1)}
			disabled={currentPage === Math.ceil(filteredTemplates.length / itemsPerPage)}
		>
			<Icon icon="material-symbols:chevron-right-rounded" width="24" height="24" />
		</button>
	</div>
</div> -->

<div class="my-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
	<!-- Items Per Page Dropdown -->
	<div class="flex flex-col items-start text-sm text-gray-700 dark:text-gray-300">
		<label for="itemsPerPage" class="mb-1">Items per page</label>
		<div class="relative">
			<select
				id="itemsPerPage"
				class="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-[#1E1F20] dark:text-white"
				onchange={changeAmount}
				bind:value={items}
			>
				<option value={5}>5 records per page</option>
				<option value={10}>10 records per page</option>
				<option value={15}>15 records per page</option>
				<option value={20}>20 records per page</option>
			</select>
			<!-- Chevron Icon -->
			<div
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
			>
				<Icon icon="mdi:chevron-down" class="h-4 w-4" />
			</div>
		</div>
	</div>
	<!-- Pagination Buttons -->
	<div class="flex items-center space-x-2">
		<button
			onclick={() => changePage(paginationSettings.page - 1)}
			disabled={paginationSettings.page <= 0}
		>
			<Icon icon="material-symbols:chevron-left-rounded" width="20" height="20" />
		</button>

		<span class=" text-xs text-gray-500 dark:text-gray-400">
			{paginationSettings.page + 1} of {Math.ceil(
				totalHealthSystemsCount / paginationSettings.limit
			)}
		</span>
		<button
			onclick={() => changePage(paginationSettings.page + 1)}
			disabled={(paginationSettings.page + 1) * paginationSettings.limit >= totalHealthSystemsCount}
		>
			<Icon icon="material-symbols:chevron-right-rounded" width="20" height="20" />
		</button>
	</div>
</div>

<!-- <div class="variant-soft-secondary w-full rounded-lg p-2"> -->
<!-- <Paginator
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		buttonClasses=" text-primary-500"
		regionControl="bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200"
		controlVariant="rounded-full text-primary-500 "
		controlSeparator="fill-primary-400"
	/> -->
<!-- </div> -->
