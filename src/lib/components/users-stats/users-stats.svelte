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
	// const deviceDetailData = [
	// 	{
	// 		usersDetail: 'Android Users',
	// 		count: androidUsers.Count,
	// 		ratio: `${Math.ceil(androidUsers.Ratio)}`
	// 	},
	// 	{
	// 		usersDetail: 'IOS Users',
	// 		count: iOSUsers.Count,
	// 		ratio: `${Math.ceil(iOSUsers.Ratio)}`
	// 	},
	// 	{
	// 		usersDetail: 'Missing Device Detail Users',
	// 		count: missingDeviceDetails.Count,
	// 		ratio: `${Math.ceil(missingDeviceDetails.Ratio)}`
	// 	}
	// ];

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
	// let maritalStatusDistributionLabels = $state();
	// let maritalStatusDistributionData = $state();

	// $effect(() => {
	// 	if (maritalStatusWiseUsers) {
	// 		maritalStatusDistributionLabels = false;
	// 		maritalStatusDistributionData = false;

	// 		tick().then(() => {
	// 			maritalStatusDistributionLabels = maritalStatusWiseUsers.map(
	// 				(x: { MaritalStatus: any }) => x.MaritalStatus
	// 			);
	// 			maritalStatusDistributionData = maritalStatusWiseUsers.map((x: { Count: any }) => x.Count);
	// 		});
	// 	}
	// });

	// $: if (countryWiseUsers) {
	// 	cuntryDistributionLabels = false;
	// 	cuntryDistributionData = false;

	// 	tick().then(() => {
	// 	cuntryDistributionLabels = countryWiseUsers.map((x) => x.Country);
	// 	cuntryDistributionData = countryWiseUsers.map((x) => x.Ratio);
	// 	});
	// }

	// let majorAilmentDistributionData = $state();
	// let majorAilmentDistributionLabels = $state();

	// $derived: if (majorAilment) {
	// 	majorAilmentDistributionData = false;
	// 	majorAilmentDistributionLabels = false;

	// 	tick().then(() => {
	// 		majorAilmentDistributionData = majorAilment.map((x: { Count: any }) => x.Count);
	// 		majorAilmentDistributionLabels = majorAilment.map(
	// 			(x: { MajorAilment: any }) => x.MajorAilment
	// 		);
	// 	});
	// }

	// let addictionDistributionData = $state();
	// let addictionDistributionLabels = $state();

	// $derived: if (addictionDistribution) {
	// 	addictionDistributionData = false;
	// 	addictionDistributionLabels = false;

	// 	tick().then(() => {
	// 		addictionDistributionData = addictionDistribution.map((x: { Count: any }) => x.Count);
	// 		addictionDistributionLabels = addictionDistribution.map((x: { Status: any }) => x.Status);
	// 	});
	// }

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

<!-- <BreadCrumbs crumbs={breadCrumbs} /> -->

