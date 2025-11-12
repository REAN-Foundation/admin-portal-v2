<script lang="ts">
	let { node, contentView } = $props<{
		node: {
			id: string;
			Title: string;
			Description?: string;
			DurationInMins?: number;
			Sequence?: number;
			ContentType?: string;
		};
		contentView: (contentId: string) => string;
	}>();
</script>

<div class="tree-connector pl-4">
	<div class="flex items-center gap-2 text-[var(--color-info)] hover:text-blue-600">
		<span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm text-[var(--color-info)]">
			📄
		</span>
		<a class="hover:underline" href={contentView(node.id)}>
			{node.Sequence ? `${node.Sequence}-` : ''}{node.Title}
		</a>
	</div>
</div>

<style>
	.tree-connector {
		position: relative;
	}
</style>

