<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		id,
		title,
		description,
		icon,
		isActive,
		onToggle,
		children
	}: {
		id: string;
		title: string;
		description: string;
		icon: string;
		isActive: boolean;
		onToggle: () => void;
		children: any;
	} = $props();
</script>

<div
	class="my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 {isActive
		? 'border-hover'
		: ''}"
>
	<button
		type="button"
		onclick={onToggle}
		class="flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)] transition-all duration-100 ease-in-out {isActive
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: 'border-hover rounded bg-[var(--color-secondary)]'}"
	>
		<div class="flex flex-1 items-center gap-2">
			<Icon {icon} class="hidden h-5 w-5 md:block" />
			<div class="text-start">
				<p class="text-md font-medium">{title}</p>
				<p class="text-sm text-[var(--color-muted)]">{description}</p>
			</div>
		</div>
		<span class="transition-transform duration-300" class:rotate-90={isActive}>
			<Icon icon="icon-park-outline:down" rotate={35} width={16} height={16} class="h-5 w-5" />
		</span>
	</button>

	{#if isActive}
		<div class="p-6">
			{@render children()}
		</div>
	{/if}
</div>