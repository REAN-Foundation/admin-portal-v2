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

<div class="status-card w-auto md:w-full h-auto !flex-row items-center  border sm:p-6">
	<div class="w-1/2 items-center justify-center">
		<h4 class="sub-heading mb-5 text-center">App Users</h4>

		<div class="">
			<Funnel {labels} {dataSource} />
		</div>
	</div>

	<div class="my-10 w-1/2 px-4">
		{#each dataPoints as dp}
			<div class="flex w-full gap-4 py-1">
				<div class="mt-1 h-3 w-3 border" style="background-color: {dp.color};"></div>
				<div class="text-primary-500 dark:text-primary-100 w-2/3 text-sm font-normal">
					{dp.label}
				</div>
				<div class="text-primary-500 dark:text-primary-100 w-1/3 text-sm font-normal">
					{dp.count}
				</div>
			</div>
		{/each}
	</div>
</div>
