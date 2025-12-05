<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';

	let { title, selectedItems = $bindable(), onItemClick } = $props<{
		title: string;
		selectedItems: any[];
		onItemClick?: (item: any) => void;
	}>();

	const flipDurationMs = 300;

	const handleDndConsider = (e: CustomEvent) => {
		selectedItems = e.detail.items;
	};

	const handleDndFinalize = (e: CustomEvent) => {
		selectedItems = e.detail.items;
	};

	const handleItemClick = (item: any) => {
		if (onItemClick) {
			onItemClick(item);
		}
	};
</script>

<div
	class="flex flex-col gap-2 p-2 border border-secondary-100 dark:border-surface-700 rounded min-h-[100px]"
>
	<div class="font-semibold">{title}</div>
	<section
		class="grow"
		use:dndzone={{ items: selectedItems, flipDurationMs, dropFromOtherZones: true } as any}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		{#each selectedItems as item (item.id)}
			<div
				class="px-1 py-0.5 cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
				animate:flip={{ duration: flipDurationMs }}
				onclick={() => handleItemClick(item)}
				role="button"
				tabindex="0"
			>
				{item.Name}
			</div>
		{/each}
		{#if selectedItems.length === 0}
			<div class="text-gray-400 text-sm italic p-2">No courses selected</div>
		{/if}
	</section>
</div>

