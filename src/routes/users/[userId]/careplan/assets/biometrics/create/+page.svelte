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
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	/////////////////////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
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
			<Heading text="Create Biometric" />
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="name"
							type="text"
							placeholder="Enter name here..."
							bind:value={name}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Biometrics Type" required={true} />
					<td class="table-data">
						<select name="biometricsType" bind:value={biometricsType} required class="input">
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
					<Label text="Measurement Unit" required={true} />
					<td class="table-data">
						<Input
							name="measurementUnit"
							type="text"
							placeholder="Enter unit..."
							bind:value={measurementUnit}
							error={errors?.MeasurementUnit}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Version" />
					<td class="table-data">
						<Input name="version" type="text" placeholder="V 1.0" bind:value={version} />
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
