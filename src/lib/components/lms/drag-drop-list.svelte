<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';

	let {
		title,
		items = $bindable(),
		emptyText = 'No items',
		itemLabel = (item: any) => item?.Name ?? item?.name ?? item?.title ?? 'Unnamed',
		dropFromOtherZones = true,
		onItemClick
	} = $props<{
		title: string;
		items: any[];
		emptyText?: string;
		itemLabel?: (item: any) => string;
		dropFromOtherZones?: boolean;
		onItemClick?: (item: any) => void;
	}>();

	const flipDurationMs = 300;

	const handleDndConsider = (e: CustomEvent) => {
		items = e.detail.items;
	};

	const handleDndFinalize = (e: CustomEvent) => {
		items = e.detail.items;
	};

	const handleItemClick = (item: any) => {
		onItemClick?.(item);
	};

	const getItemKey = (item: any) => item?.id ?? item?.Id ?? item?.ID ?? item;
</script>

<div
	class="flex flex-col gap-2 p-2 border border-secondary-100 dark:border-surface-700 rounded min-h-[100px]"
>
	<div class="font-semibold">{title}</div>
	<section
		class="grow"
		use:dndzone={{ items: items, flipDurationMs, dropFromOtherZones } as any}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		{#each items as item (getItemKey(item))}
			<div
				class="px-1 py-0.5 cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
				animate:flip={{ duration: flipDurationMs }}
				onclick={() => handleItemClick(item)}
				role="button"
				tabindex="0"
			>
				{itemLabel(item)}
			</div>
		{/each}
		{#if items.length === 0}
			<div class="text-gray-400 text-sm italic p-2">{emptyText}</div>
		{/if}
	</section>
</div>


