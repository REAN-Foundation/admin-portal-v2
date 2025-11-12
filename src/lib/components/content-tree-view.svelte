<script lang="ts">
	import ContentTreeItem from './content-tree-item.svelte';
	
	let { contents, contentView } = $props<{
		contents: Array<{
			id: string;
			Title: string;
			Description?: string;
			DurationInMins?: number;
			Sequence?: number;
			ContentType?: string;
			ModuleId?: string;
		}>;
		contentView: (contentId: string) => string;
	}>();
</script>

<div class="space-y-2 pl-4 hover:text-black">
	{#if contents && contents.length > 0}
		{#each contents as content}
			<ContentTreeItem node={content} {contentView} />
		{/each}
	{:else}
		<div class="text-gray-500 italic pl-4">No contents found</div>
	{/if}
</div>

