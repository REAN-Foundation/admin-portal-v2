<!-- <script lang="ts">
	import Icon from '@iconify/svelte';

	export let optionValueStore = [{ Text: '' }];
	export let readonly = false;

	const addOptionField = () => (optionValueStore = [...optionValueStore, { Text: '' }]);
	const removeOptionField = (value?: string) => {
    optionValueStore = optionValueStore.filter(optionValue => optionValue.Text !== value);
  }
		
</script> -->

<!-- <div class="border dark:border-surface-700 flex flex-col rounded my-2 p-2 gap-2">
	{#each optionValueStore as v, i}
		<div class="flex items-center gap-2">
			<input
				type="text"
				class="input"
				name="options"
        required
				bind:value={optionValueStore[i].Text}
				placeholder="Add option here..."
				disabled={readonly}
			/>
			{#if !readonly} 
				<button class="btn p-2 variant-soft-error" on:click|preventDefault={removeOptionField(optionValueStore[i].Text)}>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			{/if}
		</div>
	{/each}
	
	{#if !readonly} 
		<button class="btn btn-sm variant-soft-secondary" on:click|preventDefault={addOptionField}>
			Add Option
		</button>
	{/if}
</div> -->

<script lang="ts">
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Icon from '@iconify/svelte';
	// import { createEventDispatcher } from 'svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';

	// export let optionValueStore = [];
	// export let readonly = false;
	let {
		optionValueStore = $bindable(),
		readonly= false,
		addOptionField,
		confirmDelete,
		removeOptionField,
		showConfirm,
		updateSequences
	} = $props();

	// let showConfirm = $state(false);
	let selectedOption = null;

	// const addOptionField = () => {
	//     const newOption = { id: null, Text: '', Sequence: optionValueStore.length + 1 };
	//     optionValueStore = [...optionValueStore, newOption];
	//     dispatch('update', optionValueStore);
	// };

	// const removeOptionField = (option) => {
	//     optionValueStore = optionValueStore.filter((opt) => opt.id !== option.id);
	//     dispatch('update', optionValueStore);
	// };

	// const confirmDelete = (option) => {
	// 	if (option.id) {
	// 		selectedOption = option;
	// 		showConfirm = true;
	// 	} else {
	// 		optionValueStore = optionValueStore.filter((opt) => opt.Text !== option.Text);
	// 	}
	// };
</script>

<div class="dark:border-surface-700 my-2 flex flex-col gap-2 rounded border p-2">
	{#each optionValueStore as v, i}
		<div class="flex items-center gap-2">
			<input
				type="text"
				class="input"
				name="options"
				required
				bind:value={optionValueStore[i].Text}
				placeholder="Add option here..."
				disabled
			/>
			{#if !readonly}
				<button
					class="btn variant-soft-error p-2"
					onclick={() => confirmDelete(optionValueStore[i])}
				>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			{/if}
		</div>
	{/each}

	{#if !readonly}
		<button class="btn btn-sm variant-soft-secondary" onclick={addOptionField}>
			Add Option
		</button>
	{/if}

	<!-- {#if showConfirm}
		<Confirm
			confirmTitle="Delete"
			cancelTitle="Cancel"
			bind:showDialog={showConfirm}
			on:delete={removeOptionField}
		>
			<span slot="title">Delete Option</span>
			<span slot="description"
				>Are you sure you want to delete this option? This action cannot be undone.</span
			>
		</Confirm>
	{/if} -->
</div>
<Confirmation
	bind:isOpen={showConfirm}
	title="Delete Option"
	onConfirm={removeOptionField}

/>