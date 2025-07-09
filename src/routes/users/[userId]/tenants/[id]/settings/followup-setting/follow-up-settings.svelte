<script lang="ts">
	import Icon from '@iconify/svelte';

	let { model = $bindable(), disabled } = $props();

	let newParamKey = $state('');
	let newParamValue = $state('');

	function addQueryParam() {
		if (newParamKey.trim() && newParamValue.trim()) {
			model = {
				...model,
				[newParamKey.trim()]: newParamValue.trim()
			};

			newParamKey = '';
			newParamValue = '';
		}
	}

	function removeQueryParam(key: string) {
		const updatedModel = { ...model };
		delete updatedModel[key];
		model = updatedModel;
	}
</script>

<div class="my-2 flex gap-2">
	<input
		type="text"
		placeholder="Key"
		class="w-1/2 rounded border p-2 text-sm text-[var(--color-info)]"
		bind:value={newParamKey}
		{disabled}
	/>
	<input
		type="text"
		placeholder="Value"
		class="w-1/2 rounded border p-2 text-sm text-[var(--color-info)]"
		bind:value={newParamValue}
		{disabled}
	/>
</div>
<button
	type="button"
	class="table-btn variant-filled-secondary gap-1"
	onclick={addQueryParam}
	{disabled}
>
	Add
</button>

{#if Object.keys(model)}
	{#each Object.entries(model) as [key, value]}
		<div
			class="mt-1 flex items-center justify-between rounded border border-[var(--color-outline)] bg-[var(--color-secondary)] px-2 py-1 text-sm text-[var(--color-info)]"
		>
			<span class="truncate">{key}: {value}</span>
			<button
				class="health-system-btn !text-red-600"
				onclick={() => removeQueryParam(key)}
				{disabled}
			>
				<Icon icon="material-symbols:delete-outline-rounded" height="15" width="15" />
			</button>
		</div>
	{/each}
{/if}
