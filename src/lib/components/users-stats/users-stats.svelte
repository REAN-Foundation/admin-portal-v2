<script lang="ts">
	import PieChart from './charts/pie-chart.svelte';
	import BarChart from './charts/bar-chart.svelte';
	import { tick } from 'svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let {
		years,
		genderWiseUsers,
		ageWiseUsers = $bindable(),
		maritalStatusWiseUsers,
		majorAilment,
		addictionDistribution,
		usersCount,
		deviceDetailWiseUsers,
		selectAgeWiseUsersDividionYearly,
		selectGenderWiseUsersDividionYearly,
		selectMaritalStatusDistributionYearly,
		selectMajorAilmentDistributionYearly,
		selectAddictionDistributionYearly
	} = $props();

	const usersData = [
		{
			usersDetail: 'Not Deleted Users',
			count: usersCount.NotDeletedUsers.Count,
			ratio: `${Math.ceil(usersCount.NotDeletedUsers.Ratio)}`
		},
		{
			usersDetail: 'Current Active Users',
			count: usersCount.UsersWithActiveSession.Count,
			ratio: `${Math.ceil(usersCount.UsersWithActiveSession.Ratio)}`
		},
		{
			usersDetail: 'Deleted Users',
			count: usersCount.DeletedUsers.Count,
			ratio: `${Math.ceil(usersCount.DeletedUsers.Ratio)}`
		},
		{
			usersDetail: 'Enrolled Users',
			count: usersCount.EnrolledUsers.Count,
			ratio: `${Math.ceil(usersCount.EnrolledUsers.Ratio)}`
		}
	];

	let genderDistributionLabels: any = $derived(
		genderWiseUsers.length > 0 ? genderWiseUsers.map((x: { Gender: any }) => x.Gender) : ''
	);
	let genderDistributionData: any = $derived(
		genderWiseUsers.length > 0 ? genderWiseUsers.map((x: { Ratio: any }) => x.Ratio) : ''
	);

	let ageDistributionLabels: any = $derived(
		ageWiseUsers.length > 0 ? ageWiseUsers.map((x: { Status: any }) => x.Status) : ''
	);

	let ageDistributionData: any = $derived(
		ageWiseUsers.length > 0 ? ageWiseUsers.map((x: { Ratio: any }) => x.Ratio) : false
	);

	let ageLabels;
	let ageData;

	$inspect('ageDistributionData', ageDistributionData);

	const handlelSelectYearForAge = (year: any) => {
		selectAgeWiseUsersDividionYearly({
			year: year
		});
	};

	const handlelSelectYearForGender = (year: any) => {
		console.log('year', year);

		selectGenderWiseUsersDividionYearly({
			year: year
		});
	};

	const handlelSelectYearForMaritalStatus = (year: any) => {
		selectMaritalStatusDistributionYearly({
			year: year
		});
	};

	const handlelSelectYearForMajorAilments = (year: any) => {
		selectMajorAilmentDistributionYearly({
			year: year
		});
	};

	const handlelSelectYearForAddiction = (year: any) => {
		selectAddictionDistributionYearly({
			year: year
		});
	};
</script>

<div class="my-6 flex flex-col gap-4 md:flex-row">
	<!-- Users Table -->
	<div
		class="w-full overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg lg:w-1/2"
	>
		<table class="w-full text-[var(--color-info)]">
			<thead class="bg-[var(--color-accent)]">
				<tr>
					<th
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold whitespace-nowrap md:text-base"
						>Users</th
					>
					<th
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold md:text-base"
						>Count</th
					>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm"
						>Onboarded Users</td
					>
					<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
						>{usersCount.TotalUsers.Count}</td
					>
				</tr>
				{#each usersData as data}
					<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
							>{data.usersDetail}</td
						>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
							>{data.count}</td
						>
					</tr>
				{/each}
				{#each deviceDetailWiseUsers as data}
					<tr>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
							>{data.OSType}</td
						>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
							>{data.Count}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Age Table -->
	<div
		class="w-full overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg lg:w-1/2"
	>
		<table class="w-full text-[var(--color-info)]">
			<thead class="bg-[var(--color-accent)]">
				<tr>
					<th
						class=" w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold whitespace-nowrap md:text-base"
						>Age</th
					>
					<th
						class=" w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold md:text-base"
						>Count</th
					>
				</tr>
			</thead>
			<tbody>
				{#each ageWiseUsers as data}
					<tr>
						<td
							class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm"
							>{data.Status}</td
						>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
							>{data.Count}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
