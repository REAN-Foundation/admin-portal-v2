<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { createOrUpdateSchema } from '$lib/validation/drugs.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { DrugUpdateModel } from '$lib/types/drug.types';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = $state(data.drug.id),
		drugName = $state(data.drug.DrugName),
		genericName = $state(data.drug.GenericName),
		ingredients = $state(data.drug.Ingredients),
		strength = $state(data.drug.Strength),
		otherCommercialNames = $state(data.drug.OtherCommercialNames),
		manufacturer = $state(data.drug.Manufacturer),
		otherInformation = $state(data.drug.OtherInformation);

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

			console.log(drugUpdateModel, 'drugUpdateModel');
			const validationResult = createOrUpdateSchema.safeParse(drugUpdateModel);
			console.log(validationResult, 'validationResult');
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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Drug</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-600">*</span></td>

							<td>
								<input
									type="text"
									class="health-system-input"
									name="drugName"
									placeholder="Enter name here..."
									bind:value={drugName}
								/>
								{#if errors?.DrugName}
									<p class="text-error">{errors?.DrugName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Generic Name</td>
							<td>
								<input
									type="text"
									name="genericName"
									bind:value={genericName}
									placeholder="Enter generic name here..."
									class="health-system-input "
								/>
								{#if errors?.GenericName}
									<p class="text-error">{errors?.GenericName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Ingredients</td>
							<td>
								<input
									type="text"
									name="ingredients"
									bind:value={ingredients}
									placeholder="Enter ingredients here..."
									class="health-system-input "
								/>
								{#if errors?.Ingredients}
									<p class="text-error">{errors?.Ingredients}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Strength</td>
							<td>
								<select
									name="strength"
									bind:value={strength}
									class="health-system-input "
								>
									<option value="High">High</option>
									<option value="Auto">Auto</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
								{#if errors?.Strength}
									<p class="text-error">{errors?.Strength}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Commercial Name</td>
							<td>
								<input
									type="text"
									name="otherCommercialNames"
									bind:value={otherCommercialNames}
									placeholder="Enter commercial name here..."
									class="health-system-input "
								/>
								{#if errors?.OtherCommercialNames}
									<p class="text-error">{errors?.OtherCommercialNames}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Manufacture</td>
							<td>
								<input
									type="text"
									name="manufacturer"
									bind:value={manufacturer}
									placeholder="Enter manufacture here..."
									class="health-system-input "
								/>
								{#if errors?.Manufacturer}
									<p class="text-error">{errors?.Manufacturer}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Other Information</td>
							<td>
								<input
									type="text"
									name="otherInformation"
									bind:value={otherInformation}
									placeholder="Enter other information here..."
									class="health-system-input "
								/>
								{#if errors?.OtherInformation}
									<p class="text-error">{errors?.OtherInformation}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
