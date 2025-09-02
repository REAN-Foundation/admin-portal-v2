<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import type { PageServerData } from './$types';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';

	//////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	console.log('data', data);
	let appointmentCancellationRecords = $state(data.appointmentCancellationRecords.Items);
	let retrivedCancelledAppointmentRecords = $derived(appointmentCancellationRecords);
	let searchKeyword = $state(undefined);
	let fromDate = $state(undefined);
	let toDate = $state(undefined);
	let promise = $state();
	const userId = page.params.userId;
	const statusReportRoute = `/users/${userId}/appointment-followup/summary-uploads`;

	const breadCrumbs = [
		{ name: 'Status Report', path: statusReportRoute },
		{ name: 'Cancellations', path: `/users/${userId}/appointment-followup/view-cancellation` }
	];
	let date = $state(undefined);
	let appointmentCancellationRecordsCount = $state(data.appointmentCancellationRecords.TotalCount);
	$inspect('totalAppointmentRecordsCount', appointmentCancellationRecordsCount);
	let isSortingDate = $state(false);
	let sortBy = $state('cancel_date');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: appointmentCancellationRecordsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchAppointmentCancellations(model) {
		try {
			let url = `/api/server/follow-up/view-cancellation?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			console.log('model', model);
			if (model.fromDate) url += `&fromDate=${model.fromDate}`;
			if (model.toDate) url += `&toDate=${model.toDate}`;
			console.log('model', model);
			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			appointmentCancellationRecordsCount = searchResult.Data.TotalCount;
			paginationSettings.size = appointmentCancellationRecordsCount;

			appointmentCancellationRecords = searchResult.Data.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.fromDate;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'fromDate') {
			fromDate = value;
		} else if (name === 'toDate') {
			toDate = value;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;

		updateSearchField(name, value);
		console.log('event', e.target);
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;

			if (fromDate && toDate) {
				paginationSettings.page = 0;
				searchAppointmentCancellations({
					fromDate,
					toDate,
					itemsPerPage: paginationSettings.limit,
					pageIndex: 0,
					sortBy,
					sortOrder
				});
			}
		}, 400);
	}

	function sortTable(columnName) {
		isSortingDate = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Date') {
			isSortingDate = true;
		}
		sortBy = columnName;
		searchAppointmentCancellations({
			fromDate,
			toDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0;
		searchAppointmentCancellations({
			fromDate,
			toDate,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchAppointmentCancellations({
			appointmentDate: searchKeyword,
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
		<div class="table-container mb-6 shadow">
			<div class="search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<label class="lable mt-2" for="fromDate">From Date</label>
					<div class="relative w-auto grow pl-1.5">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="date"
							name="froMDate"
							placeholder="Search cancellations from date"
							bind:value={fromDate}
							oninput={(event) => onSearchInput(event)}
							class="health-system-input !pr-4 !pl-10"
						/>
					</div>

					<label class="lable mt-2" for="toDate">To Date</label>
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="date"
							name="toDate"
							placeholder="Search cancellations to date"
							bind:value={toDate}
							oninput={(event) => onSearchInput(event)}
							class="health-system-input !pr-4 !pl-10"
						/>
					</div>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<!-- <button
						type="button"
						onclick={() => {
							searchKeyword = '';
							onSearchInput({ target: { name: 'fromDate', value: '' } });
							onSearchInput({ target: { name: 'toDate', value: '' } });
						}}
						class="close-btn"
					>
						<Icon icon="material-symbols:close" />
					</button> -->
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th data-sort="index">Id</th>
							<th>
								<button onclick={() => sortTable('Date')}>
									Date
									{#if isSortingDate}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th>Message</th>
							<th>Cancelled By</th>
							<th>Cancelled On</th>
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedCancelledAppointmentRecords.length <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedCancelledAppointmentRecords as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td role="gridcell" aria-colindex={2} tabindex="0"
										>{TimeHelper.formatDateToReadable(row.cancel_date, LocaleIdentifier.EN_US)}</td
									>
									<td role="gridcell" aria-colindex={3} tabindex="0"
										>{row.message ? row.message : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={3} tabindex="0"
										>{row.cancelled_by_user_name ? row.cancelled_by_user_name : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{TimeHelper.formatDateToReadable(row.created_at, LocaleIdentifier.EN_US)}</td
									>
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
