<script lang="ts">
	let { message = 'Data Not Available' } = $props();
</script>

<div class="flex h-64 w-full items-center justify-center rounded-lg border border-[var(--color-outline)] shadow-lg">
	<p class="text-center text-lg text-[var(--color-info)]">{message}</p>
</div>
