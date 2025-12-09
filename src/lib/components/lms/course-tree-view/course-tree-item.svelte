<script lang="ts">
	import ModuleTreeItem from './module-tree-item.svelte';
	import Icon from '@iconify/svelte';

	let {
		node,
		index,
		courseView,
		moduleView,
		contentView,
		expandedCourses = $bindable({}),
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		courseModules = $bindable({}),
		loadingModules = $bindable({}),
		onCourseExpand,
		onModuleExpand
	} = $props();

	const courseId = $derived(node.id || node.Id);
	const isExpanded = $derived(expandedCourses[courseId] === true);
	const modules = $derived(courseModules[courseId] || []);
	const isLoadingModules = $derived(loadingModules[courseId] === true);
	const displayName = $derived(node.Name || node.name || 'Unnamed Course');
</script>

<details open={isExpanded} class="group hover:text-black">
	<summary
		class="flex cursor-pointer items-center gap-2 font-semibold text-[var(--color-info)]"
		onclick={(e) => {
			e.preventDefault();
			if (onCourseExpand) {
				onCourseExpand(courseId, e);
			}
		}}
	>
		<span
			class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]"
		>
			{isExpanded ? '-' : '+'}
		</span>
		<Icon icon="iconoir:book" width="20" height="20" class="text-[var(--color-info)]" />
		<span class="hover:text-black">
			{index + 1} - {displayName}
		</span>
	</summary>

	<div class="relative mt-2 ml-4 space-y-2 pl-4">
		{#if isLoadingModules}
			<div class="text-sm text-gray-500 italic">Loading modules...</div>
		{:else if modules && modules.length > 0}
			{#each modules as module}
				{#if !module.ParentModuleId || module.ParentModuleId === null}
					<ModuleTreeItem
						node={module}
						{courseId}
						{moduleView}
						{contentView}
						bind:expandedModules
						bind:moduleContents
						bind:loadingContents
						{onModuleExpand}
					/>
				{/if}
			{/each}
		{:else}
			<div class="text-sm text-gray-500 italic">No modules found</div>
		{/if}
	</div>
</details>

