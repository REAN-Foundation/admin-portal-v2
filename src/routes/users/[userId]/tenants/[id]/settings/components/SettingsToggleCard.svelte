<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		name: string;
		description?: string;
		icon?: string;
		checked?: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let {
		name,
		description = '',
		icon = 'mdi:cog-outline',
		checked = $bindable(false),
		disabled = false,
		onchange
	}: Props = $props();

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		checked = target.checked;
		onchange?.(checked);
	}
</script>

<div class="settings-toggle-card rounded-xl border p-4 transition-all duration-200
	{checked ? 'border-blue-200 bg-blue-50/50' : 'border-[var(--color-outline)] bg-[var(--color-primary)]'}
	{!disabled ? 'hover:shadow-sm' : 'opacity-60'}">
	<div class="flex items-center justify-between gap-3">
		<!-- Icon -->
		<div class="flex h-10 w-10 items-center justify-center rounded-lg shrink-0
			{checked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-[var(--color-info)]'}">
			<Icon {icon} class="h-5 w-5" />
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<span class="text-sm font-medium text-[var(--color-info)] block truncate">
				{name}
			</span>
			{#if description}
				<p class="text-xs text-[var(--color-info)] opacity-60 line-clamp-2 mt-0.5">
					{description}
				</p>
			{/if}
		</div>

		<!-- Toggle -->
		<label class="relative inline-flex items-center cursor-pointer shrink-0">
			<input
				type="checkbox"
				class="sr-only peer"
				{disabled}
				bind:checked
				onchange={handleChange}
			/>
			<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
		</label>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
