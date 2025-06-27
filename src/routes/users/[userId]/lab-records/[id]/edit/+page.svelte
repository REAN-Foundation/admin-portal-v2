<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { LabRecordUpdateModel } from '$lib/types/lab.records.types';
	import { createOrUpdateSchema } from '$lib/validation/lab.records.schema';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = $state(data.labRecordType.id),
		typeName = $state(data.labRecordType.TypeName),
		displayName = $state(data.labRecordType.DisplayName || undefined),
		snowmedCode = $state(data.labRecordType.SnowmedCode || undefined),
		loincCode = $state(data.labRecordType.LoincCode || undefined),
		normalRangeMin = $state(data.labRecordType.NormalRangeMin || undefined),
		normalRangeMax = $state(data.labRecordType.NormalRangeMax || undefined),
		unit = $state(data.labRecordType.Unit || undefined);

	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	var labRecordId = page.params.id;
	const editRoute = `/users/${userId}/lab-records/${id}/edit`;
	const viewRoute = `/users/${userId}/lab-records/${id}/view`;
	const labRecordTypesRoute = `/users/${userId}/lab-records`;

	const breadCrumbs = [
		{
			name: 'Lab Records',
			path: labRecordTypesRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];
	function handleReset() {
		typeName = data?.labRecordType?.TypeName;
		displayName = data?.labRecordType?.DisplayName;
		snowmedCode = data?.labRecordType?.SnowmedCode;
		loincCode = data?.labRecordType?.LoincCode;
		normalRangeMin = data?.labRecordType?.NormalRangeMin;
		normalRangeMax = data?.labRecordType?.NormalRangeMax;
		unit = data?.labRecordType?.Unit;
		errors = {};
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const labRecordUpdateModel: LabRecordUpdateModel = {
				TypeName: typeName,
				DisplayName: displayName,
				SnowmedCode: snowmedCode,
				LoincCode: loincCode,
				NormalRangeMin: normalRangeMin,
				NormalRangeMax: normalRangeMax,
				Unit: unit
			};

			const validationResult = createOrUpdateSchema.safeParse(labRecordUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/lab-record-types/${labRecordId}`, {
				method: 'PUT',
				body: JSON.stringify(labRecordUpdateModel),
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
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Lab Record</th>
							<th class="text-end">
								<a href={viewRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Type Name <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="typeName"
									bind:value={typeName}
									placeholder="Enter type name here..."
									class="health-system-input"
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
									class="health-system-input"
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
									bind:value={snowmedCode}
									placeholder="Enter snomed code here..."
									class="health-system-input {form?.errors?.snowmedCode ? 'input-text-error' : ''}"
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
									bind:value={loincCode}
									placeholder="Enter loinc code here..."
									class="health-system-input {form?.errors?.loincCode ? 'input-text-error' : ''}"
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
									bind:value={normalRangeMin}
									placeholder="Enter minimum normal range here..."
									class="health-system-input {form?.errors?.normalRangeMin
										? 'input-text-error'
										: ''}"
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
									bind:value={normalRangeMax}
									placeholder="Enter maximum normal range here..."
									class="health-system-input {form?.errors?.normalRangeMax
										? 'input-text-error'
										: ''}"
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
									bind:value={unit}
									placeholder="Enter unit here..."
									class="health-system-input {form?.errors?.unit ? 'input-text-error' : ''}"
								/>
								{#if errors?.Unit}
									<p class="text-error">{errors?.Unit}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
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
