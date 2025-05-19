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
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type {
		AssessmentNodeOptionUpdateModel
	} from '$lib/types/assessment-node-option.types';
	import { createOrUpdateSchema } from '$lib/validation/assessment-node-option.schema';
	import Icon from '@iconify/svelte';

	// import { createEventDispatcher } from 'svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';

	// export let optionValueStore = [];
	// export let readonly = false;
	let {
	optionValueStore = $bindable(),
	readonly = false,
	updateSequences,
	addOptionField,
	removeOptionField,
	confirmDelete,
	showConfirm,
	optionToDelete,
	mode 
} = $props();

	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	// let errors: Record<string, string> = $state({});
	// let showConfirm = $state(false);
	// let selectedOption = null;

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
	// function addOption() {
	// 	const newOption = { id: null, Text: '', Sequence: optionValueStore.length + 1 };
	// 	optionValueStore = [...optionValueStore, newOption];
	// }

	// function updateOption(index, key, value) {
	// 	optionValueStore[index] = { ...optionValueStore[index], [key]: value };
	// 	optionValueStore = [...optionValueStore];
	// }

	// function removeOption(index) {
	// 	optionValueStore = optionValueStore.filter((_, i) => i !== index);
	// }

	// const templateId = page.params.templateId;
	// const nodeId = page.params.nodeId;

	// let text = $state(undefined),
	// 	sequence = $state(undefined);

	// async function handleSubmit(event) {
	// 	event.preventDefault();

	// 	try {
	// 		const assessmentNodeOptionCreateModel: AssessmentNodeOptionCreateModel = {
	// 			Text: text,
	// 			Sequence: sequence
	// 			// NodeId: nodeId,
	// 			// TemplateId: templateId,
	// 		};

	// 		const validationResult = createOrUpdateSchema.safeParse(assessmentNodeOptionCreateModel);

	// 		if (!validationResult.success) {
	// 			errors = Object.fromEntries(
	// 				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
	// 					key,
	// 					val?.[0] || 'This field is required'
	// 				])
	// 			);
	// 			return;
	// 		}

	// 		const res = await fetch(
	// 			`/api/server/assessments/options?templateId=${templateId}&nodeId=${nodeId}`,
	// 			{
	// 				method: 'POST',
	// 				body: JSON.stringify(assessmentNodeOptionCreateModel),
	// 				headers: { 'content-type': 'application/json' }
	// 			}
	// 		);

	// 		const response = await res.json();

	// 		console.log('response', response, assessmentNodeOptionCreateModel);
	// 		if (response.HttpCode === 201 || response.HttpCode === 200) {
	// 			toastMessage(response);
	// 			// goto(`${assessmentNodeRoutes}/${response?.Data?.AssessmentNode?.id}/view`);
	// 			return;
	// 		}

	// 		if (response.Errors) {
	// 			errors = response?.Errors || {};
	// 		} else {
	// 			toastMessage(response);
	// 		}
	// 	} catch (error) {
	// 		toastMessage();
	// 	}
	// }
	function deleteOption(event, option) {
		event.preventDefault();
		console.log('This is id', option.id);
		console.log('This is target value', event.target.value);
		confirmDelete(option.id);
	}

	function addOption(event) {
		event.preventDefault();
		addOptionField();
	}

	let hoveredIndex = $state(null);
	$inspect('optionValueStore', optionValueStore);
	let errors: Record<string, string> = $state({});
	// API call stub
	const updateOptionOnServer = async (option) => {
		try {
			errors = {};
			console.log('Updating option...', option);

			const optionCreateModel: AssessmentNodeOptionUpdateModel = {
				Text: option.Text,
				Sequence: option.Sequence
			};

			const validationResult = createOrUpdateSchema.safeParse(optionCreateModel);
			console.log('validation result', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			// await fetch(`/api/options/${option.id}`, { method: 'PUT', body: JSON.stringify(option) });
			const res = await fetch(
				`/api/server/assessments/options/${option.id}?templateId=${templateId}&nodeId=${option.NodeId}`,
				{
					method: 'PUT',
					body: JSON.stringify(optionCreateModel),
					headers: { 'content-type': 'application/json' }
				}
			);

			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	const enableEditing = (index) => {
		optionValueStore = optionValueStore.map((opt, i) =>
			i === index ? { ...opt, isEditing: true } : opt
		);
	};

	const saveOption = async (index, event) => {
		event.preventDefault();
		const option = optionValueStore[index];
		await updateOptionOnServer(option);

		optionValueStore = optionValueStore.map((opt, i) =>
			i === index ? { ...opt, isEditing: false } : opt
		);
	};
</script>

<!-- <div class="dark:border-surface-700 my-2 flex flex-col gap-2 rounded border p-2">
	{#each optionValueStore as v, i}
		<div class="flex items-center gap-2">
			<input
				type="text"
				class="input"
				name="options"
				bind:value={optionValueStore[i].Text}
				placeholder="Add option here..."
				disabled={readonly}
			/>
			{#if !readonly}
				<button
					class="health-system-btn variant-soft-secondary"
					onclick={(e)=>deleteOption(e,optionValueStore[i])}	
				>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			{/if}

		</div>
	{/each}

	{#if !readonly}
		<button class="btn btn-sm variant-soft-secondary" onclick={addOption}> Add Option </button>
	{/if}
</div>

<Confirmation bind:isOpen={showConfirm} title="Delete Option" onConfirm={removeOptionField} id={optionToDelete} /> -->

<div class="dark:border-surface-700 my-2 flex flex-col gap-2 rounded border p-2">
	{#each optionValueStore as v, i}
		<div
			role="group"
			class="group flex items-center gap-2"
			onmouseenter={() => mode === 'edit' && (hoveredIndex = i)}
			onmouseleave={() => mode === 'edit' && (hoveredIndex = null)}
		>
			<input
				type="text"
				class="input"
				name="options"
				bind:value={optionValueStore[i].Text}
				placeholder="Add option here..."
				disabled={readonly || (mode === 'edit' && !v.isEditing)}
			/>

			{#if !readonly}
				{#if mode === 'edit'}
					<!-- Save button if editing -->
					{#if v.isEditing}
						<button
							class="health-system-btn variant-soft-primary"
							onclick={() => saveOption(i, event)}
						>
							<Icon icon="material-symbols:check" />
						</button>
					{:else if hoveredIndex === i}
						<!-- Show Edit button only on hover -->
						<button class="health-system-btn variant-soft-secondary" onclick={() => enableEditing(i)}>
							<Icon icon="material-symbols:edit" />
						</button>
					{/if}
				{/if}

				<!-- Delete -->
				<button
					class="health-system-btn variant-soft-secondary"
					onclick={(e) => deleteOption(e, optionValueStore[i])}
				>
					<Icon icon="material-symbols:close-rounded" />
				</button>
			{/if}
		</div>
	{/each}

	{#if !readonly}
		<button class="btn btn-sm variant-soft-secondary" onclick={addOption}>Add Option</button>
	{/if}
</div>

<Confirmation
	bind:isOpen={showConfirm}
	title="Delete Option"
	onConfirm={removeOptionField}
	id={optionToDelete}
/>

