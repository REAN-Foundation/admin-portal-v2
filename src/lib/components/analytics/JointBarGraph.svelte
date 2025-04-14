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

	let { labels, firstDataSource, secondDataSource, title } = $props();

	let barChart: any = $state();
	let ctx;

	let xLabel = 'Month';
	let yLabel = 'User Count';
	onMount(() => {
		ctx = barChart.getContext('2d');
		barChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						data: firstDataSource,
						backgroundColor: '#31b31c',
						borderColor: '#5EC009',
						borderWidth: 1,
						label: 'Patient Registration Moth',
						borderRadius: {
							topLeft: 4,
							topRight: 4
						}
					},
					{
						data: secondDataSource,
						backgroundColor: '#e72212',
						borderColor: '#5EC1E9',
						borderWidth: 1,
						label: 'Patient Deregistration Month',
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
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight
						},
						title: {
							display: true,
							text: xLabel,
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							display: true
						},
						ticks: {
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight
						},
						title: {
							display: true,
							text: yLabel,
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight
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
						display: true,
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
							label: function (context) {
								// Get the label for the dataset
								let label = context.dataset.label || '';

								// Add the x-axis value (label)
								let xLabel = labels[context.dataIndex] || 'No label';

								// Add the y-axis value (data point value)
								let yValue = context.parsed.y !== null ? context.parsed.y : 'No value';

								// Customizing the tooltip text
								if (label) {
									label += ': ';
								}
								label += `${xLabel} , Value: ${yValue}`;

								return label;
							}
						}
					}
				}
			}
		});
	});
</script>

<canvas class=" " bind:this={barChart}></canvas>
