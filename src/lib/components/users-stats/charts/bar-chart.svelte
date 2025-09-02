<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getChartColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	const chartColors = getChartColors();
	const tickColorLight = getTickColorLight();
	const tickColorDark = getTickColorDark();

	let { labels, dataSource, title } = $props();

	let barChart: any;
	let ctx;

	onMount(() => {
		ctx = barChart.getContext('2d');
		barChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						data: dataSource,
						backgroundColor: chartColors,
						borderColor: chartColors,
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'x',
				scales: {
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight // set y-axis label color here
						}
					}
				},
				layout: {
					padding: {
						bottom: 20 // Adjust the bottom padding value as needed
					}
				},
				plugins: {
					legend: {
						display: false,
						position: 'top',
						align: 'center',
						labels: {
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight
						}
					},
					title: {
						display: false,
						text: title,
						position: 'top',
						color: document.documentElement.classList.contains('dark')
							? tickColorDark
							: tickColorLight,
						align: 'center',
						padding: 20,
						font: {
							size: 22,
							weight: 'normal',
							lineHeight: 1.2
						}
					}
				}
			}
		});
	});
</script>

<canvas id="myChart" bind:this={barChart}></canvas>
