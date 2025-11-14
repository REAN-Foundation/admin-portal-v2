<script lang="ts">
	import CourseTreeItem from './course-tree-item.svelte';
	
	let { 
		modules, 
		moduleView,
		moduleEdit,
		onModuleDelete,
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		onModuleExpand,
		contentView,
		contentEdit,
		contentCreate,
		onContentDelete,
		selectedContentIds = $bindable({})
	} = $props<{
		modules: Array<{
			id: string;
			Name: string;
			Description?: string;
			DurationInMins?: number;
			Sequence?: number;
			CourseId?: string;
			ParentModuleId?: string | null;
			Children?: Array<any>;
		}>;
		moduleView: (moduleId: string) => string;
		moduleEdit?: (moduleId: string) => string;
		onModuleDelete?: (moduleId: string, courseId?: string) => void;
		expandedModules?: Record<string, boolean>;
		moduleContents?: Record<string, any[]>;
		loadingContents?: Record<string, boolean>;
		onModuleExpand?: (moduleId: string, event: Event) => void;
		contentView?: (courseId: string, moduleId: string, contentId: string) => string;
		contentEdit?: (courseId: string, moduleId: string, contentId: string) => string;
		contentCreate?: (courseId: string, moduleId: string) => string;
		onContentDelete?: (contentId: string) => void;
		selectedContentIds?: Record<string, string | null>;
	}>();
</script>

<div class="space-y-2 pl-4">
	{#if modules && modules.length > 0}
		{#each modules as module}
			<CourseTreeItem 
				node={module} 
				{moduleView}
				{moduleEdit}
				{onModuleDelete}
				bind:expandedModules
				bind:moduleContents
				bind:loadingContents
				{onModuleExpand}
				{contentView}
				{contentEdit}
				{contentCreate}
				{onContentDelete}
				bind:selectedContentIds
			/>
		{/each}
	{:else}
		<div class="text-gray-500 italic pl-4">No modules found</div>
	{/if}
</div>

