<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Icon from '@iconify/svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { goto } from '$app/navigation';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();	
	$inspect(data)

	let debounceTimeout;
	let isLoading = $state(false);
	let careplanId = data.enrollment?.CareplanId;
	let enrollmentsTasks = $state(data.enrollmentTask.Items);
	let retrivedEnrollmentTasks = $derived(enrollmentsTasks);
	let participantResponse = $state(data.participantResponse);
	let retrivedParticipantResponse = $derived(participantResponse);
	let enrollmentDsipId = $state(data.enrollment);
	let enrollmentCode = $state(enrollmentDsipId.DisplayId);
	let searchKeyword = $state(undefined);
	let enrollmentId = page.params.enrollmentId

	const userId = page.params.userId;
	const enrollmentsRoute = `/users/${userId}/careplan/enrollments`;
	const enrollmentsTask = (enrollmentId) => `/users/${userId}/careplan/enrollments/${enrollmentId}/tasks`;

	const breadCrumbs = [
		{
			name: 'Enrollment',
			path: enrollmentsRoute
		},
		{
			name: 'Task',
			path: enrollmentsTask
		}
	];

	let assetType = $state(undefined);
	let scheduledDate = $state(undefined);
	let sortBy = $state('ScheduledDate');
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalEnrollmentTasksCount = $state(data.enrollmentTask.TotalCount);
	$inspect('totalEnrollmentTasksCount', totalEnrollmentTasksCount)
	let isSortingAssetType = $state(false);
	let isSortingCreatedAt = $state(false);

	let paginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalEnrollmentTasksCount,
		amounts: [10, 20, 30, 50]
	});

	$inspect('retrivedEnrollment', enrollmentsTask);
	$inspect('retrivedParticipantResponse', participantResponse);

	async function searchEnrollments(model) {
	try {
		isLoading = true;

		let url = `/api/server/careplan/enrollment-task/search?`;
		url += `sortOrder=${model.sortOrder ?? sortOrder}`;
		url += `&sortBy=${model.sortBy ?? sortBy}`;
		url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
		url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
		url += `&careplanId=${careplanId}`;
		url += `&enrollmentId=${enrollmentId}`;
		if (model.assetType) url += `&assetType=${model.assetType}`;
		if (model.scheduledDate) url += `&scheduledDate=${model.scheduledDate}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		console.log('searchResult', searchResult);

		totalEnrollmentTasksCount = searchResult.Data.TotalCount;
		paginationSettings.size = totalEnrollmentTasksCount;

		enrollmentsTasks = searchResult.Data.Items.map((item, index) => ({
			...item,
			index: index + 1
		}));
		participantResponse = searchResult.Data.ParticipantResponse;
	} catch (err) {
		console.error('Search failed:', err);
	} finally {
		isLoading = false;
	}
}

async function onSearchInput(e) {
	clearTimeout(debounceTimeout);
	let searchKeyword = e.target.value;
	assetType = searchKeyword;

	debounceTimeout = setTimeout(() => {
		paginationSettings.page = 0; 
		searchEnrollments({
			assetType: searchKeyword,
			scheduledDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}, 400);
}


	function sortTable(columnName) {
		isSortingAssetType = false;
		isSortingCreatedAt = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'AssetType') {
			isSortingAssetType = true;
		} else if (columnName === 'ScheduledDate') {
			isSortingCreatedAt = true;
		}
		sortBy = columnName;
		searchEnrollments({
			assetType: searchKeyword,
			scheduledDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
	paginationSettings.page = 0; 
	searchEnrollments({
		assetType,
		scheduledDate,
		itemsPerPage: paginationSettings.limit,
		pageIndex: 0,
		sortBy,
		sortOrder
	});
}

	function onPageChange() {
		searchEnrollments({
			assetType: searchKeyword,
			scheduledDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function handleViewTask(enrollmentId: string) {
	const path = enrollmentsTask(enrollmentId);
	goto(path);
}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container mb-6 shadow">
			<div class="flex items-center p-5 ">
				<h2 class="text-lg font-semibold pr-2">Enrollment Code : <span class=" font-normal">{enrollmentCode}</span></h2>
				
			</div>

			<div class="health-system-search-border mb-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative pr-1.5">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								name="assetType"
								type="text"
								bind:value={assetType}
								placeholder="Search by Type"
								class="input !pl-10"
								oninput={(event) => onSearchInput(event)}
							/>
							{#if assetType}
								<button
									type="button"
									onclick={() => (assetType = '')}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
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
							<th class="text-start">Name</th>
							<th>
								<button onclick={() => sortTable('AssetType')}>
									Type
									{#if isSortingAssetType}
										<Icon
											icon={sortOrder === 'ascending'
												? 'mdi:chevron-up'
												: 'mdi:chevron-down'}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th>
								<button onclick={() => sortTable('CreatedAt')}>
									Created Date
									{#if isSortingCreatedAt}
										<Icon
											icon={sortOrder === 'ascending'
												? 'mdi:chevron-up'
												: 'mdi:chevron-down'}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th class="text-start">Completed</th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedEnrollmentTasks.length <= 0}
							<tr>
								<td colspan="5">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedEnrollmentTasks as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td>{row.Asset?.Name || 'Not specified'}</td>
									<td>{row.AssetType}</td>
									<td>
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>
									<td class="text-center">
										{#if row.ProgressStatus === 'Completed'}
											<Icon
												icon="material-symbols:done-rounded"
												class="text-xl text-green-500"
											/>
										{:else}
											<Icon
												icon="material-symbols:close-rounded"
												class="text-xl text-red-500"
											/>
										{/if}
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
