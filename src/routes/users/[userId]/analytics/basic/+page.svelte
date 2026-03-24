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
	import { hasChartData } from '$lib/utils/chart.utils';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';

	let { data }: { data: PageServerData } = $props();

	// Derived chart data - reactive to tenant changes
	let dereg = $derived(processPatientDeregistrationHistory(
		data.basicStatistics?.PatientDeregistrationHistory ?? []
	));

	let patientRegistrationHistoryData: any = $derived(
		data.basicStatistics?.PatientRegistrationHistory?.map((x: { user_count: any }) => x.user_count) ?? []
	);
	let patientRegistrationHistoryLabels: any = $derived(
		data.basicStatistics?.PatientRegistrationHistory?.map((x: { month: string }) => {
			const label = formatLabelOfMonth(x.month);
			return label ? label : 'Unknown';
		}) ?? []
	);
	let patientDeRegistrationHistoryData: any = $derived(
		data.basicStatistics?.PatientDeregistrationHistory?.map((x: { user_count: any }) => x.user_count) ?? []
	);
	let usersDistributionByRoleData: any = $derived(
		data.basicStatistics?.UsersDistributionByRole?.map((x: { registration_count: any }) => x.registration_count) ?? []
	);
	let usersDistributionByRoleLabels: any = $derived(
		data.basicStatistics?.UsersDistributionByRole?.map((x: { role_name: any }) => x.role_name) ?? []
	);
	let activeUsersCountAtEndOfMonthData: any = $derived(
		data.basicStatistics?.ActiveUsersCountAtEndOfMonth?.map((x: { active_user_count: any }) => x.active_user_count) ?? []
	);
	let activeUsersCountAtEndOfMonthLabels: any = $derived(
		data.basicStatistics?.ActiveUsersCountAtEndOfMonth?.map((x: { month_end: any }) => x.month_end) ?? []
	);

	let result = $derived(
		processPatientRegistrationHistory(
			data.basicStatistics?.PatientRegistrationHistory ?? [],
			data.basicStatistics?.PatientDeregistrationHistory ?? []
		)
	);

	// Mutable state vars (can be changed by year selectors) - reset on data change
	let genderWiseUsers = $state(data.genderWiseUsers ?? []);
	let ageWiseUsers = $state(data.ageWiseUsers ?? []);
	let maritalStatusWiseUsers: any = $state(data.maritalStatusWiseUsers ?? []);
	let majorAilment = $state(data.majorAilment ?? []);
	let addictionDistribution = $state(data.addictionDistribution ?? []);

	// Reset mutable state when data changes (tenant switch)
	$effect(() => {
		genderWiseUsers = data.genderWiseUsers ?? [];
		ageWiseUsers = data.ageWiseUsers ?? [];
		maritalStatusWiseUsers = data.maritalStatusWiseUsers ?? [];
		majorAilment = data.majorAilment ?? [];
		addictionDistribution = data.addictionDistribution ?? [];
	});

	// Derived read-only values
	let usersCount = $derived(data.overallUsersData);
	let deviceDetailWiseUsers = $derived(data.deviceDetailWiseUsers ?? []);
	let years = $derived(data.years ?? []);
	let showLegendData = true;

	let selectedYear: any;

	const selectAgeWiseUsersDividionYearly = (e: any) => {

		selectedYear = e.currentTarget.value;
		const yearWiseAgeDetails = data.yearWiseAgeDetails ?? [];
		const ageDetail = yearWiseAgeDetails.filter((e: { Year: any }) => e.Year == selectedYear);
		if (ageDetail.length > 0) {
			ageWiseUsers = ageDetail[0].AgeDetails;
		}
	};

	const selectGenderWiseUsersDividionYearly = (e: { currentTarget: { value: any } }) => {

		selectedYear = e.currentTarget.value;
		const yearWiseGenderDetails = data.yearWiseGenderDetails ?? [];
		const genderDetail = yearWiseGenderDetails.filter((e: { Year: any }) => e.Year == selectedYear);
		if (genderDetail.length > 0) {
			genderWiseUsers = genderDetail[0].GenderDetails;
		}
	};

	const selectMaritalSatusDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		const yearWiseMaritalDetails = data.yearWiseMaritalDetails ?? [];
		const maritalDetail = yearWiseMaritalDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (maritalDetail.length > 0) {
			maritalStatusWiseUsers = maritalDetail[0].MaritalDetails;
		}
	};

	const selectMajorAilmentDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		const yearWiseMajorAilmentDistributionDetails = data.yearWiseMajorAilmentDistributionDetails ?? [];
		const majorAilmentDistributionDetail = yearWiseMajorAilmentDistributionDetails.filter(
			(e: { Year: any }) => e.Year == selectedYear
		);
		if (majorAilmentDistributionDetail.length > 0) {
			majorAilment = majorAilmentDistributionDetail[0].AilmentDetails;
		}
	};

	const selectAddictionDistributionYearly = (e: { currentTarget: { value: any } }) => {
		selectedYear = e.currentTarget.value;
		const yearWiseAddictionDistributionDetails = data.yearWiseAddictionDistributionDetails ?? [];
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
		data.userCountStats?.TotalUsers?.Count ?? 0,
		data.userCountStats?.NotDeletedUsers?.Count ?? 0,
		data.userCountStats?.UsersWithActiveSession?.Count ?? 0
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
					{data.tenantCode}
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
					{formatDate(data.basicStatistics?.StartDate)}
				</td>
				<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Start date of the analysis period.
				</td>
			</tr>
			<tr>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">End Date</td>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					{formatDate(data.basicStatistics?.EndDate)}
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
					{data.basicStatistics?.TotalUsers ?? 0}
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
					{data.basicStatistics?.TotalPatients ?? 0}
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
					{data.basicStatistics?.TotalActivePatients ?? 0}
				</td>
				<td class=" border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
					Total number of active (Not-deleted) patients.
				</td>
			</tr>
		</tbody>
	</table>
</div>

<!-- <UsersStats
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
/> -->

<!-- <FunnelCard
	{labels}
	dataSource={funnelChartData}
	{genderWiseUsers}
	{selectGenderWiseUsersDividionYearly}
/> -->

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
			<div class=" centered-flex overflow-x-auto border shadow-lg border-[var(--color-outline)] sm:px-4">
				<div class="w-full">
					<div class="centered-flex">
						<h4 class=" users-head">Patient Registration / Deregistration History</h4>
					</div>
					{#if hasChartData(patientRegistrationHistoryData)}
						<div class="h-96 p-2">
							<JointBarGraph
								firstDataSource={result.registrationData}
								secondDataSource={result.deregistrationData}
								labels={result.labels}
								title="Patient Registration / Deregistration History"
							/>
						</div>
					{:else}
						<EmptyState />
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="xl:flex xl:gap-8">
		<!-- User Distribution By Roles Card -->
		<div class="xl:w-1/2">
			<h4 class="basic-stat mt-6 mb-3">User Distribution By Roles</h4>
			{#if hasChartData(usersDistributionByRoleData)}
				<div class="border shadow-lg border-[var(--color-outline)]">
					<PieChart
						data={usersDistributionByRoleData}
						labels={usersDistributionByRoleLabels}
						title=""
						showLegendData={showLegendData}
					/>
				</div>
			{:else}
				<EmptyState />
			{/if}
		</div>

		<!-- Active Users For Month Card -->
		<div class="xl:w-1/2">
			<h4 class="basic-stat mt-6 mb-3">Active Users For Month</h4>
			{#if hasChartData(activeUsersCountAtEndOfMonthData)}
				<div>
					<Line
						data={activeUsersCountAtEndOfMonthData}
						lables={activeUsersCountAtEndOfMonthLabels}
						title="Patient Deregistration History"
					/>
				</div>
			{:else}
				<EmptyState />
			{/if}
		</div>
	</div>
</div>
