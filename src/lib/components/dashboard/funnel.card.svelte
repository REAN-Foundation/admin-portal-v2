<script lang="ts">
	import Funnel from '$lib/components/users-stats/charts/funnel.svelte';
	import { getChartColors } from '$lib/themes/theme.selector';
	import { onMount } from 'svelte';

	let { labels, dataSource, genderWiseUsers, selectGenderWiseUsersDividionYearly } = $props();

	const chartColors = getChartColors();

	interface FunnelDataPoint {
		label: string;
		count: number;
		color: string;
	}

	let dataPoints: FunnelDataPoint[] = $state([]);
	onMount(() => {
		dataPoints = labels.map((label: any, index: number) => {
			return {
				label,
				count: dataSource[index],
				color: chartColors[index % chartColors.length]
			};
		});
	});
	import { tick } from 'svelte';

	let genderDistributionLabels: any = $derived(
		genderWiseUsers.length > 0 ? genderWiseUsers.map((x: { Gender: any }) => x.Gender) : ''
	);
	let genderDistributionData: any = $derived(
		genderWiseUsers.length > 0 ? genderWiseUsers.map((x: { Ratio: any }) => x.Ratio) : ''
	);

	const handlelSelectYearForGender = (year: any) => {
		console.log('year', year);
		selectGenderWiseUsersDividionYearly({
			year: year
		});
	};
</script>

<div class="my-6 flex flex-col gap-4 md:flex-row">
	<!-- App Users Table -->
	<div
		class="w-full overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg lg:w-1/2"
	>
		<table class="w-full table-fixed text-[var(--color-info)]">
			<thead class="bg-[var(--color-accent)]">
				<tr>
					<th
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold whitespace-nowrap md:text-base"
					>
						App Users
					</th>
					<th
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold md:text-base"
					>
						Count
					</th>
				</tr>
			</thead>
			<tbody>
				{#each dataPoints as dp}
					<tr>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
							{dp.label}
						</td>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
							{dp.count}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Gender Table -->
	<div
		class="w-full overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg lg:w-1/2"
	>
		<table class="w-full text-[var(--color-info)]">
			<thead class="bg-[var(--color-accent)]">
				<tr>
					<th
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold whitespace-nowrap md:text-base"
					>
						Gender
					</th>
					<th
						class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-semibold md:text-base"
					>
						Count
					</th>
				</tr>
			</thead>
			<tbody>
				{#each genderWiseUsers as data}
					<tr>
						<td
							class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs whitespace-nowrap md:text-sm"
						>
							{data.Gender}
						</td>
						<td class="w-1/2 border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">
							{data.Count}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
