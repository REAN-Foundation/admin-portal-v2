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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Drug</th>
							<th class="text-end">
								<a href={drugsRoute} class="form-cancel-btn">
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
									bind:value={drugName}
									class="health-system-input"
									name="drugName"
									placeholder="Enter name here..."
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
									bind:value={genericName}
									name="genericName"
									placeholder="Enter generic name here..."
									class="health-system-input"
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
									bind:value={ingredients}
									name="ingredients"
									placeholder="Enter ingredients here..."
									class="health-system-input"
								/>
								{#if errors?.Ingredients}
									<p class="text-error">{errors?.Ingredients}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Strength</td>
							<td>
								<select name="strength" class="health-system-input" bind:value={strength}>
									<option value="High">High</option>
									<option value="Auto">Auto</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
								{#if errors?.strength}
									<p class="text-error">{errors?.strength}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Commercial Name</td>
							<td>
								<input
									type="text"
									bind:value={otherCommercialNames}
									name="otherCommercialNames"
									placeholder="Enter commercial name here..."
									class="health-system-input"
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
									bind:value={manufacturer}
									name="manufacturer"
									placeholder="Enter manufacture here..."
									class="health-system-input"
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
									bind:value={otherInformation}
									name="otherInformation"
									placeholder="Enter other information here..."
									class="health-system-input"
								/>
								{#if errors?.OtherInformation}
									<p class="text-error">{errors?.OtherInformation}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					{#await promise}
						<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
					{:then data}
						<Button size="md" type="submit" text="Submit" variant="primary" />
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
