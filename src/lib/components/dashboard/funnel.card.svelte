<script lang="ts">
	import Funnel from '$lib/components/users-stats/charts/funnel.svelte';
	import { getChartColors } from '$lib/themes/theme.selector';
	import { onMount } from 'svelte';

	let { labels, dataSource } = $props();

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
</script>

<!-- <div class="status-card w-auto md:w-full h-auto !flex-row items-center  border sm:p-6">
	<div class="w-1/2 items-center justify-center">
		

		<div class="">
			<Funnel {labels} {dataSource} />
		</div>
	</div> -->
	<div class="my-6 overflow-x-auto rounded-lg border border-[var(--color-outline)] shadow-lg">
		<table class="w-full table-fixed text-[var(--color-info)]">
			<thead class=" bg-[var(--color-accent)]">
				<tr>
					<th
						class="border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-normal whitespace-nowrap md:text-base"
						>App Users</th
					>
					<th
						class=" border-b border-[var(--color-outline)] px-6 py-2 text-left text-sm font-normal md:text-base xl:w-[80%]"
						>Count</th
					>
				</tr>
			</thead>
			<tbody>
				{#each dataPoints as dp}
					<tr>
				
						<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">{dp.label}</td>
						<td class="border-b border-[var(--color-outline)] px-6 py-2 text-xs md:text-sm">{dp.count}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	
<!-- </div> -->
