<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getChartColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';
	import { get } from 'svelte/store';

	/////////////////////////////////////////////////////////////////////////////

	const chartColors = getChartColors();
	const tickColorLight = getTickColorLight();
	const tickColorDark = getTickColorDark();

	let { labels, data, title } = $props();

	$inspect('labels', labels, 'data', data);

	let pieChart: any = $state();
	let ctx;

	function getThemeColor(): { textColor: string} {
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
		return {
			textColor: isDarkMode ? '#d9dee9' : '#1c252a', 
		};
	}

	onMount(async () => {
		const { textColor } = getThemeColor();

		ctx = pieChart.getContext('2d');

		pieChart = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: chartColors,
						hoverBackgroundColor: chartColors
					}
				]
			},
			options: {
				responsive: true,
				// layout: {
				// 	padding: {
				// 		left: 10,
				// 		right:10,
				// 		top: 10,
				// 		bottom:10
				// 	}
				// },
				plugins: {
					legend: {
						display: true,
						position: 'right',
						labels: {
							boxWidth: 10,
							boxHeight: 10,
							color:textColor
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const label = context.label || '';
								const value = context.raw as number;
								const total = context.dataset.data.reduce((acc, curr) => acc + (curr as number), 0);
								const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
								return `${label}: ${value} (${percentage}%)`;
							}
						}
					},
					title: {
						display: false,
						text: title,
						position: 'top',
						color:textColor,
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

	$inspect('pie chart', pieChart);
</script>

<div>
	<canvas id="pieChart" bind:this={pieChart}></canvas>
</div>
