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

	//////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let appointmentRecords = $state(data.appointmentRecords.data);
	let totalUsers_ = $state(data.appointmentRecords.total_users);
	let repiedYesCount_ = $state(data.appointmentRecords.replied_yes);
	let repiedNoCount_ = $state(data.appointmentRecords.replied_no);
	let notRepiedCount_ = $state(data.appointmentRecords.not_replied);
	let totalUsers = $derived(totalUsers_);
	let repiedYesCount = $derived(repiedYesCount_);
	let repiedNoCount = $derived(repiedNoCount_);
	let notRepiedCount = $derived(notRepiedCount_);
	let retrivedAppointmentRecords = $derived(appointmentRecords);
	
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);
	let reply = $state(undefined);
	let appointmentDate = $state(undefined);
	let promise = $state();
	const userId = page.params.userId;
	const statusReportRoute = `/users/${userId}/appointment-followup/summary-uploads`;
	const breadCrumbs = [{ name: 'Status Report', path: statusReportRoute }];
	let date = $state(undefined);
	let totalAppointmentRecordsCount = $state(data.appointmentRecords.data.length);
	$inspect('totalAppointmentRecordsCount', totalAppointmentRecordsCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalAppointmentRecordsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchAppointments(model) {
		try {
			let url = `/api/server/follow-up/search-appointments?`;
			// console.log('model', model);
			if (model.appointmentDate) url += `&appointment_date=${model.appointmentDate}`;
			if (reply) url += `&replied_status=${model.reply}`;
				console.log('model', model);
			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalAppointmentRecordsCount = searchResult.Data.data.length;
			totalUsers_ = searchResult.Data.total_users;
			repiedYesCount_ = searchResult.Data.replied_yes;
			repiedNoCount_ = searchResult.Data.replied_no;
			notRepiedCount_ = searchResult.Data.not_replied;
			paginationSettings.size = totalAppointmentRecordsCount;

			appointmentRecords = searchResult.Data.data.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.appointmentDate;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		console.log('date**', date);
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchAppointments({
				appointmentDate: searchKeyword,
				reply:searchKeyword,
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
		searchAppointments({
			appointmentDate: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0;
		searchAppointments({
			date: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchAppointments({
			healthSystemName: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}
	const statistics = [
		{
			label: "Total Users",
			value: totalUsers,
			description: "Overall count of users associated with the tenant."
		},
			{
			label: "Replied Yes Count",
			value: repiedYesCount,
			description: "Number of users who replied with 'Yes'."
		},
		{
			label: "Replied No Count",
			value: repiedNoCount,
			description: "Number of users who replied with 'No'."
		},
		{
			label: "Not Replied Count",
			value: notRepiedCount,
			description: "Number of users who did not reply."
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mt-4 overflow-x-auto rounded-lg border border-[var(--color-outline)]">
	<div class="mx-auto">
		<table class="w-full table-fixed text-[var(--color-info)]">
			<tbody>
				{#each statistics as stat}
					<tr>
						<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">{stat.label}</td>
						<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">{stat.value}</td>
						<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">{stat.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container mb-6 shadow">
		<div class="health-system-search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow pl-1.5">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="date"
							name="appointmentDate"
							placeholder="Search by appointment date"
							bind:value={appointmentDate}
							oninput={(event) => onSearchInput(event)}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if appointmentDate}
							<button
								type="button"
								onclick={() => {
									appointmentDate = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<div class="relative w-auto grow">
						<!-- <Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/> -->
						   <select
							name="reply"
							bind:value={reply}
							oninput={(event) => onSearchInput(event)}
							class="input w-1/4 ml-auto"
						>
							<option value="" disabled selected>Filter by reply</option>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
							<option value="Not Replied">Not Replied</option>
							</select>
						{#if reply}
							<button
								type="button"
								onclick={() => {
									reply = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th data-sort="index">Id</th>
							<th>Patient Name</th>
							<th>Hospital Name</th>
							<th>EMRID</th>
							<th>Phone No</th>
							<th>Status</th>
							<th>Appointment Time</th>
							<th>Replied</th>
							<!-- <th>Created Date</th> -->
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedAppointmentRecords.length <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedAppointmentRecords as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td role="gridcell" aria-colindex={2} tabindex="0"
										>{row.user_name ? row.user_name : 'Unspecified'}</td
									>
									<td role="gridcell" aria-colindex={3} tabindex="0"
										>{row.location ? row.location : 'Unspecified'}</td
									>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{row.participant_code ? row.participant_code : 'Unspecified'}</td
									>
									<td role="gridcell" aria-colindex={5} tabindex="0"
										>{row.phone_number ? row.phone_number : 'Unspecified'}</td
									>
									<td role="gridcell" aria-colindex={6} tabindex="0"
										>{row.status ? row.status : 'Unspecified'}</td
									>
									<td role="gridcell" aria-colindex={7} tabindex="0"
										>{row.appointment_time ? row.appointment_time : 'Unspecified'}</td
									>
									<td role="gridcell" aria-colindex={8} tabindex="0"
										>{row.replied_status ? row.replied_status : 'Unspecified'}</td
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

<!-- <Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} /> -->
