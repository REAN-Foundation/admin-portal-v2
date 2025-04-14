<script>
	import BarChart from '$lib/components/analytics/BarChart.svelte';
	import RetentionGraphs from '$lib/components/analytics/RetentionGraphs.svelte';

	let { type = 'bar', data, labels, title } = $props();
    $inspect("data",data, "labels",labels)
</script>


{#if data}
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
	<div class="h-[400px] w-full p-4">
		<p class="justify-left flex items-center text-2xl">
			<!-- {title} -->
		</p>
		<p class="mt-28 flex items-center justify-center text-xl leading-3">Data Not Available</p>
	</div>
{/if}

