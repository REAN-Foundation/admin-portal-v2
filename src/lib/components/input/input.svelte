<script lang="ts">
	let {
		name,
		type = 'text',
		placeholder = '',
		value = $bindable(),
		error = '',
		className = '',
		minlength,
		maxlength,
		// Event handlers
		oninput,
		onchange,
		onfocus,
		onblur,
		onkeydown,
		onkeyup,
		onpaste
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
		value?: string | boolean | number;
		error?: string;
		className?: string;
		minlength?: number;
		maxlength?: number;
		// Event types
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onkeyup?: (e: KeyboardEvent) => void;
		onpaste?: (e: ClipboardEvent) => void;
	}>();
</script>

<div>
	{#if type === 'checkbox'}
		<input
			type="checkbox"
			{name}
			bind:checked={value}
			class={`checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ${error ? 'input-text-error' : ''} ${className}`}
			{onchange}
			{onfocus}
			{onblur}
		/>
	{:else}
		<input
			{name}
			{type}
			{placeholder}
			{minlength}
			{maxlength}
			bind:value
			class={`input placeholder-gray-400 ${error ? 'input-text-error' : ''} ${className}`}
			{oninput}
			{onchange}
			{onfocus}
			{onblur}
			{onkeydown}
			{onkeyup}
			{onpaste}
		/>
	{/if}

	{#if error}
		<p class="error-text">{error}</p>
	{/if}
</div>
