<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let promise;
	let retrivedDrugs = $state();
	let drugs = $state(data.drugs.Items);
	const userId = page.params.userId;
	const drugRoute = `/users/${userId}/drugs`;
	const editRoute = (id) => `/users/${userId}/drugs/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/drugs/${id}/view`;
	const createRoute = `/users/${userId}/drugs/create`;

	const breadCrumbs = [{ name: 'Drugs', path: drugRoute }];

	let drugName = $state(undefined);
	let genericName = $state(undefined);
	let sortBy = 'DrugName';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalDrugsCount = $state(data.drugs.TotalCount);
	let isSortingName = $state(false);
	let isSortingGenericName = $state(false);
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	$effect(() => {
		if (drugName || genericName) {
			paginationSettings.page = 0;
		}
	});

	let paginationSettings = $derived({
		page: 0,
		limit: 10,
		size: totalDrugsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchDrug(model) {
		let url = `/api/server/drugs/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offset) url += `&pageIndex=${offset}`;
		if (drugName) url += `&drugName=${model.drugName}`;
		if (genericName) url += `&genericName=${model.genericName}`;
		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalDrugsCount = searchResult.TotalCount;
		drugs = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
	}

	onMount(() => {
		drugs = drugs.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalDrugsCount;
		retrivedDrugs = drugs.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
	});

	$effect(() => {
		if (!browser) return;
		promise = searchDrug({
			drugName: drugName,
			genericName: genericName,
			itemsPerPage: itemsPerPage,
			pageIndex: offset,
			sortOrder: sortOrder,
			sortBy: sortBy
		});
	});

	function onPageChange(e: CustomEvent): void {
		let pageIndex = e.detail;
		itemsPerPage = items * (pageIndex + 1);
	}

	function onAmountChange(e: CustomEvent): void {
		if (drugName || genericName) {
			drugs = [];
		}
		paginationSettings.page = 0;
		offset = 0;
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
	}

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
	}

	function resetSearch() {
		drugName = undefined;
		genericName = undefined;
		paginationSettings.page = 0;
	}

	const handleDrugDelete = async (id) => {
		const drugId = id;
		await Delete({
			sessionId: data.sessionId,
			drugId
		});
		drugName = undefined;
		genericName = undefined;
		invalidate('app:drugs');
	};

	async function Delete(model) {
		await fetch(`/api/server/drugs`, {
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
		<div class="health-system-table-container z-0 shadow">
			<div class="health-system-search-border p-4">
				<div class="mt-1 flex flex-wrap gap-2">
					<div class="relative w-auto grow pl-1.5">
						<input
							type="text"
							name="drugName"
							placeholder="Search by name"
							bind:value={drugName}
							class="health-system-input"
						/>
						{#if drugName}
							<button
								type="button"
								onclick={() => {
									drugName = '';
								}}
								class="absolute top-1/2 right-2 -translate-y-1/2 transform cursor-pointer border-0 bg-transparent"
							>
								<Icon icon="material-symbols:close" class="text-lg" />
							</button>
						{/if}
					</div>
					<div class="relative w-auto grow">
						<input
							type="text"
							name="genericName"
							placeholder="Search by generic name"
							bind:value={genericName}
							class="health-system-input"
						/>
						{#if genericName}
							<button
								type="button"
								onclick={() => {
									genericName = '';
								}}
								class="absolute top-1/2 right-2 -translate-y-1/2 transform cursor-pointer border-0 bg-transparent"
							>
								<Icon icon="material-symbols:close" class="text-lg" />
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
							<th data-sort="index">Id</th>
							<th class="w-72">
								<button onclick={() => sortTable('DrugName')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-72">
								<button onclick={() => sortTable('GenericName')}>
									Generic Name {isSortingGenericName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-52">Ingredients</th>
							<th class="w-32">Created</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<!-- {#await promise}
							<tr>
								<td colspan="7">Loading...</td>
							</tr>
						{:then data} -->
						{#if retrivedDrugs <= 0}
							<tr>
								<td colspan="6">No records found</td>
							</tr>
						{:else}
							{#each retrivedDrugs as row}
								<tr>
									<td role="gridcell" aria-colindex={1} tabindex="0">{row.index}</td>
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
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')}</td -->
										{Helper.formatDate(row.CreatedAt)}
									</td>
									<!-- <td>
											<a href={editRoute(row.id)} class="btn hover:variant-soft-primary -my-1 p-2">
												<Icon icon="material-symbols:edit-outline" class="text-lg" />
											</a>
										</td> -->
									<td>
										<!-- <Confirm confirmTitle="Delete" cancelTitle="Cancel" let:confirm={confirmThis}>
									<button
										onclick={() => confirmThis(handleDrugDelete, row.id)}
										class="btn hover:variant-soft-error -my-1 p-2"
									>
										<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
									</button>
									<span slot="title"> Delete </span>
									<span slot="description"> Are you sure you want to delete a drug? </span>
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
						<!-- {/await} -->
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
				<button class="confirm-card-delete-btn" onclick={() => handleDrugDelete(cardToDelete)}>
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
