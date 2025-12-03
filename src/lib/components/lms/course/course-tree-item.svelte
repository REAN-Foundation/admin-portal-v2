<script lang="ts">
	import Self from './course-tree-item.svelte';
	import ContentTable from '../course content/content-table.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	
	let { 
		node, 
		moduleView,
		moduleEdit,
		onModuleDelete,
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		moduleContentCounts = $bindable({}),
		onModuleExpand,
		contentView,
		contentEdit,
		contentCreate,
		onContentDelete,
		selectedContentIds = $bindable({})
	} = $props<{
		node: {
			id: string;
			Name: string;
			Description?: string;
			DurationInMins?: number;
			Sequence?: number;
			CourseId?: string;
			Children?: Array<any>;
		};
		moduleView: (moduleId: string) => string;
		moduleEdit?: (moduleId: string) => string;
		onModuleDelete?: (moduleId: string, courseId?: string) => void;
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		moduleContentCounts?: Record<string, number>;
		onModuleExpand?: (moduleId: string, event: Event) => void;
		contentView?: (courseId: string, moduleId: string, contentId: string) => string;
		contentEdit?: (courseId: string, moduleId: string, contentId: string) => string;
		contentCreate?: (courseId: string, moduleId: string) => string;
		onContentDelete?: (contentId: string) => void;
		selectedContentIds?: Record<string, string | null>;
	}>();
	
	const isExpanded = $derived(expandedModules[node.id] || false);
	const contents = $derived(moduleContents[node.id]);
	const isLoading = $derived(loadingContents[node.id] || false);
	const cachedCount = $derived(moduleContentCounts[node.id]);
	// Use fetched contents count if contents have been fetched, otherwise fall back to cached count or node's ContentCount property
	const contentCount = $derived(
		contents !== undefined
			? contents.length
			: (cachedCount !== undefined
				? cachedCount
				: (node.ContentCount ?? node.ContentsCount ?? node.contentCount ?? node.contentsCount ?? 0))
	);
	
	// Debug logging
	$effect(() => {
		if (isExpanded) {
			console.log('Module expanded:', node.id, 'Contents:', contents, 'Loading:', isLoading);
		}
	});
	
	const handleModuleClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onModuleExpand) {
			onModuleExpand(node.id, event);
		}
	};
	
	const handleModuleNameClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onModuleExpand) {
			onModuleExpand(node.id, event);
		}
	};
	
	const handleDeleteClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onModuleDelete) {
			// Pass both moduleId and courseId if available
			const courseId = node.CourseId;
			if (courseId) {
				onModuleDelete(node.id, courseId);
			} else {
				onModuleDelete(node.id);
			}
		}
	};
	
</script>

<div class="tree-connector px-4 bg-gray-200 rounded-md py-2 mt-1 mb-1">
	<div class="flex items-center justify-between gap-2 text-[var(--color-info)]">
		<div class="flex items-center gap-2 flex-1">
			<button
				type="button"
				onclick={handleModuleClick}
				class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]"
			>
				{#if isExpanded}
					<Icon icon="mdi:chevron-down" class="text-xs" />
				{:else}
					<Icon icon="mdi:chevron-right" class="text-xs" />
				{/if}
			</button>
			<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]">
				📚
			</span>
			<button
				type="button"
				onclick={handleModuleNameClick}
				class="cursor-pointer text-left"
			>
				{node.Sequence ? `${node.Sequence}-` : ''}{node.Name}
			</button>
		</div>
		<div class="flex items-center justify-end gap-2">
			<span class="text-gray-700 text-sm">Contents ({contentCount})</span>
			{#if contentCreate}
				{@const courseId = node.CourseId || ''}
				<Button
					href={contentCreate(courseId, node.id)}
					variant="icon"
					icon="material-symbols:add"
					iconSize="sm"
					tooltip="Add New Content"
				/>
			{/if}
			{#if moduleEdit}
				<Button
					href={moduleEdit(node.id)}
					variant="icon"
					icon="material-symbols:edit-outline"
					iconSize="sm"
					tooltip="Edit"
				/>
			{/if}
			<Button
				href={moduleView(node.id)}
				variant="icon"
				icon="icon-park-outline:preview-open"
				iconSize="sm"
				tooltip="View"
			/>
			{#if onModuleDelete}
				<Button
					onclick={handleDeleteClick}
					variant="icon"
					icon="material-symbols:delete-outline-rounded"
					iconSize="sm"
					color="red"
					tooltip="Delete"
				/>
			{/if}
		</div>
	</div>
	{#if isExpanded}
		<div class="relative py-2 px-4">
			{#if isLoading}
				<div class="flex items-center gap-2 text-gray-500">
					<Icon icon="svg-spinners:ring-resize" class="inline" width="16" />
					<span class="text-sm">Loading contents...</span>
				</div>
			{:else if contents !== undefined && contents.length > 0}
				{@const courseId = node.CourseId || ''}
				<ContentTable 
					contents={contents}
					onContentEdit={contentEdit ? (contentId) => contentEdit(courseId, node.id, contentId) : undefined}
					onContentView={contentView ? (contentId) => contentView(courseId, node.id, contentId) : undefined}
					onContentDelete={onContentDelete}
				/>
			{:else}
				<div class="text-gray-500 italic text-sm">No contents found</div>
			{/if}
		</div>
	{/if}
	{#if node.Children && node.Children.length > 0}
		<div class="relative my-2 ml-4 space-y-2 border-l-2 border-[var(--color-active)] pl-4">
			{#each node.Children as child}
				<Self 
					node={child} 
					{moduleView}
					{moduleEdit}
					{onModuleDelete}
					bind:expandedModules
					bind:moduleContents
					bind:loadingContents
					bind:moduleContentCounts
					{onModuleExpand}
					{contentView}
					{contentEdit}
					{contentCreate}
					{onContentDelete}
					bind:selectedContentIds
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tree-connector {
		position: relative;
	}
</style>

