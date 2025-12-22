<script lang="ts">
	import CharacterCounter from './CharacterCounter.svelte';

	let {
		id,
		label,
		value = $bindable(),
		disabled,
		placeholder = '',
		required = false,
		type = 'text',
		rows = 3,
		maxlength,
		characterStatus
	}: {
		id: string;
		label: string;
		value: string;
		disabled: boolean;
		placeholder?: string;
		required?: boolean;
		type?: 'text' | 'textarea';
		rows?: number;
		maxlength?: number;
		characterStatus?: { length: number; limits: { min: number; max: number }; isValid: boolean };
	} = $props();
</script>

<div class="my-2 flex flex-col md:flex-row md:items-start">
	<label for={id} class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0">
		{label}
		{#if required}<span class="text-[var(--color-error)]">*</span>{/if}
	</label>
	<div class="w-[70%] flex flex-col gap-1">
		{#if type === 'textarea'}
			<textarea
				{id}
				{rows}
				bind:value
				{maxlength}
				{disabled}
				{placeholder}
				class="input-field"
			></textarea>
		{:else}
			<input type="text" {id} bind:value {maxlength} {disabled} {placeholder} class="input-field" />
		{/if}
		{#if characterStatus}
			<CharacterCounter
				length={characterStatus.length}
				max={characterStatus.limits.max}
				min={characterStatus.limits.min}
				isValid={characterStatus.isValid}
			/>
		{/if}
	</div>
</div>