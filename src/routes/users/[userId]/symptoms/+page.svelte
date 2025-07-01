<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import Image from '$lib/components/image.svelte';
	import { db } from '$lib/utils/local.db';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let symptoms = $state(data.symptoms.Items);
	let retrivedSymptoms = $derived(symptoms);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const symptomRoute = `/users/${userId}/symptoms`;
	const editRoute = (id) => `/users/${userId}/symptoms/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/symptoms/${id}/view`;
	const createRoute = `/users/${userId}/symptoms/create`;

	const breadCrumbs = [{ name: 'Symptoms', path: symptomRoute }];

	let symptom = $state(undefined);
	let tags = $state(undefined);
	let totalSymptomsCount = $state(data.symptoms.TotalCount);
	let isSortingSymptom = $state(false);
	let isSortingTags = $state(false);
	let sortBy = $state('Symptom');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalSymptomsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchSymptom(model) {
		try {
			let url = `/api/server/symptoms/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.symptom) url += `&symptom=${model.symptom}`;
			if (model.tags) url += `&tags=${tags}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();

			totalSymptomsCount = searchResult.Data.SymptomTypes.TotalCount;
			paginationSettings.size = totalSymptomsCount;
			symptoms = searchResult.Data.SymptomTypes.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.symptom;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'symptom') {
			symptom = value;
		} else if (name === 'tags') {
			tags = value;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;
		updateSearchField(name, value);

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchSymptom({
				symptom,
				tags,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
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
		searchSymptom({
			symptom,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	async function getImageUrl(id: string): Promise<string> {
		const cachedImage = await db.imageCache
			.where({ srcUrl: `/file-resources/${id}/download?disposition=inline` })
			.first();
		if (cachedImage) {
			return cachedImage.srcUrl;
		}
		return `${data.backendUrl}/file-resources/${id}/download?disposition=inline`;
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};
	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchSymptom({
			symptom,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchSymptom({
			symptom,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleHealthSystemDelete = async (id) => {
		console.log('Inside handleHealthSystemDelete', id);
		const response = await fetch(`/api/server/symptoms/${id}`, {
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
		searchSymptom({
			symptom,
			tags,
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
							name="symptom"
							placeholder="Search by symptom"
							oninput={(event) => onSearchInput(event)}
							bind:value={symptom}
							class="input !pr-4 !pl-10"
						/>
						{#if symptom}
							<button
								type="button"
								onclick={() => {
									symptom = '';
									onSearchInput({ target: { name: 'symptom', value: '' } });
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
							oninput={(event) => onSearchInput(event)}
							class="input !pr-4 !pl-10"
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
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class="w-10"></th>
							<th class=" w-70">
								<button onclick={() => sortTable('Symptom')}>
									Symptom {#if isSortingSymptom}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-64">
								<button onclick={() => sortTable('Tags')}>
									Tags {#if isSortingTags}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-24">Image</th>
							<th class="w-32">Created</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedSymptoms.length <= 0}
							<tr class="text-center">
								<td class="text-center" colspan="7">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedSymptoms as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}
												>{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Symptom, 60)
													: 'Not specified'}</a
											>
										</Tooltip>
									</td>
									<td tabindex="0">{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td>
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
									<td role="gridcell" aria-colindex={5} tabindex="0">
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
	title="Delete Symptom"
	onConfirm={handleHealthSystemDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
