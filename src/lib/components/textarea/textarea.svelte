<script lang="ts">
	let {
		name,
		placeholder = '',
		value = $bindable(),
		error = '',
		className = '',
		resize = false,
		rows = 3,
		minlength,
		maxlength,
		// Events
		oninput,
		onchange,
		onfocus,
		onblur,
		onkeydown,
		onkeyup,
		onpaste,
		onselect
	} = $props<{
		name: string;
		placeholder?: string;
		value?: string;
		error?: string;
		className?: string;
		resize?: boolean;
		rows?: number;
		minlength?: number;
		maxlength?: number;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onkeyup?: (e: KeyboardEvent) => void;
		onpaste?: (e: ClipboardEvent) => void;
		onselect?: (e: Event) => void;
	}>();
</script>

<div>
	<textarea
		bind:value
		{name}
		{rows}
		{placeholder}
		{minlength}
		{maxlength}
		class={`input placeholder-gray-400 ${resize ? 'resize-y' : 'resize-none'} ${error ? 'border-error-300' : 'border-primary-200'} ${className}`}
		{oninput}
		{onchange}
		{onfocus}
		{onblur}
		{onkeydown}
		{onkeyup}
		{onpaste}
		{onselect}
	></textarea>

	{#if error}
		<p class="text-error mt-1">{error}</p>
	{/if}
</div>
