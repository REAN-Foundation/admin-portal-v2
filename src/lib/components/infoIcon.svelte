<script lang="ts">
	let { cls, w, h, iconPath, title } = $props();
</script>

<div class="h-8 w-12">
	<svg class={cls} width={w} height={h} xmlns="http://www.w3.org/2000/svg">
		{#if title}
			<title>{title}</title>
		{/if}
		<use xlink:href={iconPath} />
	</svg>
</div>
