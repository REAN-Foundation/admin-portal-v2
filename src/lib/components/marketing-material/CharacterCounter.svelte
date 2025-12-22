<script lang="ts">
	let {
		length,
		max,
		min = 0,
		isValid
	}: {
		length: number;
		max: number;
		min?: number;
		isValid: boolean;
	} = $props();
</script>

<span class="text-xs {isValid ? 'text-[var(--color-muted)]' : 'text-[var(--color-error)]'}">
	{length} / {max} characters{#if min !== undefined && min > 0}
		(min: {min}){/if}
</span>
