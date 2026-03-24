<script lang="ts">
	import GenericChart from './GenericChart.svelte';
	import {
		formatMonth,
		formatMonthLabel,
		formatDateToDDMMYYYY
	} from '../basic/components/functions';
	import { hasChartData } from '$lib/utils/chart.utils';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	// Derived chart data - reactive to tenant changes
	let dailyActiveUsersData: any = $derived(
		data.genericMetrics?.DailyActiveUsers?.map((x: { daily_active_users: any }) => x.daily_active_users) ?? []
	);
	let dailyActiveUsersLabels: any = $derived(
		data.genericMetrics?.DailyActiveUsers?.map((x: { activity_date: string | number | Date }) => formatDateToDDMMYYYY(x.activity_date)) ?? []
	);
	let weeklyActiveUsersData: any = $derived(
		data.genericMetrics?.WeeklyActiveUsers?.map((x: { weekly_active_users: any }) => x.weekly_active_users) ?? []
	);
	let weeklyActiveUsersLabels: any = $derived(
		data.genericMetrics?.WeeklyActiveUsers?.map((x: { week_start_date: string | number | Date }) => `${formatDateToDDMMYYYY(x.week_start_date)}`) ?? []
	);
	let monthlyActiveUsersData: any = $derived(
		data.genericMetrics?.MonthlyActiveUsers?.map((x: { monthly_active_users: any }) => x.monthly_active_users) ?? []
	);
	let monthlyActiveUsersLabels: any = $derived(
		data.genericMetrics?.MonthlyActiveUsers?.map((x: { activity_month: string }) => formatMonth(x.activity_month)) ?? []
	);
	let retentionOnDaysData = $derived(
		data.genericMetrics?.RetentionRateOnSpecificDays?.retention_on_specific_days?.map((x: { returning_users: any }) => x.returning_users) ?? []
	);
	let retentionOnDaysLabels = $derived(
		data.genericMetrics?.RetentionRateOnSpecificDays?.retention_on_specific_days?.map((x: { day: any }) => `${x.day}`) ?? []
	);
	let retentionOnDaysRate = $derived(
		data.genericMetrics?.RetentionRateOnSpecificDays?.retention_on_specific_days?.map((x: { retention_rate: any }) => x.retention_rate) ?? []
	);
	let retentionOnIntervalData = $derived(
		data.genericMetrics?.RetentionRateInSpecificIntervals?.retention_in_specific_interval?.map((x: { returning_users: any }) => x.returning_users) ?? []
	);
	let retentionOnIntervalLabels = $derived(
		data.genericMetrics?.RetentionRateInSpecificIntervals?.retention_in_specific_interval?.map((x: { interval: any }) => x.interval) ?? []
	);
	let retentionOnIntervalRate = $derived(
		data.genericMetrics?.RetentionRateInSpecificIntervals?.retention_in_specific_interval?.map((x: { retention_rate: any }) => x.retention_rate) ?? []
	);

	let mostFiredEvents = $derived(data.genericMetrics?.MostFiredEvents ?? []);
	let mostFiredEventsByEventCategory = $derived(data.genericMetrics?.MostFiredEventsByEventCategory ?? []);

	let selectedGraph = $state('daily');

	const tableHeaders = ['Month', 'Most Used Feature', 'Usage Count', 'Total Usage', 'Percentage'];

	// Process most commonly visited features - reactive to data changes
	let processedData = $derived.by(() => {
		let monthlyData: any = {};
		(data.genericMetrics?.MostCommonlyVisitedFeatures ?? []).forEach((item: any) => {
			if (!monthlyData[item.month]) {
				monthlyData[item.month] = { totalUsage: 0, features: {} };
			}
			monthlyData[item.month].totalUsage += item.feature_usage_count;
			monthlyData[item.month].features[item.feature] = item.feature_usage_count;
		});

		const result = Object.entries(monthlyData).map(([month, d]: any) => {
			let mostUsedFeature: any = Object.entries(d.features).reduce((a: any, b: any) =>
				b[1] > a[1] ? b : a
			);
			return {
				month,
				mostUsedFeature: mostUsedFeature[0],
				usageCount: mostUsedFeature[1],
				totalUsage: d.totalUsage,
				percentage: ((mostUsedFeature[1] / d.totalUsage) * 100).toFixed(2) + '%',
				year: month.split('-')[0]
			};
		});

		result.sort((a: any, b: any) => new Date(a.month) - new Date(b.month));
		return result;
	});

	let years: any = $derived([...new Set(processedData.map((d) => d.year))]);
	let selectedYear: any = $state();

	// Reset selected year when data changes
	$effect(() => {
		if (years?.length > 0) {
			selectedYear = years[0];
		}
	});

	let filteredData: any = $derived(
		processedData.filter((item) => item.year === selectedYear)
	);

	// Check if any overall data exists across all sections
	const hasAnyOverallData = $derived.by(() => {
		const gm = data.genericMetrics;
		if (!gm) return false;
		if (hasChartData(gm.DailyActiveUsers)) return true;
		if (hasChartData(gm.WeeklyActiveUsers)) return true;
		if (hasChartData(gm.MonthlyActiveUsers)) return true;
		if (hasChartData(gm.RetentionRateOnSpecificDays?.retention_on_specific_days)) return true;
		if (hasChartData(gm.RetentionRateInSpecificIntervals?.retention_in_specific_interval)) return true;
		if (hasChartData(gm.MostFiredEvents)) return true;
		if (hasChartData(gm.MostFiredEventsByEventCategory)) return true;
		if (hasChartData(gm.MostCommonlyVisitedFeatures)) return true;
		return false;
	});
