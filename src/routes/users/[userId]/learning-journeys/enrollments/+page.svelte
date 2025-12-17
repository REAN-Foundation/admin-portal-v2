<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////////

	const props = $props<{ data?: PageServerData | null }>();
	const data = props.data ?? null;
	const initialTenantCourseEnrollments = data?.tenantCourseEnrollments ?? {
		Items: [],
		TotalCount: 0
	};
	const initialTenantLearningEnrollments = data?.tenantLearningPathEnrollments ?? {
		Items: [],
		TotalCount: 0
	};
	const tenantName = data?.sessionUser?.tenantName ?? '';

	const userId = page.params.userId;
	const enrollmentsRoute = () => `/users/${userId}/learning-journeys/enrollments`;
	const createCourseEnrollmentRoute = () =>
		`/users/${userId}/learning-journeys/enrollments/create/course`;
	const createLearningEnrollmentRoute = () =>
		`/users/${userId}/learning-journeys/enrollments/create/learning`;

	const breadCrumbs = [
		{
			name: 'Enrollments',
			path: enrollmentsRoute()
		}
	];

	// Tenant enrollments (active, across tenant)
	let tenantActiveTab = $state<'courses' | 'learning'>('courses');
	let tenantCourseEnrollment = $state(
		(initialTenantCourseEnrollments.Items ?? []).map((item, index) => ({
			...item,
			index: index + 1
		}))
	);
	let tenantLearningEnrollment = $state(
		(initialTenantLearningEnrollments.Items ?? []).map((item, index) => ({
			...item,
			index: index + 1
		}))
	);
	let tenantRetrievedEnrollments = $derived(
		tenantActiveTab === 'learning' ? tenantLearningEnrollment : tenantCourseEnrollment
	);
	let tenantTotalCourseCount = $state(
		initialTenantCourseEnrollments.TotalCount || (initialTenantCourseEnrollments.Items?.length ?? 0)
	);
	let tenantTotalLearningCount = $state(
		initialTenantLearningEnrollments.TotalCount ||
			(initialTenantLearningEnrollments.Items?.length ?? 0)
	);

	let sortBy = $state('CreatedAt');
	let sortOrder = $state('descending');

	let tenantPaginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 25,
		size: initialTenantCourseEnrollments.TotalCount || 0,
		amounts: [10, 20, 30, 50]
	});

	let tenantIsLoading = $state(false);
	

	function applyTenantResults(courseData, learningData) {
		if (courseData) {
			tenantTotalCourseCount = courseData.TotalCount ?? 0;
			const items = courseData.Items ?? [];
			tenantCourseEnrollment = items.map((item, index) => ({ ...item, index: index + 1 }));
		}
		if (learningData) {
			tenantTotalLearningCount = learningData.TotalCount ?? 0;
			const items = learningData.Items ?? [];
			tenantLearningEnrollment = items.map((item, index) => ({ ...item, index: index + 1 }));
		}
		tenantPaginationSettings.size =
			tenantActiveTab === 'learning' ? tenantTotalLearningCount : tenantTotalCourseCount;
	}

	async function searchTenantEnrollments(model) {
		try {
			tenantIsLoading = true;
			let url = `/api/server/lms/enrollments/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? tenantPaginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? tenantPaginationSettings.page}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			const searchResult = await res.json();
			const courseData = searchResult?.Data?.CourseEnrollments;
			const learningData = searchResult?.Data?.LearningPathEnrollments;
			applyTenantResults(courseData, learningData);
		} catch (err) {
			console.error('Search Tenant Enrollments failed:', err);
		} finally {
			tenantIsLoading = false;
		}
	}

	function onTenantItemsPerPageChange() {
		tenantPaginationSettings.page = 0;
		searchTenantEnrollments({
			itemsPerPage: tenantPaginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onTenantPageChange() {
		searchTenantEnrollments({
			itemsPerPage: tenantPaginationSettings.limit,
			pageIndex: tenantPaginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function switchTenantTab(tab: 'courses' | 'learning') {
		if (tenantActiveTab === tab) return;
		tenantActiveTab = tab;
		tenantPaginationSettings.page = 0;
		tenantPaginationSettings.size =
			tab === 'learning' ? tenantTotalLearningCount : tenantTotalCourseCount;
		searchTenantEnrollments({
			itemsPerPage: tenantPaginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<!-- Tenant Active Enrollments -->
<div class="px-6 pb-8">
	<div class="mx-auto">
		<div class="table-container shadow">
			<div class="flex flex-wrap items-start justify-between gap-3 px-3 pt-3">
				<div>
					<div class="text-sm font-semibold text-gray-800">Tenant Active Enrollments</div>
					{#if tenantName}
						<div class="text-xs text-gray-500">{tenantName}</div>
					{/if}
				</div>
				<div class="flex items-center justify-end">
					{#if tenantActiveTab === 'courses'}
						<Button
							href={createCourseEnrollmentRoute()}
							variant="primary"
							size="sm"
							iconBefore="material-symbols:add-rounded"
							text="Add Course Enrollment"
						/>
					{:else}
						<Button
							href={createLearningEnrollmentRoute()}
							variant="primary"
							size="sm"
							iconBefore="material-symbols:add-rounded"
							text="Add Learning Enrollment"
						/>
					{/if}
				</div>
			</div>

			<!-- Tabs (below header) -->
			<div class="mb-4 mt-3 flex flex-wrap gap-3 px-3">
				<button
					type="button"
					class={`min-w-[140px] rounded-md border px-4 py-2 text-center text-sm font-semibold shadow ${
						tenantActiveTab === 'courses'
							? 'border-[#2ea3f2] bg-[#2ea3f2] text-white'
							: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
					}`}
					onclick={() => switchTenantTab('courses')}
				>
					Courses ({tenantTotalCourseCount})
				</button>
				<button
					type="button"
					class={`min-w-[140px] rounded-md border px-4 py-2 text-center text-sm font-semibold shadow ${
						tenantActiveTab === 'learning'
							? 'border-[#2ea3f2] bg-[#2ea3f2] text-white'
							: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
					}`}
					onclick={() => switchTenantTab('learning')}
				>
					Learning Journey ({tenantTotalLearningCount})
				</button>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-[5%]">Id</th>
							<th class="w-[20%]">User</th>
							<th class="w-[25%]"
								>{tenantActiveTab === 'learning' ? 'Learning Journey' : 'Course'}</th
							>
							<th class="w-[15%]">Start Date</th>
							<th class="w-[15%]">End Date</th>
						</tr>
					</thead>
					<tbody>
						{#if tenantRetrievedEnrollments.length <= 0}
							<tr class="text-center">
								<td class="text-center" colspan="5"
									>{tenantIsLoading ? 'Loading...' : 'No records found'}</td
								>
							</tr>
						{:else}
							{#each tenantRetrievedEnrollments as enrollment, index}
								<tr>
									<td>{index + 1}</td>
									<td>
										<Tooltip
											text={enrollment.UserId ||
												enrollment.User?.id ||
												enrollment.User?.UserId ||
												enrollment.User?.Email ||
												'Not specified'}
										>
											{enrollment.User?.FullName ||
												enrollment.User?.Name ||
												enrollment.User?.Email ||
												enrollment.UserId ||
												'Not specified'}
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={3} tabindex="0">
										{#if tenantActiveTab === 'learning'}
											<Tooltip text={enrollment.LearningPath?.Name || 'Not specified'}>
												{enrollment.LearningPath?.Name || 'Not specified'}
											</Tooltip>
										{:else}
											<Tooltip text={enrollment.Course?.Name || 'Not specified'}>
												{enrollment.Course?.Name || 'Not specified'}
											</Tooltip>
										{/if}
									</td>
									<td role="gridcell" aria-colindex={4} tabindex="0">
										{TimeHelper.formatDateToReadable(enrollment.StartDate, LocaleIdentifier.EN_US)}
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										{TimeHelper.formatDateToReadable(
											enrollment.ExpectedEndDate || enrollment.EndDate,
											LocaleIdentifier.EN_US
										)}
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

<Pagination
	bind:paginationSettings={tenantPaginationSettings}
	onItemsPerPageChange={onTenantItemsPerPageChange}
	onPageChange={onTenantPageChange}
/>
