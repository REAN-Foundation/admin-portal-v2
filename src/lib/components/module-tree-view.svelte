<script lang="ts">
	import ModuleTreeItem from './module-tree-item.svelte';
	import ContentTreeItem from './content-tree-item.svelte';
	
	let { 
		modules, 
		moduleView,
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		onModuleExpand,
		contentView
	} = $props<{
		modules: Array<{
			id: string;
			Name: string;
			Sequence?: number;
			Description?: string;
			DurationInMins?: number;
			ParentModuleId?: string | null;
			Children?: Array<any>;
		}>;
		moduleView: (moduleId: string) => string;
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		onModuleExpand?: (moduleId: string, event: Event) => void;
		contentView?: (contentId: string, moduleId?: string) => string;
	}>();
</script>

<div class="space-y-2 pl-4 hover:text-black">
	{#each modules as module}
		{#if !module.ParentModuleId || module.ParentModuleId === null}
			<details open={expandedModules[module.id] || false} class="group hover:text-black">
				<summary class="flex cursor-pointer items-center gap-2 font-semibold text-[var(--color-info)]">
					<span class="text-[var(--color-info)]">📚</span>
					<span class="hover:text-black">
						{#if module.Sequence}
							{module.Sequence} - {module.Name}
						{:else}
							{module.Name}
						{/if}
					</span>
				</summary>

				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					{#if module.Children && module.Children.length > 0}
						{#each module.Children as child}
							<ModuleTreeItem 
								node={child} 
								{moduleView}
								bind:expandedModules
								bind:moduleContents
								bind:loadingContents
								{onModuleExpand}
								{contentView}
							/>
						{/each}
					{/if}
					
					<!-- Display contents for this module -->
					{#if expandedModules[module.id] && moduleContents[module.id] !== undefined}
						{#if loadingContents[module.id]}
							<div class="text-sm text-gray-500 italic">Loading contents...</div>
						{:else if moduleContents[module.id] && moduleContents[module.id].length > 0}
							{#each moduleContents[module.id] as content}
								<ContentTreeItem content={content} {contentView} moduleId={module.id} />
							{/each}
						{:else}
							<div class="text-sm text-gray-500 italic">No contents found</div>
						{/if}
					{/if}
				</div>
			</details>
		{/if}
	{/each}
</div>

