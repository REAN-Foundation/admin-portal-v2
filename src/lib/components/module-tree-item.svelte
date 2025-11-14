<script lang="ts">
	import Self from './module-tree-item.svelte';
	import ContentTreeItem from './content-tree-item.svelte';
	
	let { 
		node, 
		moduleView,
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		onModuleExpand,
		contentView
	} = $props<{
		node: {
			id: string;
			Name: string;
			Sequence?: number;
			Description?: string;
			DurationInMins?: number;
			ParentModuleId?: string | null;
			Children?: Array<any>;
		};
		moduleView: (moduleId: string) => string;
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		onModuleExpand?: (moduleId: string, event: Event) => void;
		contentView?: (contentId: string) => string;
	}>();
	
	const hasChildren = $derived(node.Children && node.Children.length > 0);
	const displayName = $derived(node.Sequence ? `${node.Sequence} - ${node.Name}` : node.Name);
</script>

<div class="tree-connector pl-4">
	{#if hasChildren}
		<details 
			open={expandedModules[node.id] || false}
			class="group"
			ontoggle={(e) => {
				if (onModuleExpand) {
					onModuleExpand(node.id, e);
				}
			}}
		>
			<summary class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]">
					→
				</span>
				<span class="hover:underline">
					{displayName}
				</span>
			</summary>
			{#if node.Children && node.Children.length > 0}
				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					{#each node.Children as child}
						<Self 
							node={child} 
							{moduleView}
							bind:expandedModules
							bind:moduleContents
							bind:loadingContents
							{onModuleExpand}
							{contentView}
						/>
					{/each}
				</div>
			{/if}
			
			<!-- Display contents for this module -->
			{#if expandedModules[node.id] && moduleContents[node.id] !== undefined}
				{#if loadingContents[node.id]}
					<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
						<div class="text-sm text-gray-500 italic">Loading contents...</div>
					</div>
				{:else if moduleContents[node.id] && moduleContents[node.id].length > 0}
					<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
						{#each moduleContents[node.id] as content}
							<ContentTreeItem content={content} {contentView} moduleId={node.id} />
						{/each}
					</div>
				{:else}
					<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
						<div class="text-sm text-gray-500 italic">No contents found</div>
					</div>
				{/if}
			{/if}
		</details>
	{:else}
		<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
			<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-white">
				📄
			</span>
			<span class="hover:underline">
				{displayName}
			</span>
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

