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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let labRecords = $state(data.labRecordTypes.Items);
	let retrivedLabRecords = $state();
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/lab-records/create`;
	const editRoute = (id) => `/users/${userId}/lab-records/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/lab-records/${id}/view`;
	const labRecordTypesRoute = `/users/${userId}/lab-records`;
	const breadCrumbs = [{ name: 'Lab Records', path: labRecordTypesRoute }];

	let typeName = $state(undefined);
	let displayName = $state(undefined);
	let sortBy = 'TypeName';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalLabRecordsCount = $state(data.labRecordTypes.TotalCount);
	let isSortingTypeName = $state(false);
	let isSortingDisplayName = $state(false);
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	let paginationSettings = $derived({
		page: 0,
		limit: 10,
		size: totalLabRecordsCount,
		amounts: [10, 20, 30, 50]
	});

	// $: {
	// 	if (typeName || displayName) {
	// 		paginationSettings.page = 0;
	// 	}
	// }
	async function searchLabRecords(model) {
		let url = `/api/server/lab-record-types/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offset) url += `&pageIndex=${offset}`;
		if (typeName) url += `&typeName=${typeName}`;
		if (displayName) url += `&displayName=${displayName}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalLabRecordsCount = searchResult.TotalCount;
		labRecords = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalLabRecordsCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		labRecords = labRecords.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalLabRecordsCount;
		retrivedLabRecords = labRecords.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedLabRecords.length > 0) {
			isLoading = false;
		}
	});

	$effect(() => {
		if (!browser) return;
		searchLabRecords({
			typeName: typeName,
			displayName: displayName,
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
		if (typeName || displayName) {
			isLoading = true;
			labRecords = [];
		}
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
	}

	function sortTable(columnName) {
		isSortingTypeName = false;
		isSortingDisplayName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'TypeName') {
			isSortingTypeName = true;
		} else if (columnName === 'DisplayName') {
			isSortingDisplayName = true;
		}
		sortBy = columnName;
	}

	const handleLabRecordTypeDelete = async (id) => {
		const labRecordTypeId = id;
		await Delete({
			sessionId: data.sessionId,
			labRecordTypeId: labRecordTypeId
		});
		invalidate('app:lab-records');
	};

	async function Delete(model) {
		await fetch(`/api/server/lab-record-types/${model.labRecordTypeId}`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});

		window.location.href = labRecordTypesRoute;

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
									Type Name {isSortingTypeName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-44">
								<button onclick={() => sortTable('DisplayName')}>
									Display Name {isSortingDisplayName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
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
							{#each retrivedLabRecords as row}
								<tr>
									<td tabindex="0">{row.index}</td>
									<td tabindex="0">
										<Tooltip text={row.TypeName || 'Not specified'}>
											<a href={viewRoute(row.id)}>{Helper.truncateText(row.TypeName, 20)} </a>
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
									<!-- <td>
										<a href={editRoute(row.id)} class="btn hover:variant-soft-primary -my-1 p-2">
											<Icon icon="material-symbols:edit-outline" class="text-lg" />
										</a>
									</td> -->
									<td>
										<!-- <Confirm confirmTitle="Delete" cancelTitle="Cancel" let:confirm={confirmThis}>
								<button
									on:click|preventDefault={() => confirmThis(handleLabRecordTypeDelete, row.id)}
									class="btn hover:variant-soft-error -my-1 p-2"
								>
									<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
								</button>
								<span slot="title"> Delete </span>
								<span slot="description"> Are you sure you want to delete a lab record? </span>
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
				<button
					class="confirm-card-delete-btn"
					onclick={() => handleLabRecordTypeDelete(cardToDelete)}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- <div class="variant-soft-secondary w-full rounded-lg p-2">
	<Paginator
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		buttonClasses=" text-primary-500"
		regionControl="bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200"
		controlVariant="rounded-full text-primary-500 "
		controlSeparator="fill-primary-400"
	/>
</div> -->
