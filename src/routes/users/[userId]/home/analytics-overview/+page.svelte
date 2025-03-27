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

<div class="flex flex-col justify-center">
	<div class="grid-layout gap-8 py-8">
		<div class="grid-layout h-full w-full overflow-x-auto px-4 py-4 sm:px-4">
			<div class="px-4 sm:px-6 lg:px-8">
				<div class="flow-root">
					<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full overflow-x-auto align-middle sm:px-6 lg:px-8">
							<table class="min-w-full">
								<tbody class="text">
									<tr class="border transition">
										<td style="width:10%;" class="row-content sm:pl-3">Tenant Name</td>
										<td style="width:10%;" class="row-content">{'American Heart Association'}</td>
										<td style="width:15%;" class="row-content">
											Name of the tenant/organization.
										</td>
									</tr>
									<tr class="border transition">
										<td style="width:10%;" class="row-content sm:pl-3">Start Date</td>
										<td style="width:10%;" class="row-content">
											{formatDate(data.basicStatistics.StartDate)}</td
										>
										<td style="width:15%;" class="row-content"
											>Start date of the analysis period.
										</td>
									</tr>
									<tr class="border transition">
										<td style="width:10%;" class="row-content sm:pl-3">End Date</td>
										<td style="width:10%;" class="row-content">
											{formatDate(data.basicStatistics.EndDate)}</td
										>
										<td style="width:15%;" class="row-content"
											>End date of the analysis period.
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="text grid-layout h-full w-full overflow-x-auto px-4 py-4 sm:px-4">
			<div class="px-5 py-2">
				<p class="py-2 text-left text-lg font-bold sm:pl-3">Basic Statistics</p>
				<p class="py-2 text-left text-sm sm:pl-3">
					This section provides an overview of the basic analytics related to the tenant, including
					the total number of users, patient statistics, and registration/deregistration history.
				</p>
			</div>
			<div class="px-4 py-2 sm:px-6 lg:px-8">
				<div class="flow-root">
					<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div
							class="inline-block w-full min-w-full overflow-x-auto align-middle sm:px-6 lg:px-8"
						>
							<table class="min-w-full">
								<tbody class="">
									<tr class="border transition">
										<td style="width:10%;" class="row-content sm:pl-3">Total Users </td>
										<td style="width:10%;" class="row-content">
											{data.basicStatistics.TotalUsers}</td
										>

										<td style="width:15%;" class="row-content"
											>Overall count of users associated with the tenant.
										</td>
									</tr>
									<tr class="border">
										<td style="width:10%;" class="row-content sm:pl-3">Total Patients</td>
										<td style="width:10%;" class="row-content"
											>{data.basicStatistics.TotalPatients}</td
										>
										<td style="width:15%;" class="row-content"
											>Total number of patients registered within the system.
										</td>
									</tr>
									<tr class="border transition">
										<td style="width:10%;" class="row-content sm:pl-3">Total Active Patients</td>
										<td style="width:10%;" class="row-content"
											>{data.basicStatistics.TotalActivePatients}</td
										>
										<td style="width:15%;" class="row-content"
											>Total number of active (Not-deleted) patients
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="text grid-layout w-full overflow-x-auto px-4 pt-4 sm:px-4">
	<div class="px-5 py-2">
		<p class="py-2 pl-4 text-left text-lg font-bold sm:pl-3">
			Registration / Deregistration History
		</p>
		<p class="py-2 pl-4 text-left text-sm sm:pl-3">
			Trends of how many users registered or deregistered from the system on a given day, in a given
			week or a month.
		</p>
	</div>
</div>
<div class="text flex flex-col justify-center">
	<div class="grid-layout gap-8">
		<div class="centered-flex gap-10">
			<div class=" centered-flex overflow-x-auto shadow-xl sm:px-4">
				<div class="w-full">
					<div class="centered-flex">
						<h4 class="mr-4 ml-4 justify-center py-3 text-center text-lg font-semibold sm:pl-3">
							Patient Registration / Deregistration History
						</h4>
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
							<p class="flex items-center justify-center text-2xl">
								Patient Registration / Deregistration History
							</p>
							<p class="mt-28 flex items-center justify-center text-xl leading-3">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="centered-flex my-10 flex-col gap-10 md:flex-row">
		<div class="centered-flex !w-1/2 shadow-xl sm:px-4">
			<div class="w-full">
				<div class="centered-flex flex-col">
					<h4 class="mr-4 ml-4 justify-center py-3 text-center text-lg font-semibold sm:pl-3">
						User Distribution By Roles
					</h4>
					{#if usersDistributionByRoleData}
						<div class="">
							<PieChart
								data={usersDistributionByRoleData}
								labels={usersDistributionByRoleLabels}
								title=""
								showLegendData={true}
							/>
						</div>
					{:else}
						<div class="h-[400px] w-full p-4">
							<!-- <p class="justify-center items-center flex text-2xl">User Distribution By Roles</p> -->
							<p class="mt-28 flex items-center justify-center text-base leading-3 font-semibold">
								Data Not Available
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div
			class="flex min-h-full w-1/2 items-center justify-center overflow-x-auto shadow-xl sm:px-4"
		>
			<div class="w-full">
				<div class="centered-flex">
					<h4 class="mr-4 ml-4 justify-center py-3 text-left text-lg font-semibold sm:pl-3">
						Active Users For Month
					</h4>
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
						<!-- <p class="justify-center items-center flex text-2xl">Active Users At End Of The Month</p> -->
						<p class="mt-28 flex items-center justify-center text-xl leading-3">
							Data Not Available
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
