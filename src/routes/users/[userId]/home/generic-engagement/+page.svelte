<script lang="ts">
	import GenericChart from './GenericChart.svelte';
	import { onMount } from 'svelte';
	import {
		formatMonth,
		formatMonthLabel,
		formatDateToDDMMYYYY
	} from '../analytics-overview/components/functions';

	////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	let dailyActiveUsersData: any,
		dailyActiveUsersLabels: any = $state();
	let monthlyActiveUsersData: any, monthlyActiveUsersLabels: any;
	let weeklyActiveUsersData: any, weeklyActiveUsersLabels: any;
	let retentionOnDaysData, retentionOnDaysLabels, retentionOnDaysRate;
	let retentionOnIntervalData, retentionOnIntervalLabels, retentionOnIntervalRate;

	if (data.genericMetrics) {
		if (data.genericMetrics.DailyActiveUsers) {
			dailyActiveUsersData = data.genericMetrics.DailyActiveUsers.map(
				(x: { daily_active_users: any }) => x.daily_active_users
			);
			dailyActiveUsersLabels = data.genericMetrics.DailyActiveUsers.map(
				(x: { activity_date: string | number | Date }) => formatDateToDDMMYYYY(x.activity_date)
			);
		}

		if (data.genericMetrics.WeeklyActiveUsers) {
			weeklyActiveUsersData = data.genericMetrics.WeeklyActiveUsers.map(
				(x: { weekly_active_users: any }) => x.weekly_active_users
			);
			weeklyActiveUsersLabels = data.genericMetrics.WeeklyActiveUsers.map(
				(x: { week_start_date: string | number | Date }) =>
					`${formatDateToDDMMYYYY(x.week_start_date)}`
			);
		}
		if (data.genericMetrics.MonthlyActiveUsers) {
			monthlyActiveUsersData = data.genericMetrics.MonthlyActiveUsers.map(
				(x: { monthly_active_users: any }) => x.monthly_active_users
			);
			monthlyActiveUsersLabels = data.genericMetrics.MonthlyActiveUsers.map(
				(x: { activity_month: string }) => formatMonth(x.activity_month)
			);
		}

		if (data.genericMetrics.RetentionRateOnSpecificDays.retention_on_specific_days) {
			retentionOnDaysData =
				data.genericMetrics.RetentionRateOnSpecificDays.retention_on_specific_days.map(
					(x: { returning_users: any }) => x.returning_users
				);
			retentionOnDaysLabels =
				data.genericMetrics.RetentionRateOnSpecificDays.retention_on_specific_days.map(
					(x: { day: any }) => `${x.day}`
				);
			retentionOnDaysRate =
				data.genericMetrics.RetentionRateOnSpecificDays.retention_on_specific_days.map(
					(x: { retention_rate: any }) => x.retention_rate
				);
		}

		if (data.genericMetrics.RetentionRateInSpecificIntervals.retention_in_specific_interval) {
			retentionOnIntervalData =
				data.genericMetrics.RetentionRateInSpecificIntervals.retention_in_specific_interval.map(
					(x: { returning_users: any }) => x.returning_users
				);
			retentionOnIntervalLabels =
				data.genericMetrics.RetentionRateInSpecificIntervals.retention_in_specific_interval.map(
					(x: { interval: any }) => x.interval
				);
			retentionOnIntervalRate =
				data.genericMetrics.RetentionRateInSpecificIntervals.retention_in_specific_interval.map(
					(x: { retention_rate: any }) => x.retention_rate
				);
		}
	}

	const mostFiredEvents = data.genericMetrics.MostFiredEvents;
	const mostFiredEventsByEventCategory = data.genericMetrics.MostFiredEventsByEventCategory;

	let selectedGraph = $state('daily');

	let processedData: {
		month: string;
		mostUsedFeature: string;
		usageCount: unknown;
		totalUsage: any;
		percentage: string;
		year: string; // Extract the year
	}[] = $state([]);
	let filteredData: any = $state();
	let years: any = $state();
	let selectedYear: any = $state();
	const tableHeaders = ['Month', 'Most Used Feature', 'Usage Count', 'Total Usage', 'Percentage'];

	onMount(() => {
		// Process the data
		let monthlyData: any = {};
		data.genericMetrics.MostCommonlyVisitedFeatures.forEach((item: any) => {
			if (!monthlyData[item.month]) {
				monthlyData[item.month] = { totalUsage: 0, features: {} };
			}
			monthlyData[item.month].totalUsage += item.feature_usage_count;
			monthlyData[item.month].features[item.feature] = item.feature_usage_count;
		});

		processedData = Object.entries(monthlyData).map(([month, data]: any) => {
			let mostUsedFeature: any = Object.entries(data.features).reduce((a: any, b: any) =>
				b[1] > a[1] ? b : a
			);
			return {
				month,
				mostUsedFeature: mostUsedFeature[0],
				usageCount: mostUsedFeature[1],
				totalUsage: data.totalUsage,
				percentage: ((mostUsedFeature[1] / data.totalUsage) * 100).toFixed(2) + '%',
				year: month.split('-')[0] // Extract the year
			};
		});

		processedData.sort((a: any, b: any) => new Date(a.month) - new Date(b.month));

		years = [...new Set(processedData.map((data) => data.year))];

		selectedYear = years[0];

		console.log('years ==>', years, selectedYear);
	});

	$effect(() => {
		filteredData = processedData.filter((item) => item.year === selectedYear);
	});