</script>

{#if hasAnyOverallData}
<div class=" user-graph-container">
	<div class=" user-graph-wrapper">
		<div class=" user-graph-card">
			<div class="w-3/3">
				<div class=" user-graph-texts">
					<h4 class=" user-graph-title">
						{selectedGraph === 'daily'
							? 'Daily Active Users'
							: selectedGraph === 'weekly'
								? 'Weekly Active Users'
								: 'Monthly Active Users'}
					</h4>
					<p class=" user-graph-des">
						{selectedGraph === 'daily'
							? 'Total number of unique users who interact with the platform on a given day.'
							: selectedGraph === 'weekly'
								? 'Total number of unique users who interact with the platform during a week.'
								: 'Total number of unique users who interact with the platform during a month.'}
					</p>
				</div>
				<div class="flex w-full justify-end">
					<div class="relative my-4 w-fit">
						<select
							class="select w-full border" style="padding-right: 2rem;"
							onchange={(e: any) => {
								selectedGraph = e.target.value;
							}}
						>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
				</div>
				{#if selectedGraph === 'daily' && hasChartData(dailyActiveUsersData)}
					<GenericChart
						type="bar"
						data={dailyActiveUsersData}
						labels={dailyActiveUsersLabels}
						title="Daily Active Users"
					/>
				{:else if selectedGraph === 'daily'}
					<EmptyState />
				{/if}
				{#if selectedGraph === 'weekly' && hasChartData(weeklyActiveUsersData)}
					<GenericChart
						type="bar"
						data={weeklyActiveUsersData}
						labels={weeklyActiveUsersLabels}
						title="Weekly Active Users"
					/>
				{:else if selectedGraph === 'weekly'}
					<EmptyState />
				{/if}
				{#if selectedGraph === 'monthly' && hasChartData(monthlyActiveUsersData)}
					<GenericChart
						type="bar"
						data={monthlyActiveUsersData}
						labels={monthlyActiveUsersLabels}
						title="Monthly Active Users"
					/>
				{:else if selectedGraph === 'monthly'}
					<EmptyState />
				{/if}
			</div>
		</div>
	</div>
</div>

<div class="mt-6 mb-3 flex items-center justify-between">
	<h4 class="text-lg font-semibold text-[var(--color-info)]">Commonly Visited Features</h4>
	<div class="flex items-center gap-2 px-3 py-2 text-[var(--color-info)]">
		<label for="year" class="text-base">Year</label>
		<div class="relative">
			<select id="year" bind:value={selectedYear} class="select text-base" style="padding-right: 2rem;">
				{#each years ?? [] as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
			<div class="select-icon-container">
				<Icon icon="mdi:chevron-down" class="select-icon" />
			</div>
		</div>
	</div>
</div>

<div class=" overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg">
	<table class="w-full table-fixed text-[var(--color-info)]">
		<thead>
			<tr class="bg-[var(--color-accent)]">
				{#each tableHeaders as header}
					<th class="w-1/4 px-6 py-2 text-left text-sm font-normal md:text-base">
						{header}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="">
			{#each filteredData ?? [] as row}
				<tr>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
						{formatMonthLabel(row.month)}
					</td>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
						{row.mostUsedFeature}
					</td>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
						{row.usageCount}
					</td>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
						{row.totalUsage}
					</td>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
						{row.percentage}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<h4 class="mt-9 mb-3 text-lg font-semibold text-[var(--color-info)]">Most Fired Events</h4>

<div class="overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg">
	<table class="w-full table-auto text-[var(--color-info)]">
		<thead class="bg-[var(--color-accent)]">
			<tr>
				<th class="px-6 py-2 text-left text-sm font-normal whitespace-nowrap md:text-base"
					>Event Name</th
				>
				<th class="px-6 py-2 text-left text-sm font-normal md:text-base xl:w-[80%]">Event Count</th>
			</tr>
		</thead>
		<tbody>
			{#each (mostFiredEvents ?? []).slice(0, 15) as event}
				<tr>
					<td
						class="border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm"
						>{event.EventName}</td
					>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
						>{event.event_count}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<h4 class="mt-9 mb-3 text-lg font-semibold text-[var(--color-info)]">
	Most Fired Events by Category
</h4>

<div class="overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg">
	<table class="w-full table-fixed text-[var(--color-info)]">
		<thead class="bg-[var(--color-accent)]">
			<tr class="">
				<th class=" px-6 py-2 text-left text-sm font-normal md:text-base">Event Name</th>
				<th class=" px-6 py-2 text-left text-sm font-normal md:text-base">Event Category</th>
				<th class="px-6 py-2 text-left text-sm font-normal md:text-base xl:w-[60%]">Event Count</th>
			</tr>
		</thead>
		<tbody>
			{#each (mostFiredEventsByEventCategory ?? []).slice(0, 15) as event}
				<tr>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
						>{event.EventCategory}</td
					>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
						>{event.EventName}</td
					>
					<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm"
						>{event.event_count}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
{:else}
	<div class="flex min-h-[60vh] items-center justify-center">
		<EmptyState message="Data Not Available" />
	</div>
{/if}
