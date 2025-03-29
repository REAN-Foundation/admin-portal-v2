<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	const tickColorLight = getTickColorLight();
	const tickColorDark = getTickColorDark();

	let { labels, dataSource, title } = $props();

	$inspect("labels",labels, dataSource)

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
						display: false,
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
						callbacks: {}
					}
				}
			}
		});
	});
</script>

<canvas class=" " bind:this={barChart} ></canvas>
