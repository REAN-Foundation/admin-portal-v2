<script lang="ts">
	import Icon from '@iconify/svelte';
	import { slide } from 'svelte/transition';
	let { headerText, children } = $props();
	let expanded = $state(false);
</script>

<div class="border-secondary-100 dark:border-surface-700 min-w-[500px] border p-2">
	<div class="flex justify-between">
		<div class="flex-start text">{headerText}</div>
		<button
			class=" hover:variant-soft-secondary flex-end p-2"
			onclick={() => (expanded = !expanded)}
		>
			{#if expanded === false}
				<Icon icon="material-symbols:keyboard-arrow-down-rounded" class="text text-lg" />
			{:else}
				<Icon icon="material-symbols:keyboard-arrow-up-rounded" class="text text-lg" />
			{/if}
		</button>
	</div>
	{#if expanded}
		<div class="mt-2 p-2" transition:slide>{@render children()}</div>
	{/if}
</div>
