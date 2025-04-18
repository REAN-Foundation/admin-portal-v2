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

	let { labels, data, title, showLegendData } = $props();

	$inspect(labels, data, title);

	let pieChart: any;
	let ctx: any;
	const colorPalette = getDoughnutColors();

	const initChart = () => {
		if (pieChart) {
			pieChart.destroy();
		}
		ctx = (document.getElementById('myPieChart') as HTMLCanvasElement)?.getContext('2d');

		console.log(ctx);

		pieChart = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: colorPalette,
						hoverBackgroundColor: colorPalette
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					// legend: {
					//     display: true,
					//     position: 'bottom',
					//     labels: {
					//         boxWidth: 10,
					//         boxHeight: 10,
					//         color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,

					//     }
					// },
					legend: {
						display: true,
						position: 'bottom',
						labels: {
							boxWidth: 10,
							boxHeight: 10,
							color: document.documentElement.classList.contains('dark')
								? tickColorDark
								: tickColorLight,
							generateLabels: (chart: Chart) => {
								const data = chart.data;

								if (data.labels?.length && data.datasets?.length) {
									const dataset: any = data.datasets[0];
									const total = dataset.data.reduce((acc: number, curr: any) => {
										if (typeof curr === 'number') {
											return acc + curr;
										} else if (Array.isArray(curr)) {
											return acc + curr[0] || 0;
										} else if (typeof curr === 'object' && 'x' in curr && 'y' in curr) {
											return acc + (curr.x || 0);
										} else {
											return acc;
										}
									}, 0);

									return data.labels.map((label, i) => {
										const value = typeof dataset.data[i] === 'number' ? dataset.data[i] : 0;
										const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
										const fillStyle = dataset.backgroundColor?.[i] || '#000';
										const strokeStyle = dataset.borderColor?.[i] || '#fff';

										const text = showLegendData
											? `${label}: ${value} (${percentage}%)`
											: `${label}`;
										return {
											text: text,
											fillStyle,
											strokeStyle,
											hidden: false,
											index: i
										};
									});
								}

								return [];
							}
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
							label: (context) => {
								const label = context.label || '';
								const value = context.raw as number;
								const total = context.dataset.data.reduce((acc, curr) => acc + (curr as number), 0);
								const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
								return `${label}: ${value} (${percentage}%)`;
							}
						}
					}
				}
			}
		});
	};

	onMount(() => {
		initChart();
	});

	if (data.length > 0 && labels.length > 0) {
		initChart();
	}
</script>

<div class="h-96 w-full p-2 border shadow-lg border-[var(--color-outline)]">
	{#if data.length > 0 && labels.length > 0}
		<canvas id="myPieChart" bind:this={pieChart}  class="w-64 mx-auto h-auto"></canvas>
	{:else}
		<p>No data available.</p>
	{/if}
</div>
