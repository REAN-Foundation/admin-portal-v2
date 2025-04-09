<script lang="ts">
	import JointBarGraph from '$lib/components/analytics/JointBarGraph.svelte';
	import Line from '$lib/components/analytics/Line.svelte';
	import PieChart from '$lib/components/analytics/PieChart.svelte';
	import {
		processPatientDeregistrationHistory,
		formatLabelOfMonth,
		processPatientRegistrationHistory,
		formatDate
	} from './components/functions';

	let { data } = $props();
	console.log('analytics data ==>', data);

	let patientRegistrationHistoryData: any = $state(),
		patientRegistrationHistoryLabels: any = $state();
	let patientDeRegistrationHistoryData: any = $state();
	let usersDistributionByRoleData: any = $state(),
		usersDistributionByRoleLabels: any = $state();
	let activeUsersCountAtEndOfMonthData: any = $state(),
		activeUsersCountAtEndOfMonthLabels: any = $state();

	let dereg = processPatientDeregistrationHistory(
		data.basicStatistics.PatientDeregistrationHistory
	);

	if (data.basicStatistics) {
		if (data.basicStatistics.PatientRegistrationHistory) {
			patientRegistrationHistoryData = data.basicStatistics.PatientRegistrationHistory.map(
				(x: { user_count: any }) => x.user_count
			);
			patientRegistrationHistoryLabels = data.basicStatistics.PatientRegistrationHistory.map(
				(x: { month: string }) => {
					const label = formatLabelOfMonth(x.month);
					return label ? label : 'Unknown';
				}
			);
		}

		if (data.basicStatistics.PatientDeregistrationHistory) {
			patientDeRegistrationHistoryData = data.basicStatistics.PatientDeregistrationHistory.map(
				(x: { user_count: any }) => x.user_count
			);
			// patientDeRegistrationHistoryLabels = data.basicStatistics.PatientDeregistrationHistory.map(
			//     (x) => {
			//         const label = formatMonthLabel(x.month);
			//         return label ? label : 'Unknown';
			//     }
			// );
		}
		if (data.basicStatistics.UsersDistributionByRole) {
			usersDistributionByRoleData = data.basicStatistics.UsersDistributionByRole.map(
				(x: { registration_count: any }) => x.registration_count
			);
			usersDistributionByRoleLabels = data.basicStatistics.UsersDistributionByRole.map(
				(x: { role_name: any }) => x.role_name
			);
		}

		if (data.basicStatistics.ActiveUsersCountAtEndOfMonth) {
			activeUsersCountAtEndOfMonthData = data.basicStatistics.ActiveUsersCountAtEndOfMonth.map(
				(x: { active_user_count: any }) => x.active_user_count
			);
			activeUsersCountAtEndOfMonthLabels = data.basicStatistics.ActiveUsersCountAtEndOfMonth.map(
				(x: { month_end: any }) => x.month_end
			);
		}
	}
	$inspect('usersDistributionByRoleData', usersDistributionByRoleData);
	$inspect('usersDistributionByRoleLabels', usersDistributionByRoleLabels);

	let result = $derived(
		processPatientRegistrationHistory(
			data.basicStatistics.PatientRegistrationHistory,
			data.basicStatistics.PatientDeregistrationHistory
		)
	);

	$inspect('this is formatted result', result);
</script>

<div class=" my-8">
	<table class="flex justify-center">
		<tbody class="">
			<tr class="border text-sm">
				<td class="  p-2 text-[var(--color-info)] md:px-8 xl:px-24">Tenant Name</td>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24">American Heart Association</td>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24"
					>Name of the tenant/organization.</td
				>
			</tr>
			<tr class="border text-sm">
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24">Start Date</td>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24"
					>{formatDate(data.basicStatistics.StartDate)}</td
				>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24"
					>Start date of the analysis period.</td
				>
			</tr>
			<tr class="border text-sm">
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24">End Date</td>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24"
					>{formatDate(data.basicStatistics.EndDate)}</td
				>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-24"
					>End date of the analysis period.</td
				>
			</tr>
		</tbody>
	</table>
</div>

