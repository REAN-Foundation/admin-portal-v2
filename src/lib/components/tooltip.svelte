<script lang="ts">
	let { children, text,forceShow = false } = $props();

	let showTooltip = $state(false);
	let tooltipElement: HTMLSpanElement|undefined =$state();
	let shouldShowTooltip = $derived(forceShow||text.length > 50);

	function handleMouseEnter() {
		if (shouldShowTooltip) {
			showTooltip = true;
		}
	}

	function handleMouseLeave() {
		showTooltip = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	role="button"
	tabindex="0"
	class="relative inline-block"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<!-- <slot></slot> -->
	{@render children()}

	{#if showTooltip && shouldShowTooltip}
		<span
			bind:this={tooltipElement}
			class="absolute z-10 rounded-lg text-xs shadow-lg"
			style="bottom: 100%; left: 50%; transform: translateX(-50%); background-color: rgba(71, 85, 105, 0.95); border: 1px solid rgba(51, 65, 85, 0.1); color: #ffffff; margin-bottom: 8px; padding: 10px; font-size: 12px; width:full; text-align: left; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"
		>
			{text}
			<span
				class="absolute"
				style="top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgba(71, 85, 105, 0.95);"
			>
			</span>
		</span>
	{/if}
</span>
