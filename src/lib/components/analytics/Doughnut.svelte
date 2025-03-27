<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import {
		getDoughnutColors,
		getTickColorLight,
		getTickColorDark
	} from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	const tickColorLight = getTickColorLight();
	const tickColorDark = getTickColorDark();

	let { updatedChartData, updatedChartLabels, title } = $props();

	let data = updatedChartData,
		labels = updatedChartLabels;

	$inspect(data, labels);
	let doughnutChart: any = $state();
	let ctx;

	const colorPalette = getDoughnutColors();

	function getColor(value: number, totalSum: number, index: number): string {
		const localIndex = index % 8; // This will ensure that the index always stays within 0 to 7
		return colorPalette[localIndex];
	}

	function getDynamicColors(data: number[]): string[] {
		const totalSum = data.reduce((acc, curr) => acc + curr, 0); // Sum of all values
		return data.map((value, index) => getColor(value, totalSum, index));
	}

	function truncateLabel(label: string, maxLength: number = 8): string {
		return label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
	}

	let dynamicColors: string[], truncatedLabels;

	$effect(() => {
		dynamicColors = getDynamicColors(data);
		truncatedLabels = labels.map((label: string) => truncateLabel(label));
	});

	onMount(async() => {
		ctx = doughnutChart.getContext('2d');

		doughnutChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: dynamicColors, // Dynamic colors for the doughnut chart
						hoverBackgroundColor: dynamicColors
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						display: true,
						position: 'bottom',
						labels: {
							boxWidth: 10,
							boxHeight: 10,
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
						align: 'start',
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

	$inspect('Doughnut', doughnutChart);
</script>

<!-- Canvas for the Doughnut chart -->
<div class="h-80 w-fit">
	{#if data}
		<canvas bind:this={doughnutChart}></canvas>
	{:else}
		<p>No data available.</p>
	{/if}
</div>
