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
	const tenantId = data.tenantId;
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
				Tags: keywords,
				TenantId: tenantId
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

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Biometric</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
							name="biometricsName"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Biometrics Type</td>
					<td class="table-data">
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

				<tr class="tables-row">
					<td class="table-label">Measurement Unit</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={measurementUnit}
							placeholder="Enter unit..."
							class="input {errors?.MeasurementUnit ? 'input-text-error' : ''}"
						/>
						{#if errors?.MeasurementUnit}
							<p class="error-text">{errors?.MeasurementUnit}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={version}
							class="input {errors?.Version ? 'input-text-error' : ''}"
							placeholder="V 1.0"
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary">
				Reset
			</button>

			{#await promise}
				<button type="submit" class="table-btn variant-filled-secondary" disabled>
					Submitting...
				</button>
			{:then data}
				<button type="submit" class="table-btn variant-filled-secondary">
					Submit
				</button>
			{/await}
		</div>
	</form>
</div>
