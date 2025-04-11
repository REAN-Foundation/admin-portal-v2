<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';

	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { db } from '$lib/utils/local.db';
	import { onMount } from 'svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let retrivedSymptoms = $state();
	let symptoms = $state(data.symptoms);

	const userId = $page.params.userId;
	const symptomRoute = `/users/${userId}/symptoms`;
	const editRoute = (id) => `/users/${userId}/symptoms/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/symptoms/${id}/view`;
	const createRoute = `/users/${userId}/symptoms/create`;

	const breadCrumbs = [{ name: 'Symptoms', path: symptomRoute }];

	let symptom = $state(undefined);
	let tags = $state(undefined);
	let sortBy = 'Symptom';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalSymptomsCount = $state(data.symptomsCount);
	let isSortingSymptom = $state(false);
	let isSortingTags = $state(false);
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	// $: {
	// 	if (symptom || tags) {
	// 		paginationSettings.page = 0;
	// 	}
	// }

	let paginationSettings = $derived({
		page: 0,
		limit: 10,
		size: totalSymptomsCount,
		amounts: [10, 20, 30, 50]
	});
	async function searchSymptom(model) {
		let url = `/api/server/symptoms/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offset) url += `&pageIndex=${offset}`;
		if (symptom) url += `&symptom=${model.symptom}`;
		if (tags) url += `&tags=${model.tags}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalSymptomsCount = searchResult.TotalCount;
		symptoms = searchResult.Items;
		if (totalSymptomsCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		symptoms = symptoms.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalSymptomsCount;
		retrivedSymptoms = symptoms.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedSymptoms.length > 0) {
			isLoading = false;
		}
	});

	$effect(() => {
		if (!browser) return;
		searchSymptom({
			symptom,
			tags,
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
		if (symptom || tags) {
			isLoading = true;
			symptoms = [];
		}
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
	}

	function sortTable(columnName) {
		isSortingSymptom = false;
		isSortingTags = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Symptom') {
			isSortingSymptom = true;
		} else if (columnName === 'Tags') {
			isSortingTags = true;
		}
		sortBy = columnName;
	}

	const handleSymptomDelete = async (id) => {
		const symptomId = id;
		// console.log(`ImageUrl : ${imageResourceId}`);
		// if (imageResourceId) {
		//     // await db.imageCache.where({ srcUrl: imageUrl}).delete();
		// 		await db.imageCache.where({ srcUrl: getImageUrl(imageResourceId)}).delete();
		//     console.log(`Removed cached image for ${imageResourceId}`);
		// }
		await Delete({
			sessionId: data.sessionId,
			symptomId: symptomId
			// ImageUrl : imageUrl
		});
		invalidate('app:symptoms');
		window.location.href = symptomRoute;
	};

	async function Delete(model) {
		await fetch(`/api/server/symptoms/${model.id}`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
	}

	// function getImageUrl(id:string):string{
	// 	return data.backendUrl+`/file-resources/${id}/download?disposition=inline`
	// }

	async function getImageUrl(id: string): Promise<string> {
		const cachedImage = await db.imageCache
			.where({ srcUrl: `/file-resources/${id}/download?disposition=inline` })
			.first();
		if (cachedImage) {
			return cachedImage.srcUrl;
		}
		return `${data.backendUrl}/file-resources/${id}/download?disposition=inline`;
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
							name="symptom"
							placeholder="Search by symptom"
							bind:value={symptom}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if symptom}
							<button
								type="button"
								onclick={() => {
									symptom = '';
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
							placeholder="Search by tags"
							bind:value={tags}
							class="health-system-input !pr-4 !pl-10"
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
					<button class="health-system-btn variant-filled-secondary">
						<a href={createRoute}>Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class="w-10"></th>
							<th class=" w-70">
								<button onclick={() => sortTable('Symptom')}>
									Symptom {isSortingSymptom ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-64">
								<button onclick={() => sortTable('Tags')}>
									Tags {isSortingTags ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-24">Image</th>
							<th class="w-32">Created</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedSymptoms <= 0}
							<tr>
								<td colspan="7">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedSymptoms as row}
								<tr>
									<td tabindex="0">{row.index}</td>
									<td tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>{Helper.truncateText(row.Symptom, 60)}</a>
										</Tooltip>
									</td>
									<td tabindex="0">{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td>
									<!-- <td role="gridcell" aria-colindex="{4}" tabindex="0">
							{#if row.ImageResourceId === undefined || row.ImageResourceId===null}
							Not specified
							{:else}
							<Image cls="flex h-8 w-8 rounded-lg" source="{getImageUrl(row.ImageResourceId)}" w="24" h="24" />
							{/if}
						</td> -->
									<!-- <td role="gridcell" aria-colindex="{4}" tabindex="0">
							{#if row.ImageUrl === undefined || row.ImageUrl===null}
							Not specified
							{:else}
							<Image cls="flex h-8 w-8 rounded-lg" source="{row.ImageUrl}" w="24" h="24" />
							{/if}
							</td> -->
									<td tabindex="0">
										{#if row.ImageResourceId === undefined || row.ImageResourceId === null}
											Not specified
										{:else}
											{#await getImageUrl(row.ImageResourceId) then imageUrl}
												<Image cls="flex rounded-lg" source={imageUrl} w="24" h="24" />
											{:catch error}
												<p>Error loading image</p>
											{/await}
										{/if}
									</td>
									<td tabindex="0">
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
										{Helper.formatDate(row.CreatedAt)}
									</td>
									<!-- <td>
										<a href={editRoute(row.id)} class="btn hover:variant-soft-primary -my-1 p-2">
											<Icon icon="material-symbols:edit-outline" />
										</a>
									</td> -->
									<td>
										<!-- <Confirm confirmTitle="Delete" cancelTitle="Cancel" let:confirm={confirmThis}>
								<button
									on:click|preventDefault={() =>
										confirmThis(handleSymptomDelete, row.id, row.imageResourceId)}
									class="btn hover:variant-soft-error -my-1 p-2"
								>
									<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
								</button>
								<span slot="title">Delete</span>
								<span slot="description">Are you sure you want to delete a symptom?</span>
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
				<button class="confirm-card-delete-btn" onclick={() => handleSymptomDelete(cardToDelete)}>
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
