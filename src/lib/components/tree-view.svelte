<script lang="ts">
	import TreeItem from './tree-item.svelte';
	let { assessmentNodes, assessmentNodeView } = $props();
</script>

<div class="space-y-2 pl-4 hover:text-black">
	{#each assessmentNodes as node}
		{#if node.ParentNodeId === null}
			<details open class="group hover:text-black">
				<summary class="flex cursor-pointer items-center gap-2 font-semibold text-[var(--color-info)]">
					<span class="text-[var(--color-info)]">🗂️</span>
					<span class="hover:text-black">{node.Title}</span>
				</summary>

				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					{#each node.Children as child}
						<TreeItem node={child} {assessmentNodeView} />
					{/each}
				</div>
			</details>
		{/if}
	{/each}
</div>

<style>
	.tree-connector {
		position: relative;
	}
	.tree-connector::before {
		content: '';
		position: absolute;
		top: 1rem;
		left: -1rem;
		width: 1rem;
		height: 2px;
		background-color: #7e22ce;
	}
</style>
