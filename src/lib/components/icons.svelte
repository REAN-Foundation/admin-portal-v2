<script lang="ts">
	let { cls, w, h, iconPath } = $props();
</script>

<div class="h-8 w-12">
	<svg class={cls} width={w} height={h} xmlns="http://www.w3.org/2000/svg">
		<use xlink:href={iconPath} />
	</svg>
</div>
