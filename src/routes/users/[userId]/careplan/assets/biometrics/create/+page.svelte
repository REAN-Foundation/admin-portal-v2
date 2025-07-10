<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/biometrics.schema';
	import type { BiometricsCreateModel } from '$lib/types/biometrics.type';
	import Button from '$lib/components/button/button.svelte';

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(undefined);
	let description = $state('');
	let measurementUnit = $state('');
	let version = $state('');
	let biometricsType = $state('Blood pressure');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Create Biometric';
	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/biometrics/create`;
	const biometricsRoute = `/users/${userId}/careplan/assets/biometrics`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const biometricsCreateModel: BiometricsCreateModel = {
				Name: name,
				Description: description,
				MeasurementUnit: measurementUnit,
				Version: version,
				BiometricsType: biometricsType,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(biometricsCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(biometricsCreateModel);
			const res = await fetch(`/api/server/careplan/assets/biometrics`, {
				method: 'POST',
				body: JSON.stringify(biometricsCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log("Redirecting to:", response?.Data?.id);
				console.log('Full response:', response);
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

	$effect(() => {
            keywordsStr = keywords?.join(', ');
        });

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div class="form-headers">
			<h2 class="form-titles">Create Biometric</h2>
			<a href={assetRoute} class="form-cancel-btn">
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
							class="input {errors?.name ? 'input-text-error' : ''}"
							name="name"
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
					class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
					bind:value={description}
					placeholder="Enter description here..."
					>
				</textarea>
			</td>
			</tr>
			<tr class="tables-row">
			<td class="table-label">Biometrics Type <span class="text-red-700">*</span></td>
			<td class="table-data">
				<div class="relative">
				<select required class="select" bind:value={biometricsType}>
					<option>Blood pressure</option>
					<option>Blood glucose</option>
					<option>Blood oxygen saturation</option>
					<option>Body height</option>
					<option>Body weight</option>
					<option>Body temperature</option>
					<option>Pulse</option>
					<option>Other</option>
				</select>
				<div class="select-icon-container">
					<Icon icon="mdi:chevron-down" class="select-icon" />
				</div>
			</div>
			</td>
			</tr>
			<tr class="tables-row">
			<td class="table-label">Measurement Unit</td>
			<td class="table-data">
						<input
							type="text"
							class="input {errors?.measurementUnit ? 'input-text-error' : ''}"
							name="measurementUnit"
							placeholder="Enter unit here..."
							bind:value={measurementUnit}
						/>
						{#if errors?.MeasurementUnit}
							<p class="error-text">{errors?.MeasurementUnit}</p>
						{/if}
					</td>
			</tr>
			<tr class="tables-row">
			<td class="table-label">Tags</td>
			<td class="table-data">
				<InputChips
					bind:keywords
					name="keywords"
					id="keywords"
						/>
					<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
			</td>
			</tr>
			<tr class="tables-row">
			<td class="table-label">Version</td>
			<td class="table-data">
				<input type="text" bind:value={version} class="input" placeholder="V 1.0" />
			</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
            {#await promise}
                <Button type="submit" text="Submitting" variant="primary" disabled={true} />
            {:then data}
                <Button type="submit" text="Submit" variant="primary" />
            {/await}
    </div>
	</form>
</div>
