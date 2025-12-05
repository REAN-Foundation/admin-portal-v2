<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	
	let initialLearningJourneys = (() => {
		try {
			const items = data.learningJourneys?.Items ?? [];

			return items
				.map((item) => {
					if (!item) return null;
					return item;
				})
				.filter(Boolean);
		} catch (error) {
			console.error('Error processing initial learning journeys:', error);
			return [];
		}
	})();
	let learningJourneys = $state(initialLearningJourneys);
	let retrivedLearningJourneys = $derived(learningJourneys);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	let learningJourneyName = $state(undefined);
	let initialTotalCount = (() => {
		return data.learningJourneys?.TotalCount ?? 0;
	})();
	let totalLearningJourneysCount = $state(initialTotalCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: initialTotalCount,
		amounts: [10, 20, 30, 50]
	});

	const userId = page.params.userId;
	const learningJourneyRoute = `/users/${userId}/learning-journeys`;
	const editRoute = (learningJourneyId) => `/users/${userId}/learning-journeys/${learningJourneyId}/edit`;
	const viewRoute = (learningJourneyId) => `/users/${userId}/learning-journeys/${learningJourneyId}/view`;
	const createRoute = `/users/${userId}/learning-journeys/create`;

	const breadCrumbs = [{ name: 'Learning Journeys', path: learningJourneyRoute }];

	let hasInitialized = $state(false);
	$effect(() => {
		if (!hasInitialized && learningJourneys.length === 0 && !isLoading) {
			hasInitialized = true;
			searchLearningJourney({
				itemsPerPage: paginationSettings.limit,
				pageIndex: paginationSettings.page,
				sortBy,
				sortOrder
			});
		}
	});

	async function searchLearningJourney(model) {
		try {
			isLoading = true;
			let url = `/api/server/lms/learning.journeys/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.learningJourneyName) url += `&name=${model.learningJourneyName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			if (!res.ok) {
				const errorText = await res.text();
				console.error('HTTP error response:', res.status, errorText);
				toastMessage({
					HttpCode: res.status,
					Message: `Failed to fetch learning journeys: ${res.status} ${res.statusText}`
				});
				return;
			}

			const searchResult = await res.json();

			if (searchResult.Status === 'failure' || searchResult.HttpCode !== 200) {
				toastMessage({
					HttpCode: searchResult.HttpCode || 400,
					Message: searchResult.Message || 'Failed to search learning journeys'
				});
				return;
			}

			if (!searchResult.Data) {
				toastMessage({
					HttpCode: 500,
					Message: 'Invalid response from server'
				});
				return;
			}

			const learningJourneyData = searchResult.Data.LearningPathRecords || searchResult.Data.LearningJourneys;
			if (!learningJourneyData) {
				toastMessage({
					HttpCode: 500,
					Message: 'No learning journey data in response'
				});
				return;
			}
			totalLearningJourneysCount = learningJourneyData.TotalCount || 0;
			paginationSettings.size = totalLearningJourneysCount;

			learningJourneys = (learningJourneyData.Items || [])
				.map((item, index) => {
					try {
						if (!item) return null;
						return {
							...item,
							index: index + 1
						};
					} catch (error) {
						console.error('Error processing learning journey item:', error, item);
						return {
							...item,
							index: index + 1
						};
					}
				})
				.filter(Boolean);
			searchKeyword = model.learningJourneyName;
		} catch (err) {
			console.error('Search failed:', err);
			toastMessage({
				HttpCode: 500,
				Message: 'An error occurred while searching learning journeys'
			});
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;
			searchLearningJourney({
				learningJourneyName: searchKeyword,
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
		searchLearningJourney({
			learningJourneyName: searchKeyword,
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
		searchLearningJourney({
			learningJourneyName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchLearningJourney({
			learningJourneyName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleLearningJourneyDelete = async (id) => {
		const response = await fetch(`/api/server/lms/learning.journeys/${id}`, {
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
		searchLearningJourney({
			learningJourneyName: searchKeyword,
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
		<div class="table-container shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative pr-1.5">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								name="learningJourneyName"
								type="text"
								bind:value={learningJourneyName}
								oninput={(event) => onSearchInput(event)}
								placeholder="Search by name"
								class="table-input-field !pr-4 !pl-10"
							/>
							{#if learningJourneyName}
								<button
									type="button"
									onclick={() => {
										learningJourneyName = '';
										onSearchInput({ target: { name: 'name', value: '' } });
									}}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
								</button>
							{/if}
						</div>
					</div>
					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-[2%]"></th>
							<th class="w-[20%]">
								<button onclick={() => sortTable('Name')}>
									Name {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-[20%]">Description</th>
							<th class="w-[15%]">Duration (Days)</th>
							<th class="w-[15%]">Created</th>
							<th class="w-[23%]"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedLearningJourneys.length <= 0}
							<tr class="text-center">
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedLearningJourneys as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Name || 'Not specified'}>
											<span>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</span>
										</Tooltip>
									</td>
									<td>
										<Tooltip text={row.Description || 'Not specified'}>
											{row.Description !== null && row.Description !== ''
												? Helper.truncateText(row.Description, 50)
												: 'Not specified'}
										</Tooltip>
									</td>
									<td>
										{row.DurationInDays !== null && row.DurationInDays !== undefined
											? row.DurationInDays
											: 'Not specified'}
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

									<td>
										<div class="flex items-center justify-end gap-2">
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
	title="Delete Learning Journey"
	onConfirm={handleLearningJourneyDelete}
	id={idToBeDeleted}
	message="Are you sure you want to delete this learning journey?"
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />

