<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	const tickColorLight = getTickColorLight();
	const tickColorDark = getTickColorDark();

	let { lables, totalUsers, androidUsers, iOSUsers } = $props();

	
	let barChart: any;
	let ctx;

	onMount(() => {
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
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight // set x-axis label color here
						}
					},
					y: {
						grid: {
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight // set y-axis label color here
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
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight,
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
