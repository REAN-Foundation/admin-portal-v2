<script lang="ts">
	let {
		name,
		type = 'text',
		placeholder = '',
		value = $bindable(),
		error = '',
		className = ''
	} = $props<{
		name: string;
		type?:
			| 'text'
			| 'password'
			| 'email'
			| 'hidden'
			| 'number'
			| 'search'
			| 'tel'
			| 'url'
			| 'date'
			| 'time';
		placeholder?: string;
		value?: string;
		error?: string;
		className?: string;
	}>();
</script>

<div>
	<input
		bind:value
		{name}
		{type}
		{placeholder}
		class={`input ${error ? 'input-text-error' : ''} ${className}`}
	/>

	{#if error}
		<p class="error-text">{error}</p>
	{/if}
</div>
