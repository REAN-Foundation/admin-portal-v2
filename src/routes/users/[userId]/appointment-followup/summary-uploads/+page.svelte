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
	import UploadModal from '$lib/components/appointment/upload.model.svelte';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/follow-up/followup.upload.schema';
	import type { FollowUpUploadModel } from '$lib/types/follow-up/followup.upload';

	//////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let appointmentRecords = $state(data.appointmentRecords.Items);
	let totalUsers_ = $state(data.appointmentRecords.TotalUsers);
	let repiedYesCount_ = $state(data.appointmentRecords.RepliedYes);
	let repiedNoCount_ = $state(data.appointmentRecords.RepliedNo);
	let notRepiedCount_ = $state(data.appointmentRecords.NotReplied);
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
	let totalAppointmentRecordsCount = $state(data.appointmentRecords.TotalCount);
	$inspect('totalAppointmentRecordsCount', totalAppointmentRecordsCount);
	let isSortingName = $state(false);
	let sortBy = $state('appointment_date');
	let sortOrder = $state('ascending');
	let extraction = $state('FileBased');
	let showUploadModal = $state(false);
	let errors = $state(undefined);
	let file = $state(undefined);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalAppointmentRecordsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchAppointments(model) {
		try {
			let url = `/api/server/follow-up/search-appointments?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			console.log('model', model);
			if (model.appointmentDate) url += `&appointmentDate=${model.appointmentDate}`;
			if (model.reply) url += `&repliedStatus=${model.reply}`;
				console.log('model', model);
			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);
			totalAppointmentRecordsCount = searchResult.Data.TotalCount;
			totalUsers_ = searchResult.Data.TotalUsers;
			repiedYesCount_ = searchResult.Data.RepliedYes;
			repiedNoCount_ = searchResult.Data.RepliedNo;
			notRepiedCount_ = searchResult.Data.NotReplied;
			paginationSettings.size = totalAppointmentRecordsCount;

			appointmentRecords = searchResult.Data.Items.map((item, index) => ({
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

	function updateSearchField(name, value) {
		if (name === 'appointmentDate') {
			appointmentDate = value;
		} else if (name === 'reply') {
			reply = value;
		}
	}

	async function onSearchInput(e) {
			clearTimeout(debounceTimeout);
			const { name, value } = e.target;

			updateSearchField(name, value)
			console.log('event', e.target);
			debounceTimeout = setTimeout(() => {
				paginationSettings.page = 0; // reset page when typing new search
				searchAppointments({
					appointmentDate,
					reply,
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
		if (columnName === 'user_name') {
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
			appointmentDate: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchAppointments({
			appointmentDate: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	 function getStatistics() {
		const statistics = [
			{
				label: "Total Users",
				value: totalUsers,
				description: "Count of users who have at least one scheduled appointment"
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
		return statistics
	 }

	 
	const handleUpload = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const followUpUploadModel: FollowUpUploadModel = {
				File : file,
		
			};

			console.log('followUpUploadModel===',followUpUploadModel)

			const validationResult = createOrUpdateSchema.safeParse(followUpUploadModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/follow-up/file-upload`, {
				method: 'POST',
				body: JSON.stringify(followUpUploadModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// goto(`${healthSystemsRoute}/${response?.Data?.HealthSystem?.id}/view`);
				return;
			}

			if (response.Errors) {
				// errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="flex flex-col mx-6 gap-4 md:flex-row">
		{#if extraction === "FileBased"}
			<div class="relative w-auto grow pl-1.5">
				<button class="btn variant-filled-secondary" onclick={() => showUploadModal = true}>
					Upload Appointment Schedules
				</button>
			</div>
		{:else}
			<div class="relative w-auto grow">
				<button class="btn variant-filled-secondary">
					Extract Appointment Schedules
				</button>
			</div>
		{/if}
			<div class="relative w-auto grow">
				<button class="btn variant-filled-secondary">
					Cancel Appointments
				</button>
			</div>
			<div class="relative w-auto grow">
				<button class="btn variant-filled-secondary">
					View Cancellations
				</button>
			</div>
</div> 

<UploadModal show={showUploadModal} onClose={() => showUploadModal = false} onSubmit ={(e) => handleUpload(e.detail)} />

<div class="mt-4 mx-6 overflow-x-auto rounded-lg border border-[var(--color-outline)]">
	<div class="mx-auto">
		<table class="w-full table-fixed text-[var(--color-info)]">
			<tbody>
				{#each getStatistics() as stat}
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
						<!-- {#if appointmentDate}
							<button
								type="button"
								onclick={() => {
									appointmentDate = '';
									onSearchInput({ target: { name: 'appointmentDate', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if} -->
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
							<option value="Not replied">Not Replied</option>
							</select>
						<!-- {#if reply}
							<button
								type="button"
								onclick={() => {
									reply = '';
									onSearchInput({ target: { name: 'reply', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if} -->
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th data-sort="index">Id</th>
							<th>
								<button onclick={() => sortTable('user_name')}>
									User Name
									{#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th>Location</th>
							<th>EMRID</th>
							<th>Phone No</th>
							<th>Status</th>
							<th>Appointment Date</th>
							<th>Appointment Time</th>
							<th>Replied Status</th>
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
										>{row.user_name ? row.user_name : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={3} tabindex="0"
										>{row.location ? row.location : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={4} tabindex="0"
										>{row.participant_code ? row.participant_code : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={5} tabindex="0"
										>{row.phone_number ? row.phone_number : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={6} tabindex="0"
										>{row.status ? row.status : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={7} tabindex="0"
										>{row.appointment_date ? row.appointment_date : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={7} tabindex="0"
										>{row.appointment_time ? row.appointment_time : 'Not Specified'}</td
									>
									<td role="gridcell" aria-colindex={8} tabindex="0"
										>{row.replied_status ? row.replied_status : 'Not Specified'}</td
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
