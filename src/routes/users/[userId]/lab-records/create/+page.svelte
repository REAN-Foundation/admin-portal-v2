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
				NormalRangeMin: normalRangeMin,
				NormalRangeMax: normalRangeMax,
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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Lab Record</th>
							<th class="text-end">
								<a href={labRecordTypesRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Type Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									bind:value={typeName}
									name="typeName"
									placeholder="Enter type name here..."
									class="health-system-input {form?.errors?.typeName ? 'input-text-error' : ''}"
								/>
								{#if errors?.TypeName}
									<p class="text-error">{errors?.TypeName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Display Name</td>
							<td>
								<input
									type="text"
									name="displayName"
									bind:value={displayName}
									placeholder="Enter display name here..."
									class="health-system-input {form?.errors?.displayName ? 'input-text-error' : ''}"
								/>
								{#if errors?.DisplayName}
									<p class="text-error">{errors?.DisplayName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>SNOMED CODE</td>
							<td>
								<input
									type="text"
									name="snowmedCode"
									placeholder="Enter snomed code here..."
									class="health-system-input"
									bind:value={snowmedCode}
								/>
								{#if errors?.SnowmedCode}
									<p class="text-error">{errors?.SnowmedCode}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>LOINC CODE</td>
							<td>
								<input
									type="text"
									name="loincCode"
									placeholder="Enter loinc code here..."
									class="health-system-input"
									bind:value={loincCode}
								/>
								{#if errors?.LoincCode}
									<p class="text-error">{errors?.LoincCode}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Minimum Normal Range</td>
							<td>
								<input
									type="number"
									name="normalRangeMin"
									placeholder="Enter minimum normal range here..."
									class="health-system-input"
									bind:value={normalRangeMin}
								/>
								{#if errors?.NormalRangeMin}
									<p class="text-error">{errors?.NormalRangeMin}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Maximum Normal Range</td>
							<td>
								<input
									type="number"
									name="normalRangeMax"
									placeholder="Enter maximum normal range here..."
									class="health-system-input"
									bind:value={normalRangeMax}
								/>
								{#if errors?.NormalRangeMax}
									<p class="text-error">{errors?.NormalRangeMax}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Unit</td>
							<td>
								<input
									type="text"
									name="unit"
									placeholder="Enter unit here..."
									class="health-system-input"
									bind:value={unit}
								/>
								{#if errors?.Unit}
									<p class="text-error">{errors?.Unit}</p>
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
