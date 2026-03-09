<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Snippet } from 'svelte';

	let {
		title = '',
		description = '',
		collapsible = false,
		defaultOpen = true,
		children
	} = $props<{
		title?: string;
		description?: string;
		collapsible?: boolean;
		defaultOpen?: boolean;
		children: Snippet;
	}>();

	let isOpen = $state(defaultOpen);
</script>

<div class="rounded-lg border border-[var(--color-outline)] bg-[var(--color-secondary)]">
	{#if title}
		{#if collapsible}
			<button
				type="button"
				class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[var(--color-active)]"
				onclick={() => (isOpen = !isOpen)}
			>
				<div class="flex flex-col">
					<h3 class="text-base font-semibold text-[var(--color-info)]">{title}</h3>
					{#if description}
						<p class="mt-0.5 text-sm text-[var(--color-info)] opacity-70">{description}</p>
					{/if}
				</div>
				<Icon
					icon="material-symbols:expand-more"
					class="h-5 w-5 text-[var(--color-info)] transition-transform duration-200 {isOpen ? '' : '-rotate-90'}"
				/>
			</button>
		{:else}
			<div class="px-5 py-4">
				<h3 class="text-base font-semibold text-[var(--color-info)]">{title}</h3>
				{#if description}
					<p class="mt-0.5 text-sm text-[var(--color-info)] opacity-70">{description}</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if !collapsible || isOpen}
		<div class="{title ? 'border-t border-[var(--color-outline)]' : ''} px-5 py-4">
			{@render children()}
		</div>
	{/if}
</div>
