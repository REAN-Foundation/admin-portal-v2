<!-- TextArea.svelte -->
<script lang="ts">
	let {
		name,
		placeholder = '',
		value = $bindable(),
		error = '',
		className = '',
		resize = false,
		rows = 3
	} = $props<{
		name: string;
		placeholder?: string;
		value?: string;
		error?: string;
		className?: string;
		resize?: boolean;
		rows?: number;
	}>();
</script>

<div>
	<textarea
		bind:value
		{name}
		{rows}
		{placeholder}
		class={`input placeholder-gray-400 ${resize ? 'resize-y' : 'resize-none'} ${error ? 'border-error-300' : 'border-primary-200'} ${className}`}
	></textarea>
</div>
