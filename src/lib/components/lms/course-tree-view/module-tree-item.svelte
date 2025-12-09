<script lang="ts">
	import Self from './module-tree-item.svelte';
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
			Name?: string;
			name?: string;
			Sequence?: number;
			Description?: string;
			DurationInMins?: number;
			ParentModuleId?: string | null;
			Children?: Array<any>;
		};
		courseId?: string;
		moduleView?: (courseId: string, moduleId: string) => string | ((moduleId: string) => string);
		contentView?: (courseId: string, moduleId: string, contentId: string) => string | ((contentId: string, moduleId?: string) => string);
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		onModuleExpand?: (moduleId: string, event: Event, courseId?: string) => void;
	}>();

	const moduleKey = $derived(courseId ? `${courseId}-${node.id}` : node.id);
	const displayName = $derived(
		node.Sequence
			? `${node.Sequence} - ${node.Name || node.name || 'Unnamed Module'}`
			: node.Name || node.name || 'Unnamed Module'
	);
	const isExpanded = $derived(expandedModules[moduleKey] === true);
	const hasChildren = $derived(node.Children && node.Children.length > 0);

	// Handle moduleView function signature differences
	const moduleViewWrapper = () => {
		if (!moduleView) return '#';
		
		// If moduleView takes 2 params (courseId, moduleId) - for courses mode
		if (courseId && typeof moduleView === 'function') {
			try {
				return (moduleView as (courseId: string, moduleId: string) => string)(courseId, node.id);
			} catch {
				// Fallback: try single param signature
				return (moduleView as (moduleId: string) => string)(node.id);
			}
		}
		// If moduleView takes 1 param (moduleId) - for modules mode
		else if (typeof moduleView === 'function') {
			return (moduleView as (moduleId: string) => string)(node.id);
		}
		return '#';
	};

	// Handle contentView function signature differences
	const contentViewWrapper = (contentId: string, moduleId?: string) => {
		if (!contentView) return '#';
		
		// If contentView takes 3 params (courseId, moduleId, contentId)
		if (courseId && typeof contentView === 'function') {
			try {
				return (contentView as (courseId: string, moduleId: string, contentId: string) => string)(
					courseId,
					moduleId || node.id,
					contentId
				);
			} catch {
				// Fallback: try 2 param signature
				return (contentView as (contentId: string, moduleId?: string) => string)(
					contentId,
					moduleId || node.id
				);
			}
		}
		// If contentView takes 2 params (contentId, moduleId)
		else if (typeof contentView === 'function') {
			return (contentView as (contentId: string, moduleId?: string) => string)(
				contentId,
				moduleId || node.id
			);
		}
		return '#';
	};

	const handleExpand = (e: Event) => {
		e.preventDefault();
		if (onModuleExpand) {
			onModuleExpand(node.id, e, courseId);
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
	{#if hasChildren}
		<details open={isExpanded} class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600"
				onclick={handleExpand}
				onkeydown={handleKeyDown}
			>
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]"
				>
					{isExpanded ? '-' : '+'}
				</span>
				<Icon icon="iconoir:multiple-pages" width="20" height="20" class="text-[var(--color-info)]" />
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
	{:else}
		<details open={isExpanded} class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-info)] hover:text-blue-600"
				onclick={handleExpand}
				onkeydown={handleKeyDown}
			>
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]"
				>
					{isExpanded ? '-' : '+'}
				</span>
				<Icon icon="iconoir:multiple-pages" width="20" height="20" class="text-[var(--color-info)]" />
				<span class="hover:underline">
					{displayName}
				</span>
			</summary>

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
	{/if}
</div>

<style>
	.tree-connector {
		position: relative;
	}
</style>

