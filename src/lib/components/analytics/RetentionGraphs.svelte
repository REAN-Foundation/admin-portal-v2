<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import {
		getDoughnutColors,
		getTickColorLight,
		getTickColorDark
	} from '$lib/themes/theme.selector';
	/////////////////////////////////////////////////////////////////////////////

	let { labels, dataSource, title } = $props();
	// export let rate;
	console.log('this is title=============', title);

	let barChart: any;
	let ctx;

	function getThemeColor(): { textColor: string; gridColor: string } {
		const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
		return {
			textColor: isDarkMode ? '#d9dee9' : '#1c252a', // Text color
			gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' // Grid color
		};
	}

	let xLabel: string;
	let yLabel: string;
	let MAX_INDEX;
	function selectAxisLabel(title: any) {
		switch (title) {
			case 'Engagement Rate (%)':
				(xLabel = 'Month'), (yLabel = 'Percentage of Users (%)');
				break;
			case 'Retention User Count On Specific Days':
				(xLabel = 'Days of the Month'), (yLabel = 'User Count');
				// MAX_INDEX = 10;
				break;
			case 'Retention User Count On Specific Days (%)':
				(xLabel = 'Days of the Month'), (yLabel = 'Percentage');
				// MAX_INDEX = 10;
				break;
			case 'Retention User Count On Specific Intervals':
				(xLabel = 'Retention Interval'), (yLabel = 'User Count');
				break;
			case 'Retention User Count On Specific Intervals (%)':
				(xLabel = 'Retention Interval'), (yLabel = 'Percentage');
				// MAX_INDEX = 100;
				break;
			case 'Retention On Specific Days':
				(xLabel = 'Retention Interval'), (yLabel = 'User Count');
				// MAX_INDEX = 10;
				break;
			case 'Retention On Specific Days (%)':
				(xLabel = 'Retention Interval'), (yLabel = 'User Count');
				// MAX_INDEX = 10;
				break;
			case 'Retention On Specific Interval':
				(xLabel = 'Retention Interval'), (yLabel = 'User Count');
				break;
			case 'Retention On Specific Interval (%)':
				(xLabel = 'Retention Interval'), (yLabel = 'User Count');
				// MAX_INDEX = 100;

				break;
		}
	}
	onMount(() => {
		const { textColor, gridColor } = getThemeColor();
		selectAxisLabel(title);
		ctx = barChart.getContext('2d');
		barChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						data: dataSource,
						backgroundColor: '#D3D3D3',
						borderColor: getTickColorDark(),
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
						},
						border: {
							color: getTickColorDark() // Set axis line color based on theme
						}
					},
					y: {
						max: MAX_INDEX,
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
						},
						border: {
							color: getTickColorDark() // Set axis line color based on theme
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
						callbacks: {
							// label: function (context) {
							//     let label = context.dataset.label || '';
							//     let customNames = labels;
							//     let extraInfo = rate;
							//     let tooltipLines = [];
							//     if (context.parsed.y !== null) {
							//         let customLabel = customNames[context.dataIndex] || 'Default Name';
							//         tooltipLines.push(customLabel);
							//         let extra = extraInfo[context.dataIndex] || 'No Extra Info';
							//         tooltipLines.push(extra);
							//     }
							//     return tooltipLines;
							// }
						}
					}
				}
			}
		});
	});
</script>

<canvas class="h-96" bind:this={barChart}></canvas>