</script>

<div class=" flex flex-col justify-center">
	<div class="grid-layout py-8">
		<div class="centered-flex h-full gap-10">
			<div class=" centered-flex overflow-x-auto rounded-lg border shadow-xl sm:px-4">
				<div class="w-full">
					<div class="text flex flex-col items-center">
						<h4 class="table-heading mr-4 ml-4 justify-center !text-lg">
							{selectedGraph === 'daily'
								? 'Daily Active Users'
								: selectedGraph === 'weekly'
									? 'Weekly Active Users'
									: 'Monthly Active Users'}
						</h4>
						<p class="mr-4 ml-4 justify-center pb-1 text-left text-sm sm:pl-3">
							{selectedGraph === 'daily'
								? 'Total number of unique users who interact with the platform on a given day.'
								: selectedGraph === 'weekly'
									? 'Total number of unique users who interact with the platform during a week.'
									: 'Total number of unique users who interact with the platform during a month.'}
						</p>
					</div>
					<div class="flex w-full justify-end">
						<select
							class="select mb-4 w-fit border px-10"
							onchange={(e: any) => {
								selectedGraph = e.target.value;
							}}
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
						</select>
					</div>
					{#if selectedGraph === 'daily' && dailyActiveUsersData.length > 0}
						<GenericChart
							type="bar"
							data={dailyActiveUsersData}
							labels={dailyActiveUsersLabels}
							title="Daily Active Users"
						/>
					{:else if selectedGraph === 'daily'}
						<div class="h-[400px] w-[400px] p-4">
							<p class="justify-left flex items-center text-2xl"></p>
							<p class="centered-flex mt-28 text-xl leading-3">Data Not Available</p>
						</div>
					{/if}
					{#if selectedGraph === 'weekly' && weeklyActiveUsersData.length > 0}
						<GenericChart
							type="bar"
							data={weeklyActiveUsersData}
							labels={weeklyActiveUsersLabels}
							title="Weekly Active Users"
						/>
					{:else if selectedGraph === 'weekly'}
						<div class="h-[400px] w-[400px] p-4">
							<p class="justify-left flex items-center text-2xl"></p>
							<p class="centered-flex mt-28 text-xl leading-3">Data Not Available</p>
						</div>
					{/if}
					{#if selectedGraph === 'monthly' && monthlyActiveUsersData.length > 0}
						<GenericChart
							type="bar"
							data={monthlyActiveUsersData}
							labels={monthlyActiveUsersLabels}
							title="Monthly Active Users"
						/>
					{:else if selectedGraph === 'monthly'}
						<div class="h-[400px] w-[400px] p-4">
							<p class="justify-left flex items-center text-2xl"></p>
							<p class="centerd-flex mt-28 flex text-xl leading-3">Data Not Available</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<div class="centered-flex !min-w-full">
	<div
		class="centered-flex !min-w-full overflow-hidden overflow-x-auto rounded-lg border shadow-xl sm:px-4"
	>
		<div class="text w-full">
			<div class="relative flex flex-col items-center">
				<h4 class="mt-3 table-heading !text-lg">
					Commonly Visited Features
				</h4>
				<div class="absolute top-3 right-4 mt-8 flex items-center">
					<label for="year-select" class="mr-2">Year: </label>
					<select id="year-select" bind:value={selectedYear} class="select rounded border">
						{#each years as year}
							<option value={year}>{year}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="col-span-2 my-5 items-center justify-center px-2 sm:px-6 lg:px-8">
				<div class="flow-root">
					<div class="-mx-4 -my-2 mt-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<table class=" min-w-full rounded-lg border">
								<thead>
									<tr class=" border">
										{#each tableHeaders as header}
											<th class=" table-heading border">
												{header}
											</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each filteredData as row}
										<tr class="  border transition">
											<td class=" row-content border">
												{formatMonthLabel(row.month)}
											</td>
											<td class=" row-content border">
												{row.mostUsedFeature}
											</td>
											<td class=" row-content border">
												{row.usageCount}
											</td>
											<td class=" row-content border">
												{row.totalUsage}
											</td>
											<td class=" row-content border">
												{row.percentage}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="centered-flex mt-10 !min-w-full">
	<div
		class=" centered-flex !min-w-full overflow-hidden overflow-x-auto rounded-lg border shadow-xl sm:px-4"
	>
		<div class="text my-5 w-full">
			<div class="flex flex-col items-center">
				<h4 class=" mx-4 justify-center py-3 text-left text-lg font-semibold sm:pl-3">
					Most Fired Events
				</h4>
			</div>
			<div class="col-span-2 items-center justify-center px-2 sm:px-6 lg:px-8">
				<div class="flow-root">
					<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<table class="my-3 table border">
								<thead>
									<tr class="border">
										<th class="table-heading border">Event Name</th>
										<th class="table-heading">Event Count</th>
									</tr>
								</thead>
								<tbody>
									{#each mostFiredEvents as event}
										<tr class=" border transition">
											<td class=" row-content border">
												{event.EventName}
											</td>
											<td class=" row-content border">
												{event.event_count}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="centered-flex mt-10 !min-w-full">
	<div
		class=" centered-flex !min-w-full overflow-hidden overflow-x-auto rounded-lg border shadow-xl sm:px-4"
	>
		<div class="text my-5 w-full">
			<div class="flex flex-col items-center">
				<h4 class=" table-heading mx-4 justify-center !text-lg">Most Fired Events by Category</h4>
			</div>
			<div class="col-span-2 items-center justify-center px-2 sm:px-6 lg:px-8">
				<div class="flow-root">
					<div class="-mx-4 my-3 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<table class="table border">
								<thead>
									<tr class=" border">
										<th class=" table-heading border">Event Name</th>
										<th class=" table-heading border">Event Category</th>
										<th class=" table-heading border">Event Count</th>
									</tr>
								</thead>
								<tbody>
									{#each mostFiredEventsByEventCategory as event}
										<tr class=" border transition">
											<td class=" row-content border">
												{event.EventCategory}
											</td>
											<td class=" row-content border">
												{event.EventName}
											</td>
											<td class=" row-content border">
												{event.event_count}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