<div class=" users-stat-container">
	<div class="stats-container grid-cols-1">
		<!-- User -->
		<table class=" user-table">
			<thead>
				<tr>
					<th scope="col" class=" stats-heading text-[var(--color-info)]">Users</th>
					<th scope="col" class=" px-2 text-left text-base text-[var(--color-info)] lg:text-lg"
						>Count</th
					>
					<th scope="col" class=" px-2 text-left text-base text-[var(--color-info)] lg:text-lg"
						>Percentage</th
					>
				</tr>
			</thead>
			<tbody>
				<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
					<td class="text-custom w-[10%]">Onboarded Users</td>
					<td class="text-custom w-[10%]">{usersCount.TotalUsers.Count}</td>
					<td class="text-custom w-[15%]">-</td>
				</tr>
				{#each usersData as data}
					<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
						<td class="text-custom w-[10%]">{data.usersDetail}</td>
						<td class="text-custom w-[10%]">{data.count}</td>
						<td class="text-custom flex items-center">
							<div class="progress-bar">
								<div class="progress" style="width:{data.ratio}%"></div>
							</div>
							<span class="text-primary-500 dark:text-primary-100 stats-span">{data.ratio}</span>
							<span class="text-primary-500 dark:text-primary-100 text-xs">%</span>
						</td>
					</tr>
				{/each}
				{#each deviceDetailWiseUsers as data}
					<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
						<td class="text-custom w-[10%]">{data.OSType}</td>
						<td class="text-custom w-[10%]">{data.Count}</td>
						<td class="text-custom flex w-[15%] items-center">
							<div class="bg-primary-200 mr-2 h-2 w-1/4 rounded-full">
								<div
									class="bg-primary-500 h-2 rounded-full"
									style="width:{Math.ceil((data.Count / usersCount.TotalUsers.Count) * 100).toFixed(
										2
									)}%"
								></div>
							</div>
							<span class="text-primary-500 dark:text-primary-100">
								{Math.ceil((data.Count / usersCount.TotalUsers.Count) * 100).toFixed(0)}
							</span>
							<span class="text-primary-500 dark:text-primary-100 text-xs">%</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="stats-container grid-cols-3">
		<div class="col-span-3 md:col-span-2">
			<!-- age -->
			<table class="min-w-full">
				<thead>
					<tr>
						<th scope="col" class=" stats-heading text-[var(--color-info)]">Age</th>
					</tr>
				</thead>
				<tbody>
					{#each ageWiseUsers as data}
						<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
							<td class=" text-custom w-[48%] md:w-[20%]">{data.Status}</td>
							<td class=" text-custom w-[18%] md:w-[20%]">{data.Count}</td>
							<td class=" text-custom flex w-[50%] items-center">
								<div class="progress-bar">
									<div class="progress" style="width:{data.Ratio}%"></div>
								</div>
								<span class="text-primary-500 dark:text-primary-100">{data.Ratio}</span>
								<span class="text-primary-500 dark:text-primary-100 text-xs">%</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div>
			<select name="year" class="select select-year" onchange={handlelSelectYearForAge}>
				<option selected disabled>All the years</option>
				{#each years as year}
					<option value={year.year}>{year.year}</option>
				{/each}
			</select>
			{#if ageDistributionData}
				<div class=" piechart">
					<PieChart labels={ageDistributionLabels} data={ageDistributionData} title="Age" />
				</div>
			{/if}
		</div>
	</div>

	<div class="stats-container grid-cols-3">
		<div class="col-span-3 md:col-span-2">
			<!-- gender -->
			<table class="min-w-full">
				<thead>
					<tr>
						<th scope="col" class=" stats-heading text-[var(--color-info)]">Gender</th>
					</tr>
				</thead>
				<tbody>
					{#each genderWiseUsers as data}
						<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
							<td class=" text-custom w-[48%] md:w-[25%] lg:w-[22%] xl:w-[20%]">{data.Gender}</td>
							<td class=" text-custom w-[18%] md:w-[20%]">{data.Count}</td>
							<td class=" text-custom flex w-[50%] items-center">
								<div class="progress-bar">
									<div class="progress" style="width:{data.Ratio}%"></div>
								</div>
								<span class="text-primary-500 dark:text-primary-100">{data.Ratio}</span>
								<span class="text-primary-500 dark:text-primary-100 text-xs">%</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div>
			<select name="year" class="select select-year" onchange={handlelSelectYearForGender}>
				<option selected disabled>All the years</option>
				{#each years as year}
					<option value={year.year}>{year.year}</option>
				{/each}
			</select>
			{#if genderDistributionData}
				<div class="piechart">
					<PieChart
						labels={genderDistributionLabels}
						data={genderDistributionData}
						title="Gender"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- <div
			class="grid grid-cols-3 overflow-x-auto justify-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-full h-full gap-3 "
		>
			<div class="px-4 sm:px-6 lg:px-8 col-span-2">
				<div class="flow-root">
					<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<table class="min-w-full">
								<thead>
									<tr>
										<th
											scope="col"
											class="py-3 pl-4 pr-3 text-left text-lg font-semibold text-primary-500 dark:text-primary-100 sm:pl-3"
											>Country</th
										>
									</tr>
								</thead>
								<tbody> -->
<!-- {#each countryWiseUsers as data}
										<tr class="hover:bg-secondary-50 dark:hover:bg-surface-800 transition">
											<td
												style="width:10%;"
												class="whitespace-nowrap py-2 pl-4 pr-3 text-primary-500 dark:text-primary-100 text-sm  sm:pl-3"
												>{data.Country}</td
											>
											<td
												style="width:10%;"
												class="whitespace-nowrap text-sm px-3 py-2 text-primary-500 dark:text-primary-100"
												>{data.Count}</td
											>
											<td
												style="width:15%;"
												class="whitespace-nowrap px-3 py-2 text-sm text-primary-500 dark:text-primary-100"
											>
												<div class="flex items-center">
													<div class="h-2 w-1/4 rounded-full bg-primary-200 mr-2">
														<div
															class="h-2 rounded-full bg-primary-500"
															style="width:{data.Ratio}%"
														/>
													</div>
													<span class="text-primary-500 dark:text-primary-100 ">{data.Ratio}</span>
													<span class="text-primary-500 dark:text-primary-100 text-xs">%</span>
												</div>
											</td>
										</tr>
									{/each} -->
<!-- </tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<div>
				<select
					name="year"
					id=""
					class="select w-2/3 mt-3 "
					on:change={handlelSelectYearForCountry}
				>
					<option selected disabled>All the years</option>
					{#each years as year }
					<option value= {year.year}>{year.year}</option>
					{/each}
				</select>
				<div class="w-64 h-64">
					{#if cuntryDistributionData}
						<PieChart
							labels={cuntryDistributionLabels}
							data={cuntryDistributionData}
							title="Country"
						/>
					{/if}
				</div>
			</div>
		</div>-->

<!-- <div class="flex justify-center items-center h-full gap-10 w-full">
		<div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
			<div class="w-full">
				<div class="flex items-center">
					<h4 class="mr-4 w-2/3 text-left justify-center py-3 ml-4 text-lg font-semibold text-primary-500 dark:text-primary-100 sm:pl-3">Marital Status</h4>
					<select name="year" id="" class="select w-1/3 mt-3" on:change={handlelSelectYearForMaritalStatus}>
						<option selected>All the years</option>
							{#each years as year }
								<option value= {year.year}>{year.year}</option>
							{/each}
					</select>
				</div>

				{#if maritalStatusDistributionData}
				<div class="h-96">
					<BarChart
						dataSource={maritalStatusDistributionData}
						labels={maritalStatusDistributionLabels}
						title="Marital Status"
					/>
			 </div>
				{/if}
			</div>
		</div>
		<div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
		<div class="w-full">
			<div class="flex items-center">
				<h4 class="mr-4 w-2/3 text-left justify-center py-3 ml-4 text-lg font-semibold text-primary-500 dark:text-primary-100 sm:pl-3">Major Ailments</h4>
				<select name="year" id="" class="select w-1/3 mt-3" on:change={handlelSelectYearForMajorAilments}>
					<option selected>All the years</option>
						{#each years as year }
							<option value= {year.year}>{year.year}</option>
						{/each}
				</select>
			</div>

			{#if majorAilmentDistributionData}
				<div class="h-96">
					<BarChart
						dataSource={majorAilmentDistributionData}
						labels={majorAilmentDistributionLabels}
						title="Major Ailments"
					/>
				</div>
			{/if}
		</div>
		</div>
	</div> -->

<!-- <div class="flex justify-start items-center h-96 gap-10 w-full mt-10"> -->
<!-- <div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
			<div class="w-full">
				<div class="flex items-center">
					<h4 class="mr-4 w-2/3 text-left justify-center py-3 ml-4 text-lg font-semibold text-primary-500 dark:text-primary-100 sm:pl-3">Obesity</h4>
					<select name="year" id="" class="select w-1/3 mt-3" on:change={handlelSelectYearForObesity}>
						<option selected>All the years</option>
							{#each years as year }
								<option value= {year.year}>{year.year}</option>
							{/each}
					</select>
				</div>

				{#if obesityDistributionData}
					<div class="h-96">
						<BarChart
							dataSource={obesityDistributionData}
							labels={obesityDistributionLabels}
							title="Obesity"
						/>
					</div>
				{/if}
			</div>
		</div> -->
<!-- <div
			class="flex overflow-x-auto justify-center items-center rounded-lg shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		> -->
<!-- <div class="h-96 w-full">
				<BarChart
					dataSource={addictionDistributionData}
					labels={addictionDistributionLabels}
					title="Addiction"
				/>
			</div> -->
<!-- <div class="w-full">
				<div class="flex items-center">
					<h4 class="mr-4 w-2/3 text-left justify-center py-3 ml-4 text-lg font-semibold text-primary-500 dark:text-primary-100 sm:pl-3">Addiction</h4>
					<select name="year" id="" class="select w-1/3 mt-3" on:change={handlelSelectYearForAddiction}>
						<option selected>All the years</option>
							{#each years as year }
								<option value= {year.year}>{year.year}</option>
							{/each}
					</select>
				</div>

				{#if addictionDistributionData}
					<div class="h-96">
						<BarChart
							dataSource={addictionDistributionData}
							labels={addictionDistributionLabels}
							title="Addiction"
						/>
					</div>
				{/if}
			</div> -->
<!-- </div> -->
<!-- </div> -->

<!-- <div class="flex justify-center items-center h-96 gap-10 w-full mt-10">
		<div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
			<div class="h-96 w-full ">
				<HorizontalBarChart
					dataSource={healthPillarDistributionData}
					labels={healthPillarDistributionLabels}
					title="Health Pillar Utilization (Total)"
				/>
			</div>
		</div>
		<div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
			<div class="h-96 w-full">
				<HealthPillarChart {healthPillarDistributionMonthly} />
			</div>
		</div>
	</div> -->
<!--
	<div class="flex justify-center items-center h-96 gap-10 w-full mt-10">
		<div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
			<div class="h-96 w-full ">
				<HorizontalBarChart
					dataSource={biometricsDistributionData}
					labels={biometricsDistributionLabels}
					title="Biometrics (Total)"
				/>
			</div>
		</div>
		<div
			class="flex overflow-x-auto justify-center items-center rounded-lg  shadow-xl border border-secondary-100 dark:border-surface-700 sm:px-4 w-1/2"
		>
			<div class="h-96 w-full">
				<BiometricsChart {biometricsDistributionMonthly} />
			</div>
		</div>
	</div> -->
