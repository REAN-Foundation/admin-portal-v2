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
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

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
			<Heading text="Edit Drug" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="drugName"
							type="text"
							placeholder="Enter name here..."
							bind:value={drugName}
							error={errors?.DrugName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Generic Name" />
					<td class="table-data">
						<Input
							name="genericName"
							type="text"
							placeholder="Enter generic name here..."
							bind:value={genericName}
							error={errors?.GenericName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Ingredients" />
					<td class="table-data">
						<Input
							name="ingredients"
							type="text"
							placeholder="Enter ingredients here..."
							bind:value={ingredients}
							error={errors?.Ingredients}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Strength" />
					<td class="table-data">
						<select name="strength" class="input" bind:value={strength}>
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
					<Label text="Commercial Name" />
					<td class="table-data">
						<Input
							name="otherCommercialNames"
							type="text"
							placeholder="Enter commercial name here..."
							bind:value={otherCommercialNames}
							error={errors?.OtherCommercialNames}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Manufacturer" />
					<td class="table-data">
						<Input
							name="manufacturer"
							type="text"
							placeholder="Enter manufacturer here..."
							bind:value={manufacturer}
							error={errors?.Manufacturer}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Other Information" />
					<td class="table-data">
						<Input
							name="otherInformation"
							type="text"
							placeholder="Enter other information here..."
							bind:value={otherInformation}
							error={errors?.OtherInformation}
						/>
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
