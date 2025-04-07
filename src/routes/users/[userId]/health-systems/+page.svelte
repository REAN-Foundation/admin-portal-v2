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
	let retrivedHealthSystems = $state();
	const userId = page.params.userId;
	const healthSystemRoute = `/users/${userId}/health-systems`;
	const editRoute = (id) => `/users/${userId}/health-systems/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/health-systems/${id}/view`;
	const createRoute = `/users/${userId}/health-systems/create`;

	const breadCrumbs = [{ name: 'Health Systems', path: healthSystemRoute }];

	let healthSystemName = $state(undefined);
	let sortBy = 'Name';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalHealthSystemsCount = $state(data.healthSystems.TotalCount);
	let isSortingName = $state(false);
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	let paginationSettings = $state({
		currentPage: 0,
		limit: 10,
		size: totalHealthSystemsCount
	});

	$inspect('healthsystemName', healthSystemName);

	async function searchHealthSystem(model) {
		console.log('in search health system');

		let url = `/api/server/health-systems/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${model.itemsPerPage}`;
		if (offset) url += `&pageIndex=${model.pageIndex}`;
		if (healthSystemName) url += `&name=${model.healthSystemName}`;

		console.log('url', url);

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});

		const searchResult = await res.json();
		totalHealthSystemsCount = searchResult.TotalCount;
		healthSystems = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalHealthSystemsCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		if (healthSystemName) {
			paginationSettings.currentPage = 0;
		}
		healthSystems = healthSystems.map((item, index) => ({ ...item, index: index + 1 }));

		paginationSettings.size = totalHealthSystemsCount;
		retrivedHealthSystems = healthSystems.slice(
			paginationSettings.currentPage * paginationSettings.limit,
			paginationSettings.currentPage * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedHealthSystems.length > 0) {
			isLoading = false;
		}
	});

	if (browser) {
		searchHealthSystem({
			healthSystemName,
			itemsPerPage: itemsPerPage,
			pageIndex: offset,
			sortOrder: sortOrder,
			sortBy: sortBy
		});
	}

	// $: console.log('retrivedHealthSystems', retrivedHealthSystems);

	function onPageChange(e: CustomEvent): void {
		isLoading = true;
		let pageIndex = e.detail;
		itemsPerPage = items * (pageIndex + 1);
	}

	function onAmountChange(e: CustomEvent): void {
		if (healthSystemName) {
			isLoading = true;
			healthSystems = [];
		}
		itemsPerPage = e.detail * (paginationSettings.currentPage + 1);
		items = itemsPerPage;
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

	function handlePageChange(event) {
		paginationSettings.currentPage = event.detail.page;
		console.log('New page:', paginationSettings.currentPage);
	}

	function handleItemsChange(event) {
		itemsPerPage = event.detail.itemsPerPage;
		console.log('Items per page:', itemsPerPage);
	}
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

<div class="p-6">
	<div class="mx-auto">
		<div class="mb-6 rounded-lg bg-white shadow dark:bg-neutral-800">
			<div class="border-b border-gray-200 p-4 dark:border-gray-700">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="text"
								placeholder="Search..."
								class="focus:ring-primary-500 w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
							/>
						</div>
					</div>
					<div>
						<!-- <select
							class="focus:ring-primary-500 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
						>
							<option value="all">All Locations</option>
							{#each locations as location}
								<option value={location}>{location}</option>
							{/each}
						</select> -->

						<a href={createRoute} class="health-system-btn variant-filled-secondary">Add New</a>
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class="w-12"></th>
							<th class=" text-start">
								<button onclick={() => sortTable('Name')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="  text-start">Created </th>
							<th class=" w-20 text-center">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#if retrivedHealthSystems <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedHealthSystems as row}
								<tr class="hover:bg-gray-50">
									<td class=" text-sm">
										{row.index}
									</td>

									<td class="text-sm" role="gridcell" aria-colindex={2} tabindex="0">
										<a href={viewRoute(row.id)}>
											{row.Name !== null && row.Name !== ''
												? Helper.truncateText(row.Name, 50)
												: 'Not specified'}
										</a>
									</td>
									<td class=" text-sm" role="gridcell" aria-colindex={5} tabindex="0">
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
										2025-april-08
									</td>
									<!-- <td class="px-3 py-4 text-sm">
										<a href={editRoute(row.id)} class="health-system-btn">
											<Icon icon="material-symbols:edit-outline" class="text-lg" />
										</a>
									</td> -->
									<td class="flex !px-2">
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
											<button>
												<a href={editRoute(row.id)} class="health-system-btn">
													<Icon icon="material-symbols:edit-outline"  />
												</a>
											</button>

											<button>
												<a href={viewRoute(row.id)} class=" health-system-btn"
													><Icon icon="icon-park-outline:preview-open" />
												</a>
											</button>

											<button class="health-system-btn" onclick={() => openDeleteModal(row.id)}>
												<Icon icon="material-symbols:delete-outline-rounded" />
											</button>
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

<div class="variant-soft-secondary w-full rounded-lg p-2">
	<!-- <Paginator
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		buttonClasses=" text-primary-500"
		regionControl="bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200"
		controlVariant="rounded-full text-primary-500 "
		controlSeparator="fill-primary-400"
	/> -->


</div>
