<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

	let { labels, dataSource, title } = $props();

	let chart: Chart;
	let canvas: HTMLCanvasElement;

	let xLabel: string;
	let yLabel: string;

	function selectAxisLabel(title: any) {
		switch (title) {
			case 'Daily Active Users':
				xLabel = 'Day';
				yLabel = 'User Count';
				break;
			case 'Weekly Active Users':
				xLabel = 'Week';
				yLabel = 'User Count';
				break;
			case 'Monthly Active Users':
				xLabel = 'Month';
				yLabel = 'User Count';
				break;
			case 'Access Frequency':
				xLabel = 'Month';
				yLabel = 'User Count';
				break;
		}
	}

	function getThemeColor(): { textColor: string; gridColor: string } {
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
		return {
			textColor: isDarkMode ? getTickColorDark() : '#00000',
			gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
		};
	}

	function createChart() {
		selectAxisLabel(title);
		const { textColor, gridColor } = getThemeColor();

		if (chart) chart.destroy();

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						data: dataSource,
						backgroundColor: '#D3D3D3',
						borderColor: '#808080',
						borderWidth: 1,
						borderRadius: {
							topLeft: 4,
							topRight: 4
						}
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'x',
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: textColor },
						title: { display: true, text: xLabel, color: textColor }
					},
					y: {
						beginAtZero: true,
						grid: { display: true, color: gridColor },
						ticks: { color: textColor },
						title: { display: true, text: yLabel, color: textColor }
					}
				},
				layout: { padding: { bottom: 20 } },
				plugins: {
					legend: {
						display: false,
						labels: { color: textColor }
					},
					title: {
						display: false,
						text: title,
						color: textColor,
						align: 'start',
						padding: 20,
						font: { size: 22, weight: 'normal', lineHeight: 1.2 }
					},
					tooltip: {
						callbacks: {}
					}
				}
			}
		});
	}

	onMount(() => {
		createChart();

		const observer = new MutationObserver(() => {
			createChart();
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => {
			if (chart) chart.destroy();
			observer.disconnect();
		};
	});

	onDestroy(() => {
		if (chart) chart.destroy();
	});
</script>

<canvas class="w-full h-auto" bind:this={canvas}></canvas>
