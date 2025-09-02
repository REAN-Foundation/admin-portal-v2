<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

	/////////////////////////////////////////////////////////////////////////////

	let { labels, firstDataSource, secondDataSource, title } = $props();

	let barChart: Chart;
	let canvas: HTMLCanvasElement;
	let observer: MutationObserver | null = null;

	let xLabel = 'Month';
	let yLabel = 'User Count';

	function getTickColor(): string {
		return document.documentElement.getAttribute('data-theme') === 'dark'
			? getTickColorDark()
			: '#00000';
	}

	function createChart() {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;

		if (barChart) barChart.destroy();

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
						label: 'Patient Registration Month',
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
							color: getTickColor()
						},
						title: {
							display: true,
							text: xLabel,
							color: getTickColor()
						},
						border: {
							color: getTickColor() // Set axis line color based on theme
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							display: true
						},
						ticks: {
							color: getTickColor()
						},
						title: {
							display: true,
							text: yLabel,
							color: getTickColor()
						},
						border: {
							color: getTickColor() // Set axis line color based on theme
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
							color: getTickColor()
						}
					},
					title: {
						display: false,
						text: title,
						position: 'top',
						color: getTickColor(),
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
								let label = context.dataset.label || '';
								let xLabel = labels[context.dataIndex] || 'No label';
								let yValue = context.parsed.y !== null ? context.parsed.y : 'No value';
								if (label) label += ': ';
								label += `${xLabel}, Value: ${yValue}`;
								return label;
							}
						}
					}
				}
			}
		});
	}

	// Reactive statement to update chart when data changes
	$effect(() => {
		if (labels && labels.length > 0 && firstDataSource && secondDataSource && canvas) {
			createChart();
		}
	});

	onMount(() => {
		// Theme change observer
		observer = new MutationObserver(() => {
			createChart(); // Re-create chart on theme change
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		// Initial chart creation
		if (labels && labels.length > 0 && firstDataSource && secondDataSource) {
			createChart();
		}
	});

	onDestroy(() => {
		if (barChart) barChart.destroy();
		if (observer) observer.disconnect();
	});
</script>

<canvas bind:this={canvas} class="h-auto w-full"></canvas>
