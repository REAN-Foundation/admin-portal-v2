<script lang="ts">
	import { onMount } from 'svelte';
	import Chart, { LinearScale, CategoryScale } from 'chart.js/auto';
	import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
	import { getChartColors } from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	const chartColors = getChartColors();

	let { labels, dataSource } = $props();

	Chart.register(FunnelController, TrapezoidElement, LinearScale, CategoryScale);

	let funnelChart:any;
	let ctx;

	onMount(() => {
		ctx = funnelChart.getContext('2d');
		funnelChart = new Chart(ctx, {
			type: 'funnel',
			data: {
				labels: labels,
				datasets: [
					{
						data: dataSource,
						backgroundColor: chartColors,
						borderColor: chartColors,
						borderWidth: 1,
						
					}
					//     datalabels: {
					//   labels: {
					//     value: {
					//       color: 'green'
					//     }
					//   }
					// }
				]
			},
			options: {
				responsive: true,
				// maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					datalabels: {
						display: true,
						anchor: 'start',
						align: 'start',
						offset: 0,
						color: 'red'
						//   formatter: (value, ctx) => {
						//   return value + '%';
						// },
					}
				}
			}as any
		});
	});
</script>

<canvas id="myChart" bind:this={funnelChart}></canvas>
