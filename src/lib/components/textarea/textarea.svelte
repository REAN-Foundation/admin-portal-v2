<!-- TextArea.svelte -->
<script lang="ts">
	let {
		name,
		placeholder = '',
		value = $bindable(),
		error = '',
		className = '',
		resize = false
	} = $props<{
		name: string;
		placeholder?: string;
		value?: string;
		error?: string;
		className?: string;
		resize?: boolean;
	}>();
</script>

<div>
	<textarea
		bind:value
		{name}
		{placeholder}
		class={`input ${resize ? 'resize-y' : 'resize-none'} ${error ? 'border-error-300' : 'border-primary-200'} ${className}`}
	></textarea>
</div>