<div class=" my-8">
	<p class="basic-stat text-[var(--color-info)]">Basic Statistics</p>
	<p class=" basic-des">
		This section provides an overview of the basic analytics related to the tenant, including the
		total number of users, patient statistics, and registration/deregistration history.
	</p>
</div>
<div class="mt-4 overflow-x-auto">
	<table class=" flex justify-center">
		<tbody class=" ">
			<tr class="border text-sm">
				<td class="  p-2 text-[var(--color-info)] md:px-8 xl:px-23">Total Users</td>
				<td class="  p-2 text-[var(--color-info)] md:px-8 xl:px-23"
					>{data.basicStatistics.TotalUsers}</td
				>
				<td class="  p-2 text-[var(--color-info)] md:px-8 xl:px-23"
					>Overall count of users associated with the tenant.</td
				>
			</tr>
			<tr class="border text-sm">
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-23">Total Patients</td>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-23"
					>{data.basicStatistics.TotalPatients}</td
				>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-23"
					>Total number of patients registered within the system.</td
				>
			</tr>
			<tr class="border text-sm">
				<td class="  p-2 text-[var(--color-info)] md:px-8 xl:px-23">Total Active Patients</td>
				<td class=" p-2 text-[var(--color-info)] md:px-8 xl:px-23"
					>{data.basicStatistics.TotalActivePatients}</td
				>
				<td class="  p-2 text-[var(--color-info)] md:px-8 xl:px-23"
					>Total number of active (Not-deleted) patients.</td
				>
			</tr>
		</tbody>
	</table>
</div>

<div class=" my-8">
	<p class="history-head text-[var(--color-info)]">Registration / Deregistration History</p>
	<p class=" history-para text-[var(--color-info)]">
		Trends of how many users registered or deregistered from the system on a given day, in a given
		week or a month.
	</p>
</div>
<div class=" patient-history-container">
	<div class="grid-layout gap-8">
		<div class="centered-flex gap-10">
			<div class=" centered-flex overflow-x-auto shadow-xl sm:px-4 xl:mx-28">
				<div class="w-full">
					<div class="centered-flex">
						<h4 class=" users-head">Patient Registration / Deregistration History</h4>
					</div>
					{#if patientRegistrationHistoryData}
						<div class="h-96">
							<JointBarGraph
								firstDataSource={result.registrationData}
								secondDataSource={result.deregistrationData}
								labels={result.labels}
								title="Patient Registration / Deregistration History"
							/>
						</div>
					{:else}
						<div class="h-[400px] w-full p-4">
							<p class=" history-title">Patient Registration / Deregistration History</p>
							<p class="not-available">Data Not Available</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<!-- Wrapper to align both charts in a row on xl screens -->
	<div class="my-10 flex flex-col xl:mx-28 xl:flex-row xl:gap-6">
		<!-- User Distribution By Roles -->
		<div class="mx-auto w-86 border shadow-xl sm:px-4 md:w-3/3 xl:w-1/2">
			<div class="centered-flex flex-col">
				<h4 class="users-head text-[var(--color-info)]">User Distribution By Roles</h4>
				{#if usersDistributionByRoleData}
					<div>
						<PieChart
							data={usersDistributionByRoleData}
							labels={usersDistributionByRoleLabels}
							title=""
							showLegendData={true}
						/>
					</div>
				{:else}
					<div class="h-[400px] w-full p-4">
						<p class="not-available text-[var(--color-info)]">Data Not Available</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Active Users For Month -->
		<div class="mx-auto mt-10 w-86 border shadow-xl sm:px-4 md:w-3/3 xl:mt-0 xl:w-1/2">
			<div class="centered-flex">
				<h4 class="users-head text-[var(--color-info)]">Active Users For Month</h4>
			</div>
			{#if patientDeRegistrationHistoryData}
				<div class="h-96">
					<Line
						data={activeUsersCountAtEndOfMonthData}
						lables={activeUsersCountAtEndOfMonthLabels}
						title="Patient Deregistration History"
					/>
				</div>
			{:else}
				<div class="h-[400px] w-full p-4">
					<p class="not-available">Data Not Available</p>
				</div>
			{/if}
		</div>
	</div>
</div>
