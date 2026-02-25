<script>
	import BarChart from '$lib/components/analytics/BarChart.svelte';
	import RetentionGraphs from '$lib/components/analytics/RetentionGraphs.svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import { hasChartData } from '$lib/utils/chart.utils';

	let { type = 'bar', data, labels, title } = $props();
</script>

{#if hasChartData(data) && hasChartData(labels)}
	{#if type === 'bar'}
		<div class="h-96">
			<BarChart dataSource={data} {labels} {title} />
		</div>
	{:else if type === 'retention'}
		<div class="h-96">
			<RetentionGraphs dataSource={data} {labels} {title} />
		</div>
	{/if}
{:else}
	<EmptyState />
{/if}
