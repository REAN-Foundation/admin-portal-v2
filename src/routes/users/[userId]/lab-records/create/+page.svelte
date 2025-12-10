<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { LabRecordCreateModel } from '$lib/types/lab.records.types.js';
	import { createOrUpdateSchema } from '$lib/validation/lab.records.schema.js';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	let errors: Record<string, string> = $state({});
	let typeName = $state(undefined),
		displayName = $state(undefined),
		snowmedCode = $state(undefined),
		loincCode = $state(undefined),
		normalRangeMin = $state(undefined),
		normalRangeMax = $state(undefined),
		unit = $state(undefined);

	let promise = $state();
	data.title = 'Clinical-Lab Records Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/lab-records/create`;
	const labRecordTypesRoute = `/users/${userId}/lab-records`;

	const breadCrumbs = [
		{ name: 'Lab Records', path: labRecordTypesRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const labRecordCreateModel: LabRecordCreateModel = {
				TypeName: typeName,
				DisplayName: displayName,
				SnowmedCode: snowmedCode,
				LoincCode: loincCode,
				NormalRangeMin: normalRangeMin === "" || isNaN(Number(normalRangeMin)) ? undefined : Number(normalRangeMin),
				NormalRangeMax: normalRangeMax === "" || isNaN(Number(normalRangeMax)) ? undefined : Number(normalRangeMax),
				Unit: unit
			};

			const validationResult = createOrUpdateSchema.safeParse(labRecordCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/lab-record-types`, {
				method: 'POST',
				body: JSON.stringify(labRecordCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${labRecordTypesRoute}/${response?.Data?.LabRecordType?.id}/view`);
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
			<h2 class="form-titles">Create Action Plan</h2>
			<a href={labRecordTypesRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label"> Type Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							bind:value={typeName}
							name="typeName"
							placeholder="Enter type name here..."
							class="input {errors?.typeName ? 'input-text-error' : ''}"
						/>
						{#if errors?.TypeName}
							<p class="text-error">{errors?.TypeName}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class=" table-label">Display Name</td>
					<td class="table-data">
						<input
							type="text"
							name="displayName"
							bind:value={displayName}
							placeholder="Enter display name here..."
							class="input {errors?.displayName ? 'input-text-error' : ''}"
						/>
						{#if errors?.DisplayName}
							<p class="text-error">{errors?.DisplayName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">SNOMED CODE</td>
					<td class="table-data">
						<input
							type="text"
							name="snowmedCode"
							placeholder="Enter snomed code here..."
							class="input {errors?.snowmedCode ? 'input-text-error' : ''}"
							bind:value={snowmedCode}
						/>
						{#if errors?.SnowmedCode}
							<p class="text-error">{errors?.SnowmedCode}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">LOINC CODE</td>
					<td class="table-data">
						<input
							type="text"
							name="loincCode"
							placeholder="Enter loinc code here..."
							class="input {errors?.loincCode ? 'input-text-error' : ''}"
							bind:value={loincCode}
						/>
						{#if errors?.LoincCode}
							<p class="text-error">{errors?.LoincCode}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Minimum Normal Range</td>
					<td class="table-data">
						<input
							type="number"
							name="normalRangeMin"
							step="any"
							placeholder="Enter minimum normal range here..."
							class="input {errors?.normalRangeMin ? 'input-text-error' : ''}"
							bind:value={normalRangeMin}
						/>
						{#if errors?.NormalRangeMin}
							<p class="text-error">{errors?.NormalRangeMin}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Maximum Normal Range</td>
					<td class="table-data">
						<input
							type="number"
							name="normalRangeMax"
							step="any"
							placeholder="Enter maximum normal range here..."
							class="input {errors?.normalRangeMax ? 'input-text-error' : ''}"
							bind:value={normalRangeMax}
						/>
						{#if errors?.NormalRangeMax}
							<p class="text-error">{errors?.NormalRangeMax}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Unit</td>
					<td class="table-data">
						<input
							type="text"
							name="unit"
							placeholder="Enter unit here..."
							class="input {errors?.unit ? 'input-text-error' : ''}"
							bind:value={unit}
						/>
						{#if errors?.Unit}
							<p class="text-error">{errors?.Unit}</p>
						{/if}
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
