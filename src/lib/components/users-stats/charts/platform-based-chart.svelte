<script lang="ts">
	import { onMount } from 'svelte';
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

	onMount(() => {
		const { textColor, gridColor } = getThemeColor();

		ctx = barChart.getContext('2d');
		barChart = new Chart(ctx, {
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
						ticks: {
							color: textColor // set x-axis label color here
						}
					},
					y: {
						grid: {
							display: false,
							color: gridColor
						},
						ticks: {
							color: textColor // set y-axis label color here
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
	});
</script>

<canvas id="three-line-chart" bind:this={barChart}></canvas>
