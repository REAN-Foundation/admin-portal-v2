<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.drug.id;
	let drugName = data.drug.DrugName;
	let genericName = data.drug.GenericName;
	let ingredients = data.drug.Ingredients;
	let strength = data.drug.Strength;
	let otherCommercialNames = data.drug.OtherCommercialNames;
	let manufacturer = data.drug.Manufacturer;
	let otherInformation = data.drug.OtherInformation;

	//Original data
	let _drugName = drugName;
	let _genericName = genericName;
	let _ingredients = ingredients;
	let _strength = strength;
	let _otherCommercialNames = otherCommercialNames;
	let _manufacturer = manufacturer;
	let _otherInformation = otherInformation;

	function handleReset() {
		drugName = _drugName;
		genericName = _genericName;
		ingredients = _ingredients;
		strength = _strength;
		otherCommercialNames = _otherCommercialNames;
		manufacturer = _manufacturer;
		otherInformation = _otherInformation;
	}

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/drugs/${id}/edit`;
	const viewRoute = `/users/${userId}/drugs/${id}/view`;
	const drugsRoute = `/users/${userId}/drugs`;

	const breadCrumbs = [
		{ name: 'Drugs', path: drugsRoute },
		{ name: 'Edit', path: editRoute }
	];

	function handleSubmit() {
		isSubmitting = true;
	}
	let isSubmitting = $state(false);

	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/updateDrugAction" use:enhance onsubmit={handleSubmit}>
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
									class="health-system-input {form?.errors?.drugName ? 'input-text-error' : ''}"
									name="drugName"
									placeholder="Enter name here..."
									bind:value={drugName}
									required
								/>
								{#if form?.errors?.drugName}
									<p class="text-error">{form?.errors?.drugName[0]}</p>
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
									class="health-system-input"
								/>
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
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Strength</td>
							<td>
								<select name="strength" bind:value={strength} class="health-system-input !pr-4">
									<option value="High">High</option>
									<option value="Auto">Auto</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
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
									class="health-system-input"
								/>
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
									class="health-system-input"
								/>
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
									class="health-system-input"
								/>
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
					<button
						type="submit"
						class="health-system-btn variant-soft-secondary"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
