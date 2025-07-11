<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { createOrUpdateSchema } from '$lib/validation/drugs.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { DrugUpdateModel } from '$lib/types/drug.types';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = $state(data.drug.id),
		drugName = $state(data.drug.DrugName ?? undefined),
		genericName = $state(data.drug.GenericName ?? undefined),
		ingredients = $state(data.drug.Ingredients ?? undefined),
		strength = $state(data.drug.Strength ?? undefined),
		otherCommercialNames = $state(data.drug.OtherCommercialNames ?? undefined),
		manufacturer = $state(data.drug.Manufacturer ?? undefined),
		otherInformation = $state(data.drug.OtherInformation ?? undefined);

	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	const drugId = page.params.id;
	const editRoute = `/users/${userId}/drugs/${id}/edit`;
	const viewRoute = `/users/${userId}/drugs/${id}/view`;
	const drugsRoute = `/users/${userId}/drugs`;
	const breadCrumbs = [
		{ name: 'Drugs', path: drugsRoute },
		{ name: 'Edit', path: editRoute }
	];

	function handleReset() {
		drugName = data?.drug?.DrugName;
		genericName = data?.drug?.GenericName;
		ingredients = data?.drug?.Ingredients;
		strength = data?.drug?.Strength;
		otherCommercialNames = data?.drug?.OtherCommercialNames;
		manufacturer = data?.drug?.Manufacturer;
		otherInformation = data?.drug?.OtherInformation;
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const drugUpdateModel: DrugUpdateModel = {
				DrugName: drugName,
				GenericName: genericName,
				Ingredients: ingredients,
				Strength: strength,
				OtherCommercialNames: otherCommercialNames,
				Manufacturer: manufacturer,
				OtherInformation: otherInformation
			};

			const validationResult = createOrUpdateSchema.safeParse(drugUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/drugs/${drugId}`, {
				method: 'PUT',
				body: JSON.stringify(drugUpdateModel),
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Drug</h2>
			<a href={viewRoute} class="form-cancel-btn">
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
							class="input {errors?.drugName ? 'input-text-error' : ''}"
							name="drugName"
							placeholder="Enter name here..."
							bind:value={drugName}
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
							name="genericName"
							bind:value={genericName}
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
							name="ingredients"
							bind:value={ingredients}
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
						<div class="relative">
						<select name="strength" bind:value={strength} class="select {errors?.strength ? 'input-text-error' : ''}">
							<option value="High">High</option>
							<option value="Auto">Auto</option>
							<option value="Medium">Medium</option>
							<option value="Low">Low</option>
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
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
							name="otherCommercialNames"
							bind:value={otherCommercialNames}
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
							name="manufacturer"
							bind:value={manufacturer}
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
							name="otherInformation"
							bind:value={otherInformation}
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
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
