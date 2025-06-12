<script lang="ts">
	let { text = '', className = '' } = $props<{
		text?: string;
		className?: string;
	}>();
</script>

<h2 class={`form-titles ${className}`}>
	{text}
</h2>
