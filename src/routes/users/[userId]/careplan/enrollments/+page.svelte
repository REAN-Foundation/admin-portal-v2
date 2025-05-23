<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	
	let { data }: { data: PageData } = $props();

	let debounceTimeout; 
	let isLoading = $state(false);
	let enrollment = $state(data.enrollments.Items);
	let retrivedEnrollments = $derived(enrollment);
	let searchKeyword = $state(undefined);
	let promise = $state();


	const userId = page.params.userId;
	const enrollmentsRoute = `/users/${userId}/careplan/enrollments`;

	const breadCrumbs = [{ name: 'Enrollments', path: enrollmentsRoute }];

	let carePlan = $state(undefined);
	let displayId = $state(undefined);
	let startDate = $state(undefined);
	let endDate = $state(undefined);

	let totalCarePlanCount = $state(data.enrollments.TotalCount);
	$inspect('totalCarePlanCount', totalCarePlanCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalCarePlanCount,
		amounts: [10, 20, 30, 50]
	});


	$inspect('retrivedEnrollment', enrollment);

	async function searchEnrollments(model) {
	try {
		let url = `/api/server/careplan/enrollments/search?`;
		url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

		if (model.carePlan) {
			let careplanId;
			const found = enrollment.find(item => item.Careplan?.Name?.trim() === model.carePlan.trim());
			if (found) {
				careplanId = found.Careplan.id;
			}
			url += `&carePlan=${careplanId ?? model.carePlan}`;
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

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const response = await res.json();

		enrollment = response.map((item, index) => ({
			...item,
			index: index + 1
		}));
	} catch (err) {
		console.error('Search Enrollments failed:', err);
	} finally {
		isLoading = false;
	}
}

async function onSearchInput(e) {
	clearTimeout(debounceTimeout);
	searchKeyword = e.target.value; // store globally if needed elsewhere
	paginationSettings.page = 0; // reset to first page when searching

	debounceTimeout = setTimeout(() => {
		searchEnrollments({
			carePlan: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}, 400);
}

function sortTable(columnName) {
	isSortingName = columnName === 'Name';
	sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
	sortBy = columnName;

	searchEnrollments({
		carePlan: searchKeyword, // uses global search keyword
		itemsPerPage: paginationSettings.limit,
		pageIndex: paginationSettings.page,
		sortBy,
		sortOrder
	});
}

function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchEnrollments({
			carePlan: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchEnrollments({
			carePlan: searchKeyword,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-2">
	<div class="mx-auto">
		<h2 class="text-xl font-medium mb-4">Enrollments</h2>
		<div class="flex justify-between items-center mb-4">
			<div class="flex items-center space-x-2">
				<a href="enrollments/create" class="btn-primary">
					<Icon icon="mdi:plus" class="w-5 h-5" />
					<span>New Enrollment</span>
				</a>
			</div>
		</div>
		<!-- Search Filters -->
		<div class="table-container my-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative flex-1 pr-1.5">
						<input
							type="text"
							name="carePlan"
							placeholder="Search by care plan"
							bind:value={carePlan}
							class="table-input-field"
						/>
					</div>

					<div class="relative flex-1 pr-1.5">
						<input
							type="text"
							name="displayId"
							placeholder="Search by Enrollment code"
							bind:value={displayId}
							class="table-input-field"
						/>
					</div>

					<div class="relative flex-1 pr-1.5">
						<input
							type="date"
							name="startDate"
							placeholder="Search by start date"
							bind:value={startDate}
							class="table-input-field"
						/>
					</div>

					<div class="relative flex-1">
						<input
							type="date"
							name="endDate"
							placeholder="Search by end date"
							bind:value={endDate}
							class="table-input-field"
						/>
					</div>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th>Id</th>
							<th>Participant</th>
							<th>Enrollment Code</th>
							<th>Careplan</th>
							<th>Start Date</th>
							<th>End Date</th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedEnrollments.length <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedEnrollments as enrollment}
								<tr>
									<td>{enrollment.index}</td>
									<td>Participant - {enrollment.ParticipantId}</td>
									<td>{enrollment.EnrollmentCode}</td>
									<td>{enrollment.Careplan}</td>
									<td>{TimeHelper.formatDateToReadable(enrollment.StartDate, LocaleIdentifier.EN_US)}</td>
									<td>{TimeHelper.formatDateToReadable(enrollment.EndDate, LocaleIdentifier.EN_US)}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<div class="flex justify-between items-center px-6">
	<div class="flex items-center">
		<select 
			bind:value={paginationSettings.limit}
			on:change={onItemsPerPageChange}
			class="border rounded px-2 py-1 mr-2"
		>
			{#each paginationSettings.amounts as amount}
				<option value={amount}>{amount} Items</option>
			{/each}
		</select>
	</div>
	<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
</div>
