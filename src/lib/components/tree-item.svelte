<script lang="ts">
	import Self from './tree-item.svelte';
	let { node, assessmentNodeView } = $props();
</script>

<div class="tree-connector pl-4">
	{#if node.NodeType === 'Node list' && node.Children && node.Children.length > 0}
		<details class="group">
			<summary class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]">
					→
				</span>
				<a class="hover:underline" href={assessmentNodeView(node.id)}>
					{node.Sequence}-{node.NodeType}-{node.Title}
				</a>
			</summary>
			<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
				{#each node.Children as child}
					<Self node={child} {assessmentNodeView} />
				{/each}
			</div>
		</details>
	{:else if node.NodeType === 'Question'}
		<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
			<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white">
				?
			</span>
			<a class="hover:underline" href={assessmentNodeView(node.id)}>
				{node.Sequence}-{node.NodeType}-{node.Title}
			</a>
		</div>
	{:else if node.NodeType === 'Message'}
		<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
			<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white">
				💬
			</span>
			<a class="hover:underline" href={assessmentNodeView(node.id)}>
				{node.Sequence}-{node.NodeType}-{node.Title}
			</a>
		</div>
	{/if}
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