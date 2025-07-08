<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { DrugCreateModel } from '$lib/types/drug.types.js';
	import { createOrUpdateSchema } from '$lib/validation/drugs.schema.js';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	let errors: Record<string, string> = $state({});
	let drugName = $state(undefined),
		genericName = $state(undefined),
		ingredients = $state(undefined),
		strength = $state(undefined),
		otherCommercialNames = $state(undefined),
		manufacturer = $state(undefined),
		otherInformation = $state(undefined);

	let promise = $state();

	data.title = 'Clinical-Drugs Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/drugs/create`;
	const drugsRoute = `/users/${userId}/drugs`;

	const breadCrumbs = [
		{ name: 'Drugs', path: drugsRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const drugCreateModel: DrugCreateModel = {
				DrugName: drugName,
				GenericName: genericName,
				Ingredients: ingredients,
				Strength: strength,
				OtherCommercialNames: otherCommercialNames,
				Manufacturer: manufacturer,
				OtherInformation: otherInformation
			};

			const validationResult = createOrUpdateSchema.safeParse(drugCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			console.log(drugCreateModel, 'labRecordCreateModel');
			const res = await fetch(`/api/server/drugs`, {
				method: 'POST',
				body: JSON.stringify(drugCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${drugsRoute}/${response?.Data?.Drug?.id}/view`);
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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Drug</h2>
			<a href={drugsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							bind:value={drugName}
							class="input {errors?.drugName ? 'input-text-error' : ''}"
							name="drugName"
							placeholder="Enter name here..."
						/>
						{#if errors?.DrugName}
							<p class="text-error">{errors?.DrugName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Generic Name</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={genericName}
							name="genericName"
							placeholder="Enter generic name here..."
							class="input {errors?.genericName ? 'input-text-error' : ''}"
						/>
						{#if errors?.GenericName}
							<p class="text-error">{errors?.GenericName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Ingredients</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={ingredients}
							name="ingredients"
							placeholder="Enter ingredients here..."
							class="input {errors?.ingredients ? 'input-text-error' : ''}"
						/>
						{#if errors?.Ingredients}
							<p class="text-error">{errors?.Ingredients}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Strength</td>
					<td class="table-data">
						<select
							name="strength"
							class="input {errors?.strength ? 'input-text-error' : ''}"
							bind:value={strength}
						>
							<option value="High">High</option>
							<option value="Auto">Auto</option>
							<option value="Medium">Medium</option>
							<option value="Low">Low</option>
						</select>
						{#if errors?.Strength}
							<p class="text-error">{errors?.Strength}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Commercial Name</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={otherCommercialNames}
							name="otherCommercialNames"
							placeholder="Enter commercial name here..."
							class="input {errors?.otherCommercialNames ? 'input-text-error' : ''}"
						/>
						{#if errors?.OtherCommercialNames}
							<p class="text-error">{errors?.OtherCommercialNames}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Manufacture</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={manufacturer}
							name="manufacturer"
							placeholder="Enter manufacture here..."
							class="input {errors?.manufacturer ? 'input-text-error' : ''}"
						/>
						{#if errors?.Manufacturer}
							<p class="text-error">{errors?.Manufacturer}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Other Information</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={otherInformation}
							name="otherInformation"
							placeholder="Enter other information here..."
							class="input {errors?.otherInformation ? 'input-text-error' : ''}"
						/>
						{#if errors?.OtherInformation}
							<p class="text-error">{errors?.OtherInformation}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
