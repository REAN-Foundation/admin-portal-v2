<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types'
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/biometrics.schema';
	import type { BiometricsUpdateModel } from '$lib/types/biometrics.type';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.biometrics.Name);
	let description = $state(data.biometrics.Description);
	let measurementUnit = $state(data.biometrics.MeasurementUnit);
	let version = $state(data.biometrics.Version);
	let biometricsType = $state(data.biometrics.BiometricsType);
	let tags = $state(data.biometrics.Tags);
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.biometrics.Tags);

	const userId = page.params.userId;
	var biometricsId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/biometrics/${biometricsId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/biometric/${biometricsId}/view`;
	const biometricsRoute = `/users/${userId}/careplan/assets/biometrics`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset =  () => {
		 name = data?.biometrics?.Name;
		 biometricsId = page.params.id;
		 description = data?.biometrics?.Description;
		 measurementUnit = data?.biometrics?.MeasurementUnit
		 version = data?.biometrics?.Version;
		 biometricsType = data?.biometrics.BiometricsType;
		 tags = data?.biometrics.Tags;
		 errors = {};
		}

		const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const biometricsUpdateModel: BiometricsUpdateModel = {
				Name: name,
				Description: description,
				MeasurementUnit: measurementUnit,
				Version: version,
				BiometricsType: biometricsType,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(biometricsUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/biometrics/${biometricsId}`, {
				method: 'PUT',
				body: JSON.stringify(biometricsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response); 
				console.log("Full response:", response);
				await goto(`${biometricsRoute}/${response?.Data?.id}/view`); 
			} else if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<table class="table-c">
			<thead>
					<tr>
						<th>Edit Biometric</th>
						<th class="text-end">
							<a href={viewRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name </td>
						<td>
							<input
									type="text"
									class="input {form?.errors?.Name
										? 'input-text-error'
										: ''}"
									name="biometricsName"
									placeholder="Enter name here..."
									bind:value={name}
								/>
							{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="align-top">Description</td>
						<td>
							<textarea
								name="description"
								class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
								bind:value={description}
								placeholder="Enter description here..."
							></textarea>
						</td>
					</tr>

					<tr>
						<td>Biometrics Type</td>
						<td>
							<select class="input" bind:value={biometricsType}>
								<option disabled value>Select biometrics type</option>
								<option>Blood pressure</option>
								<option>Blood glucose</option>
								<option>Blood oxygen saturation</option>
								<option>Body height</option>
								<option>Body weight</option>
								<option>Body temperature</option>
								<option>Pulse</option>
								<option>Other</option>
							</select>
						</td>
					</tr>

					<tr>
						<td>Measurement Unit</td>
						<td>
							<input
								type="text"
								bind:value={measurementUnit}
								placeholder="Enter unit..."
								class="input {errors?.MeasurementUnit ? 'input-text-error' : ''}"
							/>
							{#if errors?.MeasurementUnit}<p class="text-error">{errors?.MeasurementUnit}</p>{/if}
						</td>
					</tr>

					<tr class="">
						<td class="!py-3 align-top">Tags</td>
						<td>
							<InputChips
								bind:keywords
								name="keywords"
								id="keywords"
								keywordsChanged={onUpdateKeywords}
							/>
							<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
							<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
						</td>
					</tr>
					<tr>
						<td>Version</td>
						<td>
							<input type="text" bind:value={version} class="input" placeholder="V 1.0" />
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
