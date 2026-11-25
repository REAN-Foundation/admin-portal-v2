<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getDoughnutColors, getTickColorDark } from '$lib/themes/theme.selector';
	import { hasChartData } from '$lib/utils/chart.utils';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';

	//////////////////////////////////////////////////////////////////////////
	// Small Chart.js wrapper used only by the custom stats dashboard.

	type ChartKind = 'bar' | 'line' | 'doughnut' | 'pie';

	let {
		title,
		description = '',
		type = 'bar',
		labels = [],
		datasets = [],
		horizontal = false,
		xTitle = '',
		yTitle = '',
		height = 320
	}: {
		title: string;
		description?: string;
		type?: ChartKind;
		labels?: string[];
		datasets?: { label: string; data: number[] }[];
		horizontal?: boolean;
		xTitle?: string;
		yTitle?: string;
		height?: number;
	} = $props();

	const palette = getDoughnutColors();

	let isValid = $derived(
		hasChartData(labels) && datasets.some((dataset) => hasChartData(dataset.data))
	);
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | null = null;

	const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

	function render() {
		if (chart) {
			chart.destroy();
			chart = null;
		}
		if (!isValid || !canvas) return;

		const textColor = isDark() ? getTickColorDark() : '#000000';
		const gridColor = isDark() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
		const circular = type === 'doughnut' || type === 'pie';
		const showLegend = circular || datasets.length > 1;

		const config: any = {
			type,
			data: {
				labels,
				datasets: datasets.map((dataset, i) => {
					const color = palette[i % palette.length];
					const colors = circular ? labels.map((_, j) => palette[j % palette.length]) : color;
					return {
						label: dataset.label,
						data: dataset.data,
						backgroundColor: type === 'line' ? `${color}33` : colors,
						borderColor: circular ? '#ffffff' : color,
						borderWidth: type === 'line' ? 2 : 1,
						borderRadius: type === 'bar' ? 4 : 0,
						fill: type === 'line',
						tension: 0.25,
						pointRadius: type === 'line' ? 2 : 0
					};
				})
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: horizontal ? 'y' : 'x',
				plugins: {
					legend: {
						display: showLegend,
						position: 'bottom',
						labels: { color: textColor, boxWidth: 10, boxHeight: 10 }
					},
					tooltip: circular
						? {
								callbacks: {
									label: (context: any) => {
										const values: number[] = context.dataset.data;
										const total = values.reduce((sum, v) => sum + (Number(v) || 0), 0);
										const value = Number(context.raw) || 0;
										const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
										return `${context.label}: ${value} (${percent}%)`;
									}
								}
							}
						: {}
				},
				scales: circular
					? {}
					: {
							x: {
								beginAtZero: true,
								grid: { display: horizontal, color: gridColor },
								ticks: { color: textColor },
								title: { display: !!xTitle, text: xTitle, color: textColor }
							},
							y: {
								beginAtZero: true,
								grid: { display: !horizontal, color: gridColor },
								ticks: { color: textColor, autoSkip: !horizontal },
								title: { display: !!yTitle, text: yTitle, color: textColor }
							}
						}
			}
		};
		chart = new Chart(canvas, config);
	}

	// Re-draw when the data changes (date range / tenant reload) or the canvas appears.
	$effect(() => {
		void labels;
		void datasets;
		void canvas;
		render();
	});

	onMount(() => {
		const observer = new MutationObserver(() => render());
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		return () => observer.disconnect();
	});

	onDestroy(() => {
		if (chart) chart.destroy();
	});
</script>

<div class="rounded-lg border border-[var(--color-outline)] p-4 shadow-lg">
	<h4 class="basic-stat">{title}</h4>
	{#if description}
		<p class="mb-2 text-sm text-[var(--color-info)] opacity-80">{description}</p>
	{/if}
	{#if isValid}
		<div class="relative w-full" style="height: {height}px">
			<canvas bind:this={canvas}></canvas>
		</div>
	{:else}
		<EmptyState />
	{/if}
</div>
