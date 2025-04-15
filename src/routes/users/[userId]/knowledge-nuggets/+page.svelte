<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	// import {
	// 	Paginator, type PaginationSettings,
	// } from '@skeletonlabs/skeleton';
	// import date from 'date-and-time';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { onMount } from 'svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let knowledgeNuggets = $state(data.knowledgeNuggets.Items);
	let retrivedKnowledgeNuggets = $state();
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
	let itemsPerPage = 10;
	let offset = 0;
	let totalKnowledgeNuggetsCount = $state(data.knowledgeNuggets.TotalCount);
	let isSortingName = $state(false);
	let isSortingTags = $state(false);
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	let paginationSettings = $derived({
		page: 0,
		limit: 10,
		size: totalKnowledgeNuggetsCount,
		amounts: [10, 20, 30, 50]
	});

	// if (topicName || tags) {
	// 	paginationSettings.page = 0;
	// }
	async function searchKnowledgeNugget(model) {
		console.log(model);
		let url = `/api/server/knowledge-nuggets/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offset) url += `&pageIndex=${offset}`;
		if (topicName) url += `&topicName=${topicName}`;
		if (tags) url += `&tags=${tags}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalKnowledgeNuggetsCount = searchResult.TotalCount;
		knowledgeNuggets = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalKnowledgeNuggetsCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		knowledgeNuggets = knowledgeNuggets.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalKnowledgeNuggetsCount;
		retrivedKnowledgeNuggets = knowledgeNuggets.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedKnowledgeNuggets.length > 0) {
			isLoading = false;
		}
	});
	$effect(() => {
		if (!browser) return;
		searchKnowledgeNugget({
			topicName: topicName,
			tags: tags,
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
		if (topicName || tags) {
			isLoading = true;
			knowledgeNuggets = [];
		}
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
	}

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
	}

	const handleKnowledgeNuggetDelete = async (id) => {
		const knowledgeNuggetId = id;
		await Delete({
			sessionId: data.sessionId,
			knowledgeNuggetId
		});
		invalidate('app:knowledge-nuggests');
	};

	async function Delete(model) {
		await fetch(`/api/server/knowledge-nuggets/${model.knowledgeNuggetId}`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});

		window.location.href = knowledgeNuggetRoute;

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
			<div class="health-system-search-border">
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
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if topicName}
							<button
								type="button"
								onclick={() => {
									topicName = '';
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
					<!-- <input
		type="text"
		name="topicName"
		placeholder="Search by topic name"
		bind:value={topicName}
		class="input w-auto grow"
	/>
	<input 
		type="text"
		name="tags"
		placeholder="Search by tags" bind:value={tags}
		class="input w-auto grow"
	/> -->
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class=" w-10"></th>
							<th class=" w-72">
								<button onclick={() => sortTable('TopicName')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class=" w-72">
								<button onclick={() => sortTable('Tags')}>
									Tags {isSortingTags ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class=" w-38">Created</th>
							<th class=" w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedKnowledgeNuggets <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedKnowledgeNuggets as row}
								<tr>
									<td tabindex="0">{row.index}</td>
									<td tabindex="0">
										<Tooltip text={row.TopicName || 'Not specified'}>
											<a href={viewRoute(row.id)}>{Helper.truncateText(row.TopicName, 60)}</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={3} tabindex="0"
										>{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td
									>
									<td role="gridcell" aria-colindex={4} tabindex="0">
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
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
												on:click|preventDefault={() =>
													confirmThis(handleKnowledgeNuggetDelete, row.id)}
												class="btn hover:variant-soft-error -my-1 p-2"
											>
												<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
											</button>
											<span slot="title"> Delete </span>
											<span slot="description">
												Are you sure you want to delete a knowledge nugget?
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
					onclick={() => handleKnowledgeNuggetDelete(cardToDelete)}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- <div class="w-full variant-soft-secondary rounded-lg p-2">
	<Paginator
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		buttonClasses=" text-primary-500"
		regionControl = 'bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200'
		controlVariant = 'rounded-full text-primary-500 '
		controlSeparator = 'fill-primary-400'
		/>
</div> -->
