<script lang="ts">
	let {
		name,
		placeholder = '',
		value = $bindable(),
		error = '',
		className = ''
	} = $props<{
		name: string;
		placeholder?: string;
		value?: string;
		error?: string;
		className?: string;
	}>();
</script>

<div>
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<textarea
		bind:value
		{name}
		{placeholder}
		class={`input resize-none ${error ? 'border-error-300' : 'border-primary-200'} ${className}`}
	/>
</div>
