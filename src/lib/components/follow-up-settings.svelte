<script lang="ts">
	let { model } = $props();

	let newParamKey = $state('');
	let newParamValue = $state('');

	// Ensure QueryParams is initialized as an object
	if (!model) {
		model = {};
	}

	function addQueryParam() {
		if (newParamKey && newParamValue) {
			// clone existing object to trigger reactivity
			model = {
				...model,
				[newParamKey]: newParamValue
			};

			// reset inputs
			newParamKey = '';
			newParamValue = '';
		}
	}
	function removeQueryParam(key: string) {
		const current = { ...model };
		delete current[key];
		model = current;
	}
</script>

<td>
	<!-- Add button -->

	<!-- Inputs -->
	<div class="mb-2 flex gap-2">
		<input placeholder="Key" class="w-1/2 rounded border p-2 text-sm" bind:value={newParamKey} />
		<input
			placeholder="Value"
			class="w-1/2 rounded border p-2 text-sm"
			bind:value={newParamValue}
		/>
	</div>

	<!-- List of added key-value pairs -->
	{#if model}
		{#each Object.entries(model) as [key, value]}
			<div
				class="mb-1 flex items-center justify-between rounded border bg-gray-50 px-2 py-1 text-sm"
			>
				<span class="truncate">{key}: {value}</span>
				<button
					class="text-xs text-red-500 hover:underline"
					onclick={(event) => {
						event.preventDefault();
						removeQueryParam(key);
					}}
				>
					Remove
				</button>
			</div>
		{/each}
	{/if}
    
	<button
		class="mb-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
		onclick={addQueryParam}
	>
		Add Param
	</button>
</td>
