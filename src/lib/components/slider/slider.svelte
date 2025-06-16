<script lang="ts">
	let {
		value = $bindable(),
		min = 0,
		max = 100,
		step = 0.1,
		id = 'range',
		disabled = false,
		className = ''
	} = $props<{
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		id?: string;
		disabled?: boolean;
		className?: string;
	}>();
</script>

<div class="w-full rounded-lg">
	<input
		type="range"
		{id}
		class={`w-full accent-blue-500 disabled:opacity-50 ${className}`}
		{min}
		{max}
		{step}
		bind:value
		{disabled}
	/>
</div>
