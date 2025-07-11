<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	console.log('data', data);
	let debounceTimeout;
	let isLoading = $state(false);
	let enrollment = $state(data.enrollments.Items);
	let retrivedEnrollments = $derived(enrollment);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const enrollmentsRoute = () => `/users/${userId}/careplan/enrollments`;
	const viewRoute = (id) => `/users/${userId}/careplan/enrollments/${id}/view`;

	const breadCrumbs = [
		{
			name: 'Enrollments',
			path: enrollmentsRoute()
		}
	];

	let carePlan = $state(undefined);
	let displayId = $state(undefined);
	let startDate = $state(undefined);
	let endDate = $state(undefined);

	let totalCarePlanCount = $state(data.enrollments.TotalCount);
	$inspect('totalCarePlanCount', totalCarePlanCount);

	let isSortingName = $state(false);
	let sortBy = $state('StartDate');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalCarePlanCount,
		amounts: [10, 20, 30, 50]
	});

	$inspect('retrivedEnrollment', enrollment);

	function isGuid(value: string) {
		const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return guidRegex.test(value);
	}

	async function searchEnrollments(model) {
		try {
			let url = `/api/server/careplan/enrollments/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			const carePlanName = model.carePlan ?? carePlan;
			if (carePlanName) {
				const matchedPlan = enrollment.find(
					(item) => item.Careplan?.Name?.trim() === carePlanName.trim()
				);
				const careplanId = matchedPlan?.Careplan?.id;

				if (careplanId) {
					url += `&carePlan=${encodeURIComponent(careplanId)}`;
				} else {
					console.warn('CarePlan ID not found, sending carePlanName:', carePlanName);
					url += `&careplanName=${encodeURIComponent(carePlanName)}`;
				}
			}

			if (model.displayId ?? displayId) {
				url += `&displayId=${model.displayId ?? displayId}`;
			}

			if (model.startDate ?? startDate) {
				url += `&startDate=${model.startDate ?? startDate}`;
			}

			if (model.endDate ?? endDate) {
				url += `&endDate=${model.endDate ?? endDate}`;
			}

			if (model.sortBy ?? sortBy) {
				url += `&orderBy=${model.sortBy ?? sortBy}`;
				url += `&order=${(model.sortOrder ?? sortOrder).toUpperCase()}`;
			}

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			const searchResult = await res.json();
			console.log('searchResult', searchResult);

			totalCarePlanCount = searchResult.Data.TotalCount;
			paginationSettings.size = totalCarePlanCount;

			const items = searchResult?.Data?.Items ?? [];

			if (items.length === 0) {
				enrollment = [];
			} else {
				enrollment = items.map((item, index) => ({
					...item,
					index: index + 1
				}));
			}
		} catch (err) {
			console.error('Search Enrollments failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function onSearchInput(e, field: 'carePlan' | 'displayId' | 'startDate' | 'endDate') {
		console.log('Key', e.target.value);
		clearTimeout(debounceTimeout);
		const keyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;

			if (field === 'carePlan') carePlan = keyword;
			if (field === 'displayId') displayId = keyword;
			if (field === 'startDate') startDate = keyword;
			if (field === 'endDate') endDate = keyword;
			searchEnrollments({
				carePlan: searchKeyword,
				displayId,
				startDate,
				endDate,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName: string) {
		isSortingName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;

		searchEnrollments({
			carePlan: searchKeyword,
			displayId,
			startDate,
			endDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0;
		searchEnrollments({
			carePlan: searchKeyword,
			displayId,
			startDate,
			endDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchEnrollments({
			carePlan: searchKeyword,
			displayId,
			startDate,
			endDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							name="carePlan"
							type="text"
							oninput={(event) => onSearchInput(event, 'carePlan')}
							bind:value={carePlan}
							placeholder="Search by careplan"
							class="table-input-field !pr-10 !pl-10"
						/>
						
						{#if carePlan}
							<button
								type="button"
								onclick={() => {
									carePlan = '';
									onSearchInput({ target: { name: 'name', value: '' } }, 'carePlan');
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
							name="displayId"
							placeholder="Search by enrollment code"
							bind:value={displayId}
							oninput={(event) => onSearchInput(event, 'displayId')}
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if displayId}
							<button
								type="button"
								onclick={() => {
									displayId = '';
									onSearchInput({ target: { name: 'name', value: '' } }, 'displayId');
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>

					<div class="relative flex flex-row items-center pr-1.5">
						<label class="pr-2">Start date</label>
						<div class="relative w-auto grow">
							<input
								type="date"
								name="startDate"
								placeholder="Search by start date"
								bind:value={startDate}
								oninput={(event) => onSearchInput(event, 'startDate')}
								class="table-input-field pr-4 pl-10"
							/>
							{#if startDate}
							<button
								type="button"
								onclick={() => {
									startDate = '';
									onSearchInput({ target: { name: 'name', value: '' } }, 'startDate');
								}}
								class="close-btn"
							>
								<!-- <Icon icon="material-symbols:close" /> -->
							</button>
						{/if}
						</div>
					</div>

					<div class="relative flex flex-row items-center pr-1.5">
						<label class="pr-2">End date</label>
						<div class="relative w-auto grow">
							<input
								type="date"
								name="endDate"
								placeholder="Search by end date"
								bind:value={endDate}
								oninput={(event) => onSearchInput(event, 'endDate')}
								class="table-input-field pr-4 pl-10"
							/>
							{#if endDate}
							<button
								type="button"
								onclick={() => {
									endDate = '';
									onSearchInput({ target: { name: 'name', value: '' } }, 'endDate');
								}}
								class="close-btn"
							>
								<!-- <Icon icon="material-symbols:close" /> -->
							</button>
						{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th>Id</th>
							<th>
								<button onclick={() => sortTable('Participant')}>
									Participant
									{#if sortBy === 'Participant'}
										<Icon
											icon={sortOrder === 'ascending' ? 'mdi:chevron-up' : 'mdi:chevron-down'}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th>
								<button onclick={() => sortTable('EnrollmentCode')}>
									Enrollment Code
									{#if sortBy === 'EnrollmentCode'}
										<Icon
											icon={sortOrder === 'ascending' ? 'mdi:chevron-up' : 'mdi:chevron-down'}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th>
								<button onclick={() => sortTable('Careplan')}>
									Careplan
									{#if sortBy === 'Careplan'}
										<Icon
											icon={sortOrder === 'ascending' ? 'mdi:chevron-up' : 'mdi:chevron-down'}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th>Start Date</th>
							<th>End Date</th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedEnrollments.length <= 0}
							<tr>
								<td class="text-center" colspan="7"
									>{isLoading ? 'Loading...' : 'No records found'}</td
								>
							</tr>
						{:else}
							{#each retrivedEnrollments as enrollment, index}
								<tr>
									<td>{paginationSettings.page * paginationSettings.limit + index + 1}</td>
									<td>
										<Tooltip text={enrollment.ParticipantId || 'Not specified'}>
											<a href={viewRoute(enrollment.id)}>
												Participant -
												{enrollment.Participant.DisplayId
													? Helper.truncateText(enrollment.Participant.DisplayId, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td>{enrollment.DisplayId}</td>
									<td>{enrollment.Careplan.Name}</td>
									<td>
										{TimeHelper.formatDateToReadable(enrollment.StartDate, LocaleIdentifier.EN_US)}
									</td>
									<td>
										{TimeHelper.formatDateToReadable(enrollment.EndDate, LocaleIdentifier.EN_US)}
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

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
