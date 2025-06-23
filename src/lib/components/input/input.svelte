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
			| 'time'
			| 'checkbox';
		placeholder?: string;
		value?: string | boolean;
		error?: string;
		className?: string;
	}>();
</script>

<div>
	{#if type === 'checkbox'}
		<input
			type="checkbox"
			{name}
			bind:checked={value}
			class={`checkbox  checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md  ${error ? 'input-text-error' : ''} ${className}`}
		/>
	{:else}
		<input
			{name}
			{type}
			{placeholder}
			bind:value
			class={`input  placeholder-gray-400 ${error ? 'input-text-error' : ''} ${className}`}
		/>
	{/if}

	{#if error}
		<p class="error-text">{error}</p>
	{/if}
</div>
