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
	import type { PaginationSettings } from '$lib/types/common.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let knowledgeNuggets = $state(data.knowledgeNuggets.Items);
	let retrivedKnowledgeNuggets = $derived(knowledgeNuggets);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const knowledgeNuggetRoute = `/users/${userId}/knowledge-nuggets`;
	const editRoute = (id) => `/users/${userId}/knowledge-nuggets/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/knowledge-nuggets/${id}/view`;
	const createRoute = `/users/${userId}/knowledge-nuggets/create`;

	const breadCrumbs = [{ name: 'Knowledge Nuggets', path: knowledgeNuggetRoute }];

	let topicName = $state(undefined);
	let tags = $state(undefined);
	let sortBy = 'TopicName';
	let sortOrder = $state('ascending');
	let totalKnowledgeNuggetsCount = $state(data.knowledgeNuggets.TotalCount);
	let isSortingName = $state(false);
	let isSortingTags = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalKnowledgeNuggetsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchKnowledgeNugget(model) {
		try {
			let url = `/api/server/knowledge-nuggets/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.topicName) url += `&topicName=${model.topicName}`;
			if (model.tags) url += `&tags=${model.tags}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);

			totalKnowledgeNuggetsCount = searchResult.Data.KnowledgeNuggetRecords.TotalCount;
			paginationSettings.size = totalKnowledgeNuggetsCount;

			knowledgeNuggets = searchResult.Data.KnowledgeNuggetRecords.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'topicName') {
			topicName = value;
		} else if (name === 'tags') {
			tags = value;
		}
	}
	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;

		updateSearchField(name, value);
		// console.log('event', e.target);

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchKnowledgeNugget({
				topicName,
				tags,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortOrder,
				sortBy
			});
		}, 400);
	}

	$effect(() => {
		searchKnowledgeNugget({
			topicName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
		if (isDeleting) {
			retrivedKnowledgeNuggets;
			isDeleting = false;
		}
	});

	function sortTable(columnName) {
		isSortingName = false;
		isSortingTags = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'TopicName') {
			isSortingName = true;
		} else if (columnName === 'Tags') {
			isSortingTags = true;
		}
		sortBy = columnName;

		searchKnowledgeNugget({
			topicName,
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
		searchKnowledgeNugget({
			topicName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortOrder,
			sortBy
		});
	}

	function onPageChange() {
		searchKnowledgeNugget({
			topicName,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	const handleKnowledgeNuggetDelete = async (id) => {
		const response = await fetch(`/api/server/knowledge-nuggets/${id}`, {
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

		searchKnowledgeNugget({
			topicName,
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
		<div class="table-container mb-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="topicName"
							placeholder="Search by name"
							bind:value={topicName}
							oninput={(event) => onSearchInput(event)}
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if topicName}
							<button
								type="button"
								onclick={() => {
									topicName = '';
									onSearchInput({ target: { name: 'topicName', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>

					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:tag"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="tags"
							placeholder="Search by tags"
							bind:value={tags}
							oninput={(event) => onSearchInput(event)}
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

					<button class="table-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class=" w-10"></th>
							<th class=" w-72">
								<button onclick={() => sortTable('TopicName')}>
									Name {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class=" w-72">
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
							<th class=" w-38">Created</th>
							<th class=" w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedKnowledgeNuggets.length <= 0}
							<tr class="text-center">
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedKnowledgeNuggets as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td tabindex="0">
										<Tooltip text={row.TopicName || 'Not specified'}>
											<a href={viewRoute(row.id)}>{Helper.truncateText(row.TopicName, 60)}</a>
										</Tooltip>
									</td>
									<td  tabindex="0"
										>{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td
									>
									<td tabindex="0">
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

									<td>
										<div class="flex">
											<Tooltip text="Edit" forceShow={true}>
												<button class="">
													<a href={editRoute(row.id)} class="table-btn group">
														<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
													</a>
												</button>
											</Tooltip>

											<Tooltip text="View" forceShow={true}>
												<button>
													<a href={viewRoute(row.id)} class=" table-btn group"
														><Icon
															icon="icon-park-outline:preview-open"
															class="health-system-icon"
														/>
													</a>
												</button>
											</Tooltip>

											<Tooltip text="Delete" forceShow={true}>
												<button
													class="table-btn !text-red-600"
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
	title="Delete Knowledge Nugget"
	onConfirm={handleKnowledgeNuggetDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />

