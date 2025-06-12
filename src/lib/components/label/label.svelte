<!-- label.svelte  -->
<script lang="ts">
	let {
		text = '',
		required = false,
		className = ''
	} = $props<{
		text?: string;
		required?: boolean;
		className?: string;
	}>();
</script>

<td class={`table-label ${className}`}>
	{text}
	{#if required}
		<span class="important-field">*</span>
	{/if}
</td>
