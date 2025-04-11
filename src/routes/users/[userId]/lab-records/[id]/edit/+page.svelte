<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.labRecordType.id;
	let typeName = data.labRecordType.TypeName;
	let displayName = data.labRecordType.DisplayName;
	let snowmedCode = data.labRecordType.SnowmedCode;
	let loincCode = data.labRecordType.LoincCode;
	let normalRangeMin = data.labRecordType.NormalRangeMin;
	let normalRangeMax = data.labRecordType.NormalRangeMax;
	let unit = data.labRecordType.Unit;

	//Original data
	let _typeName = typeName;
	let _displayName = displayName;
	let _snowmedCode = snowmedCode;
	let _loincCode = loincCode;
	let _normalRangeMin = normalRangeMin;
	let _normalRangeMax = normalRangeMax;
	let _unit = unit;

	function handleReset() {
		typeName = _typeName;
		displayName = _displayName;
		snowmedCode = _snowmedCode;
		loincCode = _loincCode;
		normalRangeMin = _normalRangeMin;
		normalRangeMax = _normalRangeMax;
		unit = _unit;
	}

	const userId = page.params.userId;
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
			<form method="post" action="?/updateLabRecordTypeAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Lab Record</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Type Name *</td>
							<td>
								<input
									type="text"
									name="typeName"
									required
									bind:value={typeName}
									placeholder="Enter type name here..."
									class="health-system-input {form?.errors?.typeName ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.typeName}
									<p class="text-error">{form?.errors?.typeName[0]}</p>
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
								{#if form?.errors?.displayName}
									<p class="text-error">{form?.errors?.displayName[0]}</p>
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
								{#if form?.errors?.snowmedCode}
									<p class="text-error">{form?.errors?.snowmedCode[0]}</p>
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
								{#if form?.errors?.loincCode}
									<p class="text-error">{form?.errors?.loincCode[0]}</p>
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
								{#if form?.errors?.normalRangeMin}
									<p class="text-error">{form?.errors?.normalRangeMin[0]}</p>
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
								{#if form?.errors?.normalRangeMax}
									<p class="text-error">{form?.errors?.normalRangeMax[0]}</p>
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
								{#if form?.errors?.unit}
									<p class="text-error">{form?.errors?.unit[0]}</p>
								{/if}
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
