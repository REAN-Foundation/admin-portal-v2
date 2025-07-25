<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { AssessmentNodeOptionUpdateModel } from '$lib/types/assessment-node-option.types';
	import { createOrUpdateSchema } from '$lib/validation/assessment-node-option.schema';
	import Icon from '@iconify/svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////

	let { optionArray = $bindable() } = $props();

	let showConfirm = $state(false);
	let optionToDelete = $state(null);

	let hoveredIndex = $state(null);
	let errors: Record<string, string> = $state({});

	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;

	const enableEditing = (index) => {
		optionArray = optionArray.map((opt, i) => (i === index ? { ...opt, isEditing: true } : opt));
	};

	const addOption = () => {
		const newOption = {
			Text: '',
			Sequence: optionArray.length + 1,
			NodeId: nodeId,
			isEditing: true
		};
		optionArray = [...optionArray, newOption];
	};

	const saveOption = async (index, event) => {
		event.preventDefault();
		const option = optionArray[index];

		const optionModel: AssessmentNodeOptionUpdateModel = {
			Text: option.Text,
			Sequence: option.Sequence
		};

		const validationResult = createOrUpdateSchema.safeParse(optionModel);

		if (!validationResult.success) {
			errors = Object.fromEntries(
				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const method = option.id ? 'PUT' : 'POST';
		const endpoint = option.id
			? `/api/server/assessments/options/${option.id}?templateId=${templateId}&nodeId=${option.NodeId}`
			: `/api/server/assessments/options?templateId=${templateId}&nodeId=${nodeId}`;

		const response = await fetch(endpoint, {
			method,
			body: JSON.stringify(optionModel),
			headers: { 'Content-Type': 'application/json' }
		});

		const result = await response.json();

		if (result.HttpCode === 200 || result.HttpCode === 201) {
			toastMessage(result);
			invalidateAll();
			const updatedOption = result.Data?.NodeOption;
			optionArray = optionArray.map((opt, i) =>
				i === index ? { ...updatedOption, isEditing: false } : opt
			);

		} else {
			errors = result?.Errors || {};
			toastMessage(result);
		}
	};

	const deleteOption = (event, option, index) => {
		event.preventDefault();

		if (!option.id) {
			optionArray = optionArray.filter((_, i) => i !== index);
			return;
		}

		optionToDelete = option;
		showConfirm = true;
	};

	const removeOptionField = async (id) => {
		if (optionToDelete) {
			const response = await fetch(
				`/api/server/assessments/options/${id}?nodeId=${nodeId}&templateId=${templateId}`,
				{
					method: 'DELETE',
					headers: { 'content-type': 'application/json' }
				}
			);
			const res = await response.json();

			if (res.HttpCode === 200) {
				optionArray = optionArray.filter(
					(opt) => opt.Text !== optionToDelete.Text && opt.Sequence !== optionToDelete.Sequence
				);
				toastMessage(res);
				invalidateAll();
			} else {
				toastMessage(res);
			}
			optionToDelete = null;
			showConfirm = false;
		}
	};
</script>

<div class="dark:border-surface-700 my-2 flex flex-col gap-2 rounded border p-2">
	{#each optionArray as v, i}
		<div
			role="group"
			class="group flex items-center gap-2"
			onmouseenter={() => (hoveredIndex = i)}
			onmouseleave={() => (hoveredIndex = null)}
		>
			<input
				type="text"
				class="input"
				name="options"
				bind:value={optionArray[i].Text}
				placeholder="Add option here..."
				disabled={!v.isEditing ? true : false}
			/>

			{#if v.isEditing}
				<button class="health-system-btn variant-soft-primary" onclick={(e) => saveOption(i, e)}>
					<Icon icon="material-symbols:check" /> Save
				</button>
			{:else if hoveredIndex === i}
				<button class="health-system-btn variant-soft-secondary" onclick={() => enableEditing(i)}>
					<Icon icon="material-symbols:edit" />
				</button>
			{/if}

			<button
				class="health-system-btn variant-soft-secondary"
				onclick={(e) => deleteOption(e, optionArray[i], i)}
			>
				<Icon icon="material-symbols:close-rounded" />
			</button>
		</div>
	{/each}

	<button class="btn btn-sm variant-soft-secondary" onclick={addOption}>Add Option</button>
</div>

<Confirmation
	bind:isOpen={showConfirm}
	title="Delete Option"
	onConfirm={removeOptionField}
	id={optionToDelete?.id}
/>
