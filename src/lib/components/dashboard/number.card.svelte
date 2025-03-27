<script lang="ts">
	let { cardTitle, cardContent, additional, prefix } = $props();
</script>

<div class="status-card sm:p-4 ">
	<dt class="text">
		{cardTitle}
	</dt>
	{#if additional}
		<dd class="my-1 flex items-baseline">
			<div class="counts">{cardContent}</div>
			<div class="additional flex items-baseline">
				{additional}
				<div class="text-xs">{prefix}</div>
			</div>
		</dd>
	{:else}
		<dd class=" counts mt-2 tracking-tight">
			{cardContent}
		</dd>
	{/if}
</div>
