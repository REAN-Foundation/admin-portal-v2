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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let goalTypes = $state(data.goalTypes.Items);
	let retrivedGoalTypes = $derived(goalTypes);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const goalRoute = `/users/${userId}/goals`;
	const editRoute = (id) => `/users/${userId}/goals/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/goals/${id}/view`;
	const createRoute = `/users/${userId}/goals/create`;

	const breadCrumbs = [{ name: 'Goals', path: goalRoute }];

	let type = $state(undefined);
	let tags = $state(undefined);

	let totalGoalTypesCount = $state(data.goalTypes.TotalCount);
	$inspect('totalGoalTypesCount', totalGoalTypesCount);
	let isSortingType = $state(false);
	let isSortingTags = $state(false);
	let sortBy = $state('Type');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalGoalTypesCount,
		amounts: [10, 20, 30, 50]
	});

	$inspect('retrivedGoal', goalTypes);
	
	async function searchGoalTypes(model) {
		if (searchKeyword !== model.type || searchKeyword !== model.tags) {
			paginationSettings.page = 0;
		}
		let url = `/api/server/goals/search?`;
		url += `sortOrder=${model.sortOrder ?? sortOrder}`;
		url += `&sortBy=${model.sortBy ?? sortBy}`;
		url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
		url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
		if (type) url += `&type=${model.type}`;
		if (tags) url += `&tags=${model.tags}`;

		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalGoalTypesCount = searchResult.Data.GoalTypes.TotalCount;
			paginationSettings.size = totalGoalTypesCount;

			goalTypes = searchResult.Data.GoalTypes.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.type;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}


	
	$effect(() => {
		searchGoalTypes({
			type,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});

		if (isDeleting) {
			retrivedGoalTypes;
			isDeleting = false;
		}
	});


	function sortTable(columnName) {
		isSortingType = false;
		isSortingTags = false;

		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Type') {
			isSortingType = true;
		}
		if (columnName === 'Tags') {
			isSortingType = true;
		}
		sortBy = columnName;
	}


	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};
	const handleGoalTypeDelete = async (id) => {
		console.log('Inside handleGoalTypeDelete', id);
		const response = await fetch(`/api/server/goals/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('deleted Response', res);
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		}
		invalidate('app:GoalType');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="admin-portal-v2-table-container mb-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative flex-1 pr-1.5">
						<input
							type="text"
							name="type"
							placeholder="Search by type"
							bind:value={type}
							class="table-input-field !pr-4 !pl-10"
						/>
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						{#if type}
							<button type="button" onclick={() => (type = '')} class="close-btn">
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>

	
					<div class="relative flex-1 pr-1.5">
						<input
							type="text"
							name="tags"
							placeholder="Search by tags"
							bind:value={tags}
							class="table-input-field !pr-4 !pl-10"
						/>
						<Icon
							icon="heroicons:tag"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						{#if tags}
							<button type="button" onclick={() => (tags = '')} class="close-btn">
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>

					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead class="">
						<tr>
							<th class="w-12"></th>
							<th class="text-start">
								<button onclick={() => sortTable('Type')}>
									Type {isSortingType ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="text-start">
								<button onclick={() => sortTable('Tags')}>
									Tags {isSortingTags ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-40">Created</th>
							<th class="w-20 text-center"></th>
						</tr>
					</thead>

					<tbody>
						{#if retrivedGoalTypes.length <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedGoalTypes as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Type || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Type !== null && row.Type !== ''
													? Helper.truncateText(row.Type, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>

									<td>
										{row.Tags || 'Not specified'}
									</td>

									<td>
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

									<td>
										<div class="flex">
											<Tooltip text="Edit" forceShow={true}>
												<button>
													<a href={editRoute(row.id)} class="health-system-btn group">
														<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
													</a>
												</button>
											</Tooltip>

											<Tooltip text="View" forceShow={true}>
												<button>
													<a href={viewRoute(row.id)} class="health-system-btn group">
														<Icon
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
	title="Delete goal Types@@@"
	onConfirm={handleGoalTypeDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings />
