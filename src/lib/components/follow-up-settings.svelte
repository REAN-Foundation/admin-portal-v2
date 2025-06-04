<script lang="ts">
	import Icon from "@iconify/svelte";

	let { model = $bindable() } = $props();

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

<button type="button" class="table-btn variant-filled-secondary gap-1" onclick={addQueryParam}>
	Add New
</button>
<div class="my-2 flex gap-2">
	<input
		type="text"
		placeholder="Key"
		class="w-1/2 rounded border p-2 text-sm"
		bind:value={newParamKey}
	/>
	<input
		type="text"
		placeholder="Value"
		class="w-1/2 rounded border p-2 text-sm"
		bind:value={newParamValue}
	/>
</div>

{#if Object.keys(model).length}
	{#each Object.entries(model) as [key, value]}
		<div class="mb-1 flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-sm">
			<span class="truncate">{key}: {value}</span>
			<button class="health-system-btn !text-red-600" onclick={() => removeQueryParam(key)}>
				<Icon icon="material-symbols:delete-outline-rounded" height=15 width=15 />
			</button>
		</div>
	{/each}
{/if}

