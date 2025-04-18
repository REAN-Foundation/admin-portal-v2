<script lang="ts">
	import type { PageServerData } from './$types';
	import UsersStats from '$lib/components/users-stats/users-stats.svelte';
	import JointBarGraph from '$lib/components/analytics/JointBarGraph.svelte';
	import Line from '$lib/components/analytics/Line.svelte';
	import PieChart from '$lib/components/analytics/PieChart.svelte';
	import {
		processPatientDeregistrationHistory,
		formatLabelOfMonth,
		processPatientRegistrationHistory,
		formatDate
	} from './components/functions';

	let { data }: { data: PageServerData } = $props();

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

	let genderWiseUsers = $state(data.genderWiseUsers);
	let ageWiseUsers = $state(data.ageWiseUsers);

	let maritalStatusWiseUsers: any = $state(data.maritalStatusWiseUsers);

	let usersCount = data.overallUsersData;
	let majorAilment = $state(data.majorAilment);
	let addictionDistribution = $state(data.addictionDistribution);
	let deviceDetailWiseUsers = data.deviceDetailWiseUsers;
	let years = data.years;

	let selectedYear: any;

	const selectAgeWiseUsersDividionYearly = (e: any) => {
		console.log('event', e.detail);

		selectedYear = e.currentTarget.value;
		const yearWiseAgeDetails = data.yearWiseAgeDetails;
		const ageDetail = yearWiseAgeDetails.filter((e: { Year: any }) => e.Year == selectedYear);
		if (ageDetail.length > 0) {
			ageWiseUsers = ageDetail[0].AgeDetails;
		}
	};

	const selectGenderWiseUsersDividionYearly = (e: { currentTarget: { value: any } }) => {
		console.log('e', e);

		selectedYear = e.currentTarget.value;
		const yearWiseGenderDetails = data.yearWiseGenderDetails;
		const genderDetail = yearWiseGenderDetails.filter((e: { Year: any }) => e.Year == selectedYear);
		if (genderDetail.length > 0) {
			genderWiseUsers = genderDetail[0].GenderDetails;
		}
	};

	const selectMaritalSatusDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		console.log('selected year', selectedYear);
		const yearWiseMaritalDetails = data.yearWiseMaritalDetails;
		const maritalDetail = yearWiseMaritalDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (maritalDetail.length > 0) {
			maritalStatusWiseUsers = maritalDetail[0].MaritalDetails;
		}
	};

	const selectMajorAilmentDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		console.log('selected year', selectedYear);
		const yearWiseMajorAilmentDistributionDetails = data.yearWiseMajorAilmentDistributionDetails;
		const majorAilmentDistributionDetail = yearWiseMajorAilmentDistributionDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (majorAilmentDistributionDetail.length > 0) {
			majorAilment = majorAilmentDistributionDetail[0].AilmentDetails;
		}
	};

	const selectAddictionDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		console.log('selected year', selectedYear);
		const yearWiseAddictionDistributionDetails = data.yearWiseAddictionDistributionDetails;
		const addictionDistributionDetail = yearWiseAddictionDistributionDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (addictionDistributionDetail.length > 0) {
			addictionDistribution = addictionDistributionDetail[0].AdditionDetails;
		}
	};

	import FunnelCard from '$lib/components/dashboard/funnel.card.svelte';
	let labels = ['Onboarded', 'Not Deleted ', 'Current Active'];

	const funnelChartData = $derived([
		data.userCountStats.TotalUsers.Count,
		data.userCountStats.NotDeletedUsers.Count,
		data.userCountStats.UsersWithActiveSession.Count
	]);

	$inspect(funnelChartData);
</script>

