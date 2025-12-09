<script lang="ts">
	import Self from './learning-journey-module-tree-item.svelte';
	import ContentTreeItem from '../course-content/content-tree-item.svelte';
	import Icon from '@iconify/svelte';
	
	let {
		node,
		courseId,
		moduleView,
		contentView,
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		onModuleExpand
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
		courseId: string;
		moduleView: (courseId: string, moduleId: string) => string;
		contentView: (courseId: string, moduleId: string, contentId: string) => string;
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		onModuleExpand?: (moduleId: string, courseId: string, event: Event) => void;
	}>();

	const moduleKey = $derived(`${courseId}-${node.id}`);
	const displayName = $derived(node.Sequence ? `${node.Sequence} - ${node.Name}` : node.Name);
	const isExpanded = $derived(expandedModules[moduleKey] === true);
	
	const contentViewWrapper = (contentId: string, moduleId?: string) => {
		return contentView(courseId, moduleId || node.id, contentId);
	};

	const handleExpand = (e: Event) => {
		e.preventDefault();
		if (onModuleExpand) {
			onModuleExpand(node.id, courseId, e);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleExpand(e);
		}
	};
</script>

<div class="tree-connector pl-4">
	<details 
		open={expandedModules[moduleKey] === true}
		class="group"
	>
		<summary 
			class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600"
			onclick={handleExpand}
			onkeydown={handleKeyDown}
		>
			<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]">
				{isExpanded ? '-' : '+'}
			</span>
			<Icon 
				icon="iconoir:multiple-pages" 
				width="20" 
				height="20" 
				class="text-[var(--color-info)]" 
			/>
			<span class="hover:underline">
				{displayName}
			</span>
		</summary>
		{#if node.Children && node.Children.length > 0}
			<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
				{#each node.Children as child}
					<Self 
						node={child} 
						{courseId}
						{moduleView}
						{contentView}
						bind:expandedModules
						bind:moduleContents
						bind:loadingContents
						{onModuleExpand}
					/>
				{/each}
			</div>
		{/if}
		
		<!-- Display contents for this module -->
		{#if expandedModules[moduleKey] && moduleContents[moduleKey] !== undefined}
			{#if loadingContents[moduleKey]}
				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					<div class="text-sm text-gray-500 italic">Loading contents...</div>
				</div>
			{:else if moduleContents[moduleKey] && moduleContents[moduleKey].length > 0}
				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					{#each moduleContents[moduleKey] as content}
						<ContentTreeItem 
							content={content} 
							contentView={contentViewWrapper} 
							moduleId={node.id} 
						/>
					{/each}
				</div>
			{:else}
				<div class="relative mt-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
					<div class="text-sm text-gray-500 italic">No contents found</div>
				</div>
			{/if}
		{/if}
	</details>
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

