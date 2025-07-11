<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { DrugCreateModel } from '$lib/types/drug.types.js';
	import { createOrUpdateSchema } from '$lib/validation/drugs.schema.js';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
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
			<Heading text="Create Drug" />
			<a href={drugsRoute} class="form-cancel-btn">
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
						<div class="relative">
						<select
							name="strength"
							class="select {errors?.strength ? 'input-text-error' : ''}"
							bind:value={strength}
						>
							<option value="High">High</option>
							<option value="Auto">Auto</option>
							<option value="Medium">Medium</option>
							<option value="Low">Low</option>
						</select>
						<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
							<Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
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
							placeholder="Enter manufacture here..."
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
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
