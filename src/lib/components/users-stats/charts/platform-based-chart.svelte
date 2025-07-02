<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	/////////////////////////////////////////////////////////////////////////////

	function getThemeColor(): { textColor: string; gridColor: string } {
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
		return {
			textColor: isDarkMode ? '#d9dee9' : '#1c252a', 
			gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
		};
	}

	let { lables, totalUsers, androidUsers, iOSUsers } = $props();

	let barChart: any;
	let ctx;
	let chartInstance: any;

	function updateChartColors() {
		const { textColor, gridColor } = getThemeColor();
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

		if (chartInstance) {
			chartInstance.options.scales.x.ticks.color = textColor;
			chartInstance.options.scales.y.ticks.color = textColor;
			chartInstance.options.plugins.legend.labels.color = textColor;

			// Optionally update axis line color for dark mode
			if (!chartInstance.options.scales.x.border) chartInstance.options.scales.x.border = {};
			if (!chartInstance.options.scales.y.border) chartInstance.options.scales.y.border = {};
			chartInstance.options.scales.x.border.display = true;
			chartInstance.options.scales.y.border.display = true;
			chartInstance.options.scales.x.border.color = isDarkMode ? '#d9dee9' : '#1c252a';
			chartInstance.options.scales.y.border.color = isDarkMode ? '#d9dee9' : '#1c252a';

			chartInstance.update();
		}
	}

	onMount(() => {
		const { textColor, gridColor } = getThemeColor();
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

		ctx = barChart.getContext('2d');
		chartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels: lables,
				datasets: [
					{
						label: 'Total users',
						data: totalUsers,
						borderColor: 'green',
						fill: false
					},
					{
						label: 'Android users',
						data: androidUsers,
						borderColor: 'blue',
						fill: false
					},
					{
						label: 'iOS users',
						data: iOSUsers,
						borderColor: 'purple',
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						grid: {
							display: false,
							color: gridColor
						},
						border: {
							display: true,
							color: isDarkMode ? '#d9dee9' : '#1c252a'
						},
						ticks: {
							color: textColor
						}
					},
					y: {
						grid: {
							display: false,
							color: gridColor
						},
						border: {
							display: true,
							color: isDarkMode ? '#d9dee9' : '#1c252a'
						},
						ticks: {
							color: textColor
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
						display: true,
						position: 'top',
						align: 'center',
						labels: {
							color: textColor,
							boxWidth: 10,
							boxHeight: 10
						}
					}
				}
			}
		});
		
		// Listen for theme changes
		const observer = new MutationObserver(() => {
			updateChartColors();
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		onDestroy(() => {
			observer.disconnect();
			if (chartInstance) {
				chartInstance.destroy();
			}
		});
	});
</script>

<canvas id="three-line-chart" bind:this={barChart}></canvas>
