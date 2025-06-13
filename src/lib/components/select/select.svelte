<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		name,
		value = $bindable(),
		options = [] as string[],
		placeholder = 'Select an option...',
		error = '',
		className = ''
	} = $props<{
		name: string;
		value?: string;
		options?: string[];
		placeholder?: string;
		error?: string;
		className?: string;
	}>();
</script>

<div class="w-full">
	<div class="relative">
		<select
			{name}
			bind:value
			class={`input  appearance-none rounded-lg border
				${error ? 'input-text-error ' : ''} 
				${className}`}
		>
			<option disabled selected hidden>{placeholder}</option>
			{#each options as opt}
				<option value={opt}>{opt}</option>
			{/each}
		</select>

		<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
			<Icon icon="lsicon:down-filled" class="h-5 w-5" />
		</div>
	</div>

	{#if error}
		<p class="text-error">{error}</p>
	{/if}
</div>
