<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: string;
		collapsible?: boolean;
		defaultOpen?: boolean;
		children?: any;
	}

	let {
		title,
		description = '',
		icon = 'mdi:cog-outline',
		collapsible = true,
		defaultOpen = false,
		children
	}: Props = $props();

	let isOpen = $state(defaultOpen);

	function toggle() {
		if (collapsible) {
			isOpen = !isOpen;
		}
	}
</script>

<div class="settings-section rounded-lg border border-[var(--color-outline)] bg-[var(--color-primary)] overflow-hidden mb-4 transition-all duration-200
	{isOpen ? 'ring-2 ring-blue-100' : ''}">
	<!-- Section Header -->
	<button
		type="button"
		onclick={toggle}
		class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-200
			{collapsible ? 'hover:bg-[var(--color-secondary)] cursor-pointer' : 'cursor-default'}
			{isOpen ? 'bg-[var(--color-secondary)]' : ''}"
		disabled={!collapsible}
	>
		<div class="flex items-center gap-3 flex-1 min-w-0">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg shrink-0
				{isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-[var(--color-info)]'}">
				<Icon {icon} class="h-5 w-5" />
			</div>
			<div class="min-w-0">
				<h3 class="font-medium text-[var(--color-info)] truncate">
					{title}
				</h3>
				{#if description}
					<p class="text-sm text-[var(--color-info)] opacity-60 truncate">
						{description}
					</p>
				{/if}
			</div>
		</div>

		{#if collapsible}
			<div class="shrink-0">
				<Icon
					icon="mdi:chevron-down"
					class="h-5 w-5 text-[var(--color-info)] transition-transform duration-200
						{isOpen ? 'rotate-180' : ''}"
				/>
			</div>
		{/if}
	</button>

	<!-- Section Content -->
	{#if !collapsible || isOpen}
		<div class="section-content px-5 py-4 bg-[var(--color-secondary)] border-t border-[var(--color-outline)]">
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</div>

<style>
	.section-content {
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
