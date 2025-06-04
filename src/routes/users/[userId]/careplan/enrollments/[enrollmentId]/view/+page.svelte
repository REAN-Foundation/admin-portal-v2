<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import EnrollmentDisplay from '$lib/components/enrollment.display/enrollment.display.svelte';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';

	///////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const enrollmentId = page.params.enrollmentId;
	const viewRoute = `/users/${userId}/careplan/enrollments/${enrollmentId}/view`;
	const viewTaskRoute = `/users/${userId}/careplan/enrollments/${enrollmentId}/tasks`;
	const enrollmentsRoute = `/users/${userId}/careplan/enrollments`;

	let { data }: { data: PageServerData } = $props();
	let enrollment = $state(data.enrollment);
	let enrollmentStats = $state(data.enrollmentStats);
	let participantBirthDate = enrollment.Participant.BirthDate;
	let participantDisplayId = enrollment.Participant.DisplayId;
	let enrollmentCode = enrollment.DisplayId;
	let currentWeek = enrollmentStats.CurrentWeek;
	let totalWeeks = enrollmentStats.TotalWeek;
	let MAX_STEP_WIDTH = 500;

	//Calculating age by birthdate
	let year = Number(participantBirthDate.substr(0, 4));
	let month = Number(participantBirthDate.substr(4, 2)) - 1;
	let day = Number(participantBirthDate.substr(6, 2));
	let today = new Date();
	let age = today.getFullYear() - year;
	if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
		age--;
	}

	const breadCrumbs = [
		{
			name: 'Enrollments',
			path: enrollmentsRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-4">
		<a href={viewTaskRoute} class="edit-btn variant-filled-secondary hover:!variant-soft-secondary">
			<Icon icon="icon-park-outline:preview-open" />
			<span>Enrollment Tasks</span>
		</a>
	</div>

	<div class="mx-auto w-full px-6 py-4">
		<div class="form-headers">
			<h2 class="form-titles">View Enrollment</h2>
			<a href={enrollmentsRoute} class="cancel-btn" hidden>
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<!-- ✅ Responsive flex layout -->
		<div class="flex flex-col md:flex-row gap-6">
			<!-- Table column -->
			<div class="w-full md:w-7/12">
				<table class="w-full">
					<tbody>
						<tr class="tables-row">
							<td class="table-label">Enrollment Code</td>
							<td class="table-data">{enrollmentCode}</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Participant</td>
							<td class="table-data">Participant # {participantDisplayId}</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Age</td>
							<td class="table-data">{age}</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Gender</td>
							<td class="table-data">{enrollment.Participant.Gender}</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Careplan</td>
							<td class="table-data">{enrollment.Careplan.Name}</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Category</td>
							<td class="table-data">{enrollment.Careplan.Category.Type}</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Enrollment Date</td>
							<td class="table-data">
								{TimeHelper.formatDateToReadable(enrollment.EnrollmentDate, LocaleIdentifier.EN_US)}
							</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Start Date</td>
							<td class="table-data">
								{TimeHelper.formatDateToReadable(enrollment.StartDate, LocaleIdentifier.EN_US)}
							</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">End Date</td>
							<td class="table-data">
								{TimeHelper.formatDateToReadable(enrollment.EndDate, LocaleIdentifier.EN_US)}
							</td>
						</tr>
						<tr class="tables-row">
							<td class="table-label">Current Week</td>
							<td class="table-data">{currentWeek}</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Graph column -->
			<div class="w-full md:w-5/12 pr-0 md:pr-6">
				<EnrollmentDisplay {totalWeeks} {currentWeek} {MAX_STEP_WIDTH} />
			</div>
		</div>
	</div>

	<div class="grid-cols mt-4 grid gap-14 pb-4 md:grid-cols-2 md:gap-28 lg:grid-cols-4 lg:gap-24">
		<div class="flex justify-center">
			<div class="grid-cols grid justify-items-center">
				<label class="form-label mb-2 text-xl">Total Tasks</label>
				<div
					class="radial-progress text-secondary text-xl font-bold"
					style="--value:100;--size:98px; --thickness:10px"
				>
					{enrollmentStats.TolalTask}
				</div>
			</div>
		</div>
		<div class="flex justify-center">
			<div class="grid-cols grid justify-items-center">
				<label class="form-label mb-2 text-xl">Finished Tasks</label>
				<div
					class="radial-progress text-xl font-bold text-green-500"
					style="--value:100;--size:98px; --thickness:10px"
				>
					{enrollmentStats.FinishedTask}
				</div>
			</div>
		</div>
		<div class="flex justify-center">
			<div class="grid-cols grid justify-items-center">
				<label class="form-label mb-2 text-xl">Delayed Tasks</label>
				<div
					class="radial-progress text-xl font-bold text-red-500"
					style="--value:100;--size:98px; --thickness:10px"
				>
					{enrollmentStats.DelayedTask}
				</div>
			</div>
		</div>
		<div class="flex justify-center">
			<div class="grid-cols grid justify-items-center">
				<label class="form-label mb-2 text-xl">Unserved Tasks</label>
				<div
					class="radial-progress text-secondary text-xl font-bold"
					style="--value:100; --size:98px; --thickness:10px"
				>
					{enrollmentStats.UnservedTask}
				</div>
			</div>
		</div>
	</div>
</div>
