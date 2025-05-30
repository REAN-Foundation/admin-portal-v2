<script lang="ts">
	import type { PageServerData } from './$types';
	import date from 'date-and-time';
	import { page } from '$app/state';
	import EnrollmentDisplay from '$lib/components/enrollment.display/enrollment.display.svelte';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////

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

	<div class="forms-container">
		<div class="form-header">
			<h2 class="form-title">View Enrollment</h2>
			<a href={enrollmentsRoute} class="cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<div class="lg:flex w-full">
			<table class="form-table lg:w-1/2 w-full">
				<tbody>
					<tr>
						<td class="form-td-left">Enrollment Code</td>
						<td class="form-td-right">{enrollmentCode}</td>
					</tr>
					<tr>
						<td class="form-td-left">Participant</td>
						<td class="form-td-right">Participant # {participantDisplayId}</td>
					</tr>
					<tr>
						<td class="form-td-left">Age</td>
						<td class="form-td-right">{age}</td>
					</tr>
					<tr>
						<td class="form-td-left">Gender</td>
						<td class="form-td-right">{enrollment.Participant.Gender}</td>
					</tr>
					<tr>
						<td class="form-td-left">Careplan</td>
						<td class="form-td-right">{enrollment.Careplan.Name}</td>
					</tr>
					<tr>
						<td class="form-td-left">Category</td>
						<td class="form-td-right">{enrollment.Careplan.Category.Type}</td>
					</tr>
					<tr>
						<td class="form-td-left">Enrollment Date</td>
						<td class="form-td-right">{date.format(new Date(enrollment.EnrollmentDate), 'DD-MMM-YYYY')}</td>
					</tr>
					<tr>
						<td class="form-td-left">Start Date</td>
						<td class="form-td-right">{date.format(new Date(enrollment.StartDate), 'DD-MMM-YYYY')}</td>
					</tr>
					<tr>
						<td class="form-td-left">End Date</td>
						<td class="form-td-right">{date.format(new Date(enrollment.EndDate), 'DD-MMM-YYYY')}</td>
					</tr>
					<tr>
						<td class="form-td-left">Current Week</td>
						<td class="form-td-right">{currentWeek}</td>
					</tr>
				</tbody>
			</table>
			<div class="lg:w-1/2 w-full pr-6">
				<EnrollmentDisplay {totalWeeks} {currentWeek} {MAX_STEP_WIDTH} />
			</div>
		</div>

		<div class="grid grid-cols md:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-24 md:gap-28 pb-4 mt-4">
			<div class="flex justify-center">
				<div class="grid grid-cols justify-items-center">
					<label class="form-label text-xl mb-2">Total Tasks</label>
					<div
						class="radial-progress text-secondary text-xl font-bold"
						style="--value:100;--size:98px; --thickness:10px"
					>
						{enrollmentStats.TolalTask}
					</div>
				</div>
			</div>
			<div class="flex justify-center">
				<div class="grid grid-cols justify-items-center">
					<label class="form-label text-xl mb-2">Finished Tasks</label>
					<div
						class="radial-progress text-green-500 text-xl font-bold"
						style="--value:100;--size:98px; --thickness:10px"
					>
						{enrollmentStats.FinishedTask}
					</div>
				</div>
			</div>
			<div class="flex justify-center">
				<div class="grid grid-cols justify-items-center">
					<label class="form-label text-xl mb-2">Delayed Tasks</label>
					<div
						class="radial-progress text-red-500 text-xl font-bold"
						style="--value:100;--size:98px; --thickness:10px"
					>
						{enrollmentStats.DelayedTask}
					</div>
				</div>
			</div>
			<div class="flex justify-center">
				<div class="grid grid-cols justify-items-center">
					<label class="form-label text-xl mb-2">Unserved Tasks</label>
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
</div>
