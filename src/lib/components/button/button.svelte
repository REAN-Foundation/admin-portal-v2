<script lang="ts">
	let promise = $state();
</script>

{#await promise}
	<button type="submit" class="table-btn variant-soft-secondary" disabled> Submitting </button>
{:then data}
	<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
{/await}
