<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import {
		getDoughnutColors,
		getTickColorLight,
		getTickColorDark
	} from '$lib/themes/theme.selector';
	import { hasChartData } from '$lib/utils/chart.utils';
	import EmptyState from './EmptyState.svelte';

	/////////////////////////////////////////////////////////////////////////////

	let { updatedChartData, updatedChartLabels, title } = $props();
	let data = updatedChartData;
	let labels = updatedChartLabels;

	let isValid = $derived(hasChartData(data) && hasChartData(labels));

	let doughnutChart: Chart;
	let canvas: HTMLCanvasElement;

	const colorPalette = getDoughnutColors();

	function getColor(value: number, totalSum: number, index: number): string {
		return colorPalette[index % colorPalette.length];
	}

	function getDynamicColors(data: number[]): string[] {
		const totalSum = data.reduce((acc, curr) => acc + curr, 0);
		return data.map((value, index) => getColor(value, totalSum, index));
	}

	function truncateLabel(label: string, maxLength: number = 8): string {
		return label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
	}

	function getTickColor(): string {
		return document.documentElement.getAttribute('data-theme') === 'dark'
			? getTickColorDark()
			: '#00000'
	}

	let dynamicColors: string[] = [];
	let truncatedLabels: string[] = [];

	function createChart() {
		if (!isValid || !canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		if (doughnutChart) doughnutChart.destroy();

		dynamicColors = getDynamicColors(data);
		truncatedLabels = labels.map((label) => truncateLabel(label));

		doughnutChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: truncatedLabels,
				datasets: [
					{
						data: data,
						backgroundColor: dynamicColors,
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
							color: getTickColor()
						}
					},
					title: {
						display: false,
						text: title,
						position: 'top',
						color: getTickColor(),
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
	}

	function updateChartOnThemeChange() {
		createChart();
	}

	onMount(() => {
		if (!isValid) return;
		createChart();

		// Observe changes to data-theme
		const observer = new MutationObserver(updateChartOnThemeChange);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => {
			if (doughnutChart) doughnutChart.destroy();
			observer.disconnect();
		};
	});

	onDestroy(() => {
		if (doughnutChart) doughnutChart.destroy();
	});
</script>

<!-- Canvas for the Doughnut chart -->
<div class=" h-auto  w-fit">
	{#if isValid}
		<canvas bind:this={canvas}></canvas>
	{:else}
		<EmptyState />
	{/if}
</div>
