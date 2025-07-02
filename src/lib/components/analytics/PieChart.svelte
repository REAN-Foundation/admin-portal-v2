<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import Chart from 'chart.js/auto';
import { getDoughnutColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

let {
	labels = [],
	data = [],
	title = '',
	showLegendData = false
} = $props();

let canvas: HTMLCanvasElement;
let pieChart: Chart | null = null;
let observer: MutationObserver | null = null;
let isCanvasReady = $state(false);

const colorPalette = getDoughnutColors();
const tickColorLight = getTickColorLight();
const tickColorDark = getTickColorDark();

$inspect("PieChart Props:", { labels, data, title, showLegendData });

function getThemeColor(): string {
	return document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight;
}

function initChart() {
	if (!canvas || !isCanvasReady) return;
	
	if (pieChart) {
		pieChart.destroy();
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Ensure data is properly formatted
	const chartData = data.map(d => typeof d === 'number' ? d : Number(d) || 0);
	const chartLabels = labels.map(l => String(l));

	// Validate data
	if (chartData.length === 0 || chartLabels.length === 0) {
		console.log('No valid data for pie chart');
		return;
	}

	if (chartData.some(d => d === 0)) {
		console.log('Warning: Some data values are 0');
	}

	console.log('Initializing pie chart with:', { chartLabels, chartData });
	console.log('Chart constructor available:', typeof Chart);

	try {
		pieChart = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: chartLabels,
			datasets: [
				{
					data: chartData,
					backgroundColor: colorPalette,
					hoverBackgroundColor: colorPalette
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
					position: 'bottom',
					labels: {
						boxWidth: 10,
						boxHeight: 10,
						color: getThemeColor(),
						generateLabels: (chart: Chart) => {
							const dataset: any = chart.data.datasets[0];
							const total = dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);

							return chart.data.labels.map((label: any, i: number) => {
								const value = dataset.data[i];
								const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
								const fillStyle = dataset.backgroundColor[i];
								const strokeStyle = dataset.borderColor?.[i] || '#fff';
								return {
									text: showLegendData
										? `${label}: ${value} (${percentage}%)`
										: `${label}`,
									fillStyle,
									strokeStyle,
									hidden: false,
									index: i
								};
							});
						}
					}
				},
				title: {
					display: false,
					text: title,
					color: getThemeColor(),
					align: 'start',
					padding: 20,
					font: {
						size: 22,
						weight: 'normal',
						lineHeight: 1.2
					}
				},
				tooltip: {
					callbacks: {
						label: (context) => {
							const label = context.label || '';
							const value = context.raw as number;
							const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
							const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
							return `${label}: ${value} (${percentage}%)`;
						}
					}
				}
			}
		}
	});
		console.log('Pie chart created successfully');
	} catch (error) {
		console.error('Error creating pie chart:', error);
	}
}

function updateChartOnThemeChange() {
	if (pieChart) {
		// Update colors for theme change
		pieChart.options.plugins.legend.labels.color = getThemeColor();
		pieChart.options.plugins.title.color = getThemeColor();
		pieChart.update();
	}
}

// Reactive statement to update chart when data or labels change
$effect(() => {
	if (data.length > 0 && labels.length > 0 && isCanvasReady) {
		console.log('Effect triggered - updating chart');
		initChart();
	}
});

onMount(() => {
	// Set up theme change observer
	observer = new MutationObserver(updateChartOnThemeChange);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class']
	});

	// Mark canvas as ready after a short delay to ensure DOM is ready
	setTimeout(() => {
		isCanvasReady = true;
		if (data.length > 0 && labels.length > 0) {
			initChart();
		}
	}, 100);
});

onDestroy(() => {
	if (pieChart) {
		pieChart.destroy();
	}
	if (observer) {
		observer.disconnect();
	}
});
</script>

<div class="h-96 w-full p-2">
	{#if data.length > 0 && labels.length > 0}
		<canvas bind:this={canvas} class="w-full mx-auto h-auto"></canvas>
	{:else}
		<p>No data available.</p>
	{/if}
</div>

