<script lang="ts">
	import Icon from '@iconify/svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////

	let { optionArray = $bindable() } = $props();

	function deleteOption(event, option) {
		event.preventDefault();
		optionArray = optionArray.filter(
			(opt) => opt.Text !== option.Text && opt.Sequence !== option.Sequence
		);
	}

	function addOption(event) {
		event.preventDefault();
		addOptionField();
	}
	
	const addOptionField = () => {
		const newOption = { Text: '', Sequence: optionArray.length + 1, ProviderGivenCode: '' };
		optionArray = [...optionArray, newOption];
	};

	// Auto-update ProviderGivenCode when option text changes
	function updateProviderCode(index) {
		if (optionArray[index] && optionArray[index].Text) {
			optionArray[index].ProviderGivenCode = optionArray[index].Text;
		}
	}
</script>

<div class="dark:border-surface-700 my-2 flex flex-col gap-2 rounded border p-2">
	{#each optionArray as v, i}
		<div class="flex items-center gap-2">
			<input
				type="text"
				class="input"
				name="options"
				bind:value={optionArray[i].Text}
				placeholder="Add option here..."
				onblur={() => updateProviderCode(i)}
				oninput={() => updateProviderCode(i)}
			/>

			<button
				class="health-system-btn variant-soft-secondary"
				onclick={(e) => deleteOption(e, optionArray[i])}
			>
				<Icon icon="material-symbols:close-rounded" />
			</button>
		</div>
	{/each}

	<button class="btn btn-sm variant-soft-secondary" onclick={addOption}> Add Option </button>
</div>
