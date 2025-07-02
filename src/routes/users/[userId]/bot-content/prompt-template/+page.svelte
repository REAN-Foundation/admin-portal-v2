<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { Helper } from '$lib/utils/helper';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import { toastMessage } from '$lib/components/toast/toast.store';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let prompts = $state(data.prompts.Items);
	let retrivedPrompts = $derived(prompts);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const promptsRoute = `/users/${userId}/bot-content/prompt-template`;
	const editRoute = (id) => `/users/${userId}/bot-content/prompt-template/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/bot-content/prompt-template/${id}/view`;
	const createRoute = `/users/${userId}/bot-content/prompt-template/create`;

	const breadCrumbs = [{ name: 'Prompt Templates', path: promptsRoute }];

	let promptName = $state(undefined);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let totalPromptsCount = $state(data.prompts.TotalCount);

	$inspect('retrivedPrompts', retrivedPrompts);
	$inspect('searchKeyword', searchKeyword);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalPromptsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchPrompts(model) {
		try {
			let url = `/api/server/prompt-template/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			if (model.promptName) url += `&name=${model.promptName}`;
			console.log('prompts name**', model.promptName);
			console.log(url);

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalPromptsCount = searchResult.Data.TotalCount;
			paginationSettings.size = totalPromptsCount;

			prompts = searchResult.Data.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.promptName;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		console.log('prompts name**', promptName);
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchPrompts({
				promptName: searchKeyword,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;

		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;

		searchPrompts({
			promptName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	function onItemsPerPageChange() {
		paginationSettings.page = 0;
		searchPrompts({
			promptName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchPrompts({
			promptName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handlePromptsDelete = async (id) => {
		const response = await fetch(`/api/server/prompt-template/${id}`, {
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
		searchPrompts({
			promptName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};

	function getColorClass(temp) {
		if (temp >= 0 && temp < 0.25) {
			return 'bg-red-500';
		} else if (temp >= 0.25 && temp < 0.5) {
			return 'bg-yellow-500';
		} else if (temp >= 0.5 && temp < 0.75) {
			return 'bg-green-500';
		} else {
			return 'bg-blue-500';
		}
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container mb-6 shadow">
			<div class="health-system-search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative pr-1.5">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="text"
								name="promptName"
								oninput={(event) => onSearchInput(event)}
								bind:value={promptName}
								placeholder="Search by name"
								class="table-input-field !pr-4 !pl-10"
							/>
							{#if promptName}
								<button
									type="button"
									onclick={() => {
										promptName = '';
									}}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
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
							<th></th>
							 <th class="text-start">
								<button onclick={() => sortTable('Name')}>
									Name 
									{#if isSortingName}
										<Icon icon={`mdi:chevron-${sortOrder === 'ascending' ? 'up' : 'down'}`} class="ml-1 inline" width="16" />
									{/if}
								</button>
							</th>

							<th>Model</th>
							<th>Group</th>
							<th>Use Case Type</th>
							<th>Active</th>
							<!-- <th>Action</th> -->
						</tr>
					</thead>
					<tbody>
						{#if retrivedPrompts.length <= 0}
							<tr class="text-center">
								<td colspan="6">No records found</td>
							</tr>
						{:else}
							{#each retrivedPrompts as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td>
										<a href={viewRoute(row.id)}>
											{row.Name !== null && row.Name !== ''
												? Helper.truncateText(row.Name, 20)
												: 'Not specified'}
										</a>
									</td>

									<td>
										{row.Model !== null && row.Model !== ''
											? Helper.truncateText(row.Model, 40)
											: 'Not specified'}
									</td>
									<td>
										{row.Group !== null && row.Group !== ''
											? Helper.truncateText(row.Group, 40)
											: 'Not specified'}
									</td>
									<td>
										{row.UseCaseType !== null && row.UseCaseType !== ''
											? Helper.truncateText(row.UseCaseType, 40)
											: 'Not specified'}
									</td>
									<td>
										{#if row.IsActive !== null && row.IsActive !== ''}
											{#if row.IsActive === true}
												<span class="text-green-500">✔</span>
											{:else}
												<span class="text-red-500">✘</span>
											{/if}
										{:else}
											Not specified
										{/if}
									</td>

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
	title="Delete prompt template"
	onConfirm={handlePromptsDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
