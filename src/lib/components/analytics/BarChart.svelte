<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	// const tickColorLight = getTickColorLight();
	// const tickColorDark = getTickColorDark();

	let { labels, dataSource, title } = $props();

	$inspect('labels', labels, dataSource);

	function getThemeColor(): { textColor: string; gridColor: string } {
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
		return {
			textColor: isDarkMode ? '#d9dee9' : '#1c252a', // Text color
			gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' // Grid color
		};
	}

	let barChart: any;
	let ctx;

	let xLabel: string;
	let yLabel: string;
	function selectAxisLabel(title: any) {
		switch (title) {
			case 'Daily Active Users':
				(xLabel = 'Day'), (yLabel = 'User Count');
				break;
			case 'Weekly Active Users':
				(xLabel = 'Week'), (yLabel = 'User Count');
				break;
			case 'Monthly Active Users':
				(xLabel = 'Month'), (yLabel = 'User Count');
				break;
			case 'Access Frequency':
				(xLabel = 'Month'), (yLabel = 'User Count');
				break;
		}
	}
	onMount(() => {
		selectAxisLabel(title);
		const { textColor, gridColor } = getThemeColor();
		ctx = barChart.getContext('2d');
		barChart = new Chart(ctx, {
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
						grid: {
							display: false
						},
						ticks: {
							color: textColor
						},
						title: {
							display: true,
							text: xLabel,
							color: textColor
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							display: true,
							color: gridColor
						},
						ticks: {
							color: textColor
						},
						title: {
							display: true,
							text: yLabel,
							color: textColor
						}
					}
				},
				layout: {
					padding: {
						bottom: 20
					}
				},
				plugins: {
					legend: {
						display: false,
						position: 'top',
						align: 'center',
						labels: {
							color: textColor
						}
					},
					title: {
						display: false,
						text: title,
						position: 'top',
						color: textColor,
						align: 'start',
						padding: 20,
						font: {
							size: 22,
							weight: 'normal',
							lineHeight: 1.2
						}
					},

					tooltip: {
						callbacks: {}
					}
				}
			}
		});
	});
</script>

<canvas class=" " bind:this={barChart}></canvas>
