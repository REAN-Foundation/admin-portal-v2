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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let hospitals = $state(data.hospitals.Items);
	let retrivedHospitals = $state();
	const userId = page.params.userId;
	const hospitalRoute = `/users/${userId}/hospitals`;
	const editRoute = (id) => `/users/${userId}/hospitals/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/hospitals/${id}/view`;
	const createRoute = `/users/${userId}/hospitals/create`;

	const breadCrumbs = [{ name: 'Hospitals', path: hospitalRoute }];

	let hospitalName = $state(undefined);
	let tags = $state(undefined);
	let sortBy = 'Name';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalHospitalsCount = $state(data.hospitals.TotalCount);
	let isSortingName = $state(false);
	let isSortingHealthSystemName = $state(false);
	let isSortingTags = false;
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	let paginationSettings = $derived({
		page: 0,
		limit: 10,
		size: totalHospitalsCount,
		amounts: [10, 20, 30, 50]
	});

	$effect(() => {
		if (hospitalName || tags) {
			paginationSettings.page = 0;
		}
	});

	async function searchHospital(model) {
		let url = `/api/server/hospitals/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${model.itemsPerPage}`;
		if (offset) url += `&pageIndex=${model.pageIndex}`;
		if (hospitalName) url += `&name=${model.hospitalName}`;
		// if (healthSystemName) url += `&healthSystemName=${healthSystemName}`;
		if (tags) url += `&tags=${tags}`;
		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalHospitalsCount = searchResult.TotalCount;
		hospitals = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalHospitalsCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		hospitals = hospitals.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalHospitalsCount;
		retrivedHospitals = hospitals.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedHospitals.length > 0) {
			isLoading = false;
		}
	});

	// $: console.log('retrivedHospitals', retrivedHospitals);

	$effect(() => {
		if (!browser) return;
		searchHospital({
			hospitalName: hospitalName,
			tags: tags,
			// healthSystemName: healthSystemName,
			itemsPerPage: itemsPerPage,
			pageIndex: offset,
			sortOrder: sortOrder,
			sortBy: sortBy
		});
	});

	function onPageChange(e: CustomEvent): void {
		isLoading = true;
		let pageIndex = e.detail;
		itemsPerPage = items * (pageIndex + 1);
	}

	function onAmountChange(e: CustomEvent): void {
		if (hospitalName || tags) {
			isLoading = true;
			hospitals = [];
		}
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
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
		// else if (columnName === 'HealthSystemName') {
		//     isSortingHealthSystemName = true;
		// }
		sortBy = columnName;
	}

	const handleHospitalDelete = async (id) => {
		const hospitalId = id;
		await Delete({
			sessionId: data.sessionId,
			hospitalId
		});
		invalidate('app:hospitals');
	};

	async function Delete(model) {
		closeDeleteModal();

		await fetch(`/api/server/hospitals/${model.hospitalId}`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
	}

	function closeDeleteModal() {
		deleteButtonClicked = false;
		cardToDelete = null;
	}
	function openDeleteModal(id) {
		deleteButtonClicked = true;
		cardToDelete = id;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container shadow">
			<div class="health-system-search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow pl-1.5">
						<input
							type="text"
							name="hospitalName"
							placeholder="Search by name"
							bind:value={hospitalName}
							class="health-system-input"
						/>
						{#if hospitalName}
							<button
								type="button"
								onclick={() => {
									hospitalName = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<div class="relative w-auto grow">
						<input
							type="text"
							name="tags"
							placeholder="Search by tags"
							bind:value={tags}
							class="health-system-input"
						/>
						{#if tags}
							<button
								type="button"
								onclick={() => {
									tags = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<a href={createRoute} class="health-system-btn variant-filled-secondary">Add New</a>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-10"></th>
							<th class=" w-72 text-start">
								<button onclick={() => sortTable('Name')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class=" w-72">
								<button onclick={() => sortTable('HealthSystemName')}>
									Health System {isSortingHealthSystemName
										? sortOrder === 'ascending'
											? '▲'
											: '▼'
										: ''}
								</button>
							</th>
							<th class=" w-64">Tags</th>
							<th class="w-32">Created </th>
							<th class="w-16"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedHospitals <= 0}
							<tr>
								<td colspan="6" class="text-center"
									>{isLoading ? 'Loading...' : 'No records found'}</td
								>
							</tr>
						{:else}
							{#each retrivedHospitals as row}
								<tr>
									<td role="gridcell" aria-colindex={1} tabindex="0">{row.index}</td>
									<td role="gridcell" aria-colindex={2} tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={3} tabindex="0">
										<Tooltip text={row.HealthSystemName || 'Not specified'}>
											{row.HealthSystemName !== null && row.HealthSystemName !== ''
												? Helper.truncateText(row.HealthSystemName, 50)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td
									>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
										{Helper.formatDate(row.CreatedAt)}
									</td>
									<!-- <td>
										<a href={editRoute(row.id)} class="btn hover:variant-soft-primary -my-1 p-2">
											<Icon icon="material-symbols:edit-outline" class="text-lg" />
										</a>
									</td> -->
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
	<div class="confirm-modal-overlay"></div>

	<div class="confirm-modal-container">
		<div class="confirm-modal-subcontainer">
			<div class="confirm-card-container">
				<h1 class="confirm-card-heading">Are you absolutely sure?</h1>
				<p class="confirm-card-paragraph">
					This action cannot be undone. This will permanently delete your question and remove your
					data from our servers.
				</p>
			</div>

			<div class="confirm-card-btn-container">
				<button class="confirm-card-cancel-btn" onclick={closeDeleteModal}> Cancel </button>
				<button class="confirm-card-delete-btn" onclick={() => handleHospitalDelete(cardToDelete)}>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- pagination -->
<!-- <div class="pagination-container">
	<div class="flex flex-col items-start text-sm text-gray-700 dark:text-gray-300">
		<div class="relative">
			<select
				id="itemsPerPage"
				class="pagination-select"
				onchange={changeAmount}
				bind:value={items}
			>
				<option class="" value={5}>5 records per page</option>
				<option class="" value={10}>10 records per page</option>
				<option class="" value={15}>15 records per page</option>
				<option class="" value={20}>20 records per page</option>
			</select>
			<div
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
			>
				<Icon icon="mdi:chevron-down" class="h-4 w-4" />
			</div>
		</div>
	</div>

	<div class="flex items-center space-x-2">
		<button
			class="health-system-btn"
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
			class="health-system-btn"
			onclick={() => changePage(paginationSettings.page + 1)}
			disabled={(paginationSettings.page + 1) * paginationSettings.limit >= totalHealthSystemsCount}
		>
			<Icon icon="material-symbols:chevron-right-rounded" width="20" height="20" />
		</button>
	</div>
</div> -->

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
