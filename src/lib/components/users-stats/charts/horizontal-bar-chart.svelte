<script lang="ts">
	import { onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import {
		getChartColors,
		getTickColorLight,
		getTickColorDark
  	} from '$lib/themes/theme.selector';

  /////////////////////////////////////////////////////////////////////////////

  const chartColors = getChartColors();
  const tickColorLight = getTickColorLight();
  const tickColorDark = getTickColorDark();

	export let labels: string[] = [];
	export let dataSource: number[] = [];
	export let title;
	export let truncateLabelsAt = 25;

	let canvasEl: HTMLCanvasElement;
	let chart;

	const truncateLabel = (label: string) => {
		if (typeof label !== 'string' || label.length <= truncateLabelsAt) return label;
		return label.slice(0, truncateLabelsAt) + '…';
	};

	function createChart() {
		if (!canvasEl) return;
		if (chart) chart.destroy();

		const ctx = canvasEl.getContext('2d');
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						data: dataSource,
						backgroundColor: chartColors,
						borderColor: chartColors,
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				scales: {
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight // set x-axis label color here
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight, // set y-axis label color here
							autoSkip: false,
							// Truncate the on-axis label; the tooltip below still shows the full text on hover.
							callback: function (value) {
								return truncateLabel(this.getLabelForValue(value as number));
							}
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
						display: false,
						position: 'top',
						align: 'center',
						labels: {
							color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
						}
					},
					title: {
						display: true,
						text: title,
						position: 'top',
						color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
						align: 'center',
						padding: 20,
						font: {
							size: 22,
							weight: 'normal',
							lineHeight: 1.2
						}
					},
					tooltip: {
						callbacks: {
							title: (items) => items.map((item) => item.label)
						}
					}
				}
			}
		});
	}

	onDestroy(() => {
		if (chart) chart.destroy();
	});

	// Re-create the chart whenever the underlying data changes (e.g. a date-range
	// or tenant filter reload), not just on first mount.
	$: if (canvasEl) {
		labels, dataSource;
		createChart();
	}
</script>

<canvas bind:this={canvasEl} />
