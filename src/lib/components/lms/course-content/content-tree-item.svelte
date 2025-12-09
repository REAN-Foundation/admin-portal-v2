<script lang="ts">
	import Icon from '@iconify/svelte';
	
	let { content, contentView, moduleId } = $props<{
		content: {
			id: string;
			Title: string;
			Sequence?: number;
			Description?: string;
			DurationInMins?: number;
			ContentType?: string;
			ModuleId?: string;
		};
		contentView?: (contentId: string, moduleId?: string) => string;
		moduleId?: string;
	}>();
	
	const displayName = $derived(content.Sequence ? `${content.Sequence} - ${content.Title}` : content.Title);
	const viewUrl = $derived(contentView ? contentView(content.id, moduleId || content.ModuleId) : '#');
</script>

<div class="tree-connector pl-4">
	<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
		<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm">
			<Icon 
				icon="iconoir:empty-page" 
				width="16" 
				height="16" 
				 
			/>
		</span>
		{#if contentView}
			<a class="hover:underline" href={viewUrl}>
				{displayName}
			</a>
		{:else}
			<span>{displayName}</span>
		{/if}
	</div>
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