<div class="my-6 overflow-x-auto rounded-lg border border-[var(--color-outline)]">
	<table class="w-full table-fixed text-[var(--color-info)]">
		<tbody>
			<tr>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
					>Tenant Name</td
				>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					American Heart Association
				</td>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Name of the tenant
				</td>
			</tr>
			<tr>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
					>Start Date</td
				>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					{formatDate(data.basicStatistics.StartDate)}
				</td>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Start date of the analysis period.
				</td>
			</tr>
			<tr>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">End Date</td>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					{formatDate(data.basicStatistics.EndDate)}
				</td>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					End date of the analysis period.
				</td>
			</tr>
		</tbody>
	</table>
</div>

<div class=" my-6">
	<p class=" basic-stat">Basic Statistics</p>
	<p class="basic-des">
		This section provides an overview of the basic analytics related to the tenant, including the
		total number of users, patient statistics, and registration/deregistration history.
	</p>
</div>

<div class="mt-4 overflow-x-auto rounded-lg border border-[var(--color-outline)]">
	<table class="w-full table-fixed text-[var(--color-info)]">
		<tbody>
			<tr>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
					>Total Users</td
				>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					{data.basicStatistics.TotalUsers}
				</td>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Overall count of users associated with the tenant.
				</td>
			</tr>
			<tr>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
					>Total Patients</td
				>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					{data.basicStatistics.TotalPatients}
				</td>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Total number of patients registered within the system.
				</td>
			</tr>
			<tr>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Total Active Patients
				</td>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					{data.basicStatistics.TotalActivePatients}
				</td>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Total number of active (Not-deleted) patients.
				</td>
			</tr>
		</tbody>
	</table>
</div>

<UsersStats
	{years}
	bind:ageWiseUsers
	{genderWiseUsers}
	{maritalStatusWiseUsers}
	{majorAilment}
	{addictionDistribution}
	{usersCount}
	{deviceDetailWiseUsers}
	selectAgeWiseUsersDividionYearly={async (e: any) => {
		await selectAgeWiseUsersDividionYearly(e);
	}}
	{selectGenderWiseUsersDividionYearly}
	selectMaritalStatusDistributionYearly={async (e: any) => {
		selectMaritalSatusDistributionYearly(e.detail.year);
	}}
	selectMajorAilmentDistributionYearly={async (e: any) => {
		selectMajorAilmentDistributionYearly(e.detail.year);
	}}
	selectAddictionDistributionYearly={async (e: any) => {
		selectAddictionDistributionYearly(e.detail.year);
	}}
/>

<FunnelCard {labels} dataSource={funnelChartData} />

<div class=" my-6">
	<p class="history-head">Registration / Deregistration History</p>
	<p class=" history-para">
		Trends of how many users registered or deregistered from the system on a given day, in a given
		week or a month.
	</p>
</div>

<div class=" patient-history-container">
	<div class="grid-layout gap-8">
		<div class="centered-flex gap-10">
			<div class=" centered-flex overflow-x-auto shadow-xl sm:px-4">
				<div class="w-full">
					<div class="centered-flex">
						<h4 class=" users-head">Patient Registration / Deregistration History</h4>
					</div>
					{#if patientRegistrationHistoryData}
						<div class="h-96 p-2">
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
	<div class="xl:flex xl:gap-8">
		<!-- User Distribution By Roles Card -->
		<div class="xl:w-1/2">
			<h4 class="basic-stat mt-6 mb-3">User Distribution By Roles</h4>
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
				<div>
					<p>Data Not Available</p>
				</div>
			{/if}
		</div>

		<!-- Active Users For Month Card -->
		<div class="xl:w-1/2">
			<h4 class="basic-stat mt-6 mb-3">Active Users For Month</h4>
			{#if patientDeRegistrationHistoryData}
				<div>
					<Line
						data={activeUsersCountAtEndOfMonthData}
						lables={activeUsersCountAtEndOfMonthLabels}
						title="Patient Deregistration History"
					/>
				</div>
			{:else}
				<div>
					<p>Data Not Available</p>
				</div>
			{/if}
		</div>
	</div>
</div>
