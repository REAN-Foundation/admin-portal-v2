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
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = $state(data.labRecordType.id),
		typeName = $state(data.labRecordType.TypeName),
		displayName = $state(data.labRecordType.DisplayName),
		snowmedCode = $state(data.labRecordType.SnowmedCode),
		loincCode = $state(data.labRecordType.LoincCode),
		normalRangeMin = $state(data.labRecordType.NormalRangeMin),
		normalRangeMax = $state(data.labRecordType.NormalRangeMax),
		unit = $state(data.labRecordType.Unit);

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
<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Edit Lab Record" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Type Name" required={true} />
					<td class="table-data">
						<Input
							name="typeName"
							type="text"
							placeholder="Enter type name here..."
							bind:value={typeName}
							error={errors?.TypeName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Display Name" />
					<td class="table-data">
						<Input
							name="displayName"
							type="text"
							placeholder="Enter display name here..."
							bind:value={displayName}
							error={errors?.DisplayName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="SNOMED Code" />
					<td class="table-data">
						<Input
							name="snowmedCode"
							type="text"
							placeholder="Enter SNOMED code here..."
							bind:value={snowmedCode}
							error={errors?.SnowmedCode}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="LOINC Code" />
					<td class="table-data">
						<Input
							name="loincCode"
							type="text"
							placeholder="Enter LOINC code here..."
							bind:value={loincCode}
							error={errors?.LoincCode}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Minimum Normal Range" />
					<td class="table-data">
						<Input
							name="normalRangeMin"
							type="number"
							placeholder="Enter minimum normal range..."
							bind:value={normalRangeMin}
							error={errors?.NormalRangeMin}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Maximum Normal Range" />
					<td class="table-data">
						<Input
							name="normalRangeMax"
							type="number"
							placeholder="Enter maximum normal range..."
							bind:value={normalRangeMax}
							error={errors?.NormalRangeMax}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Unit" />
					<td class="table-data">
						<Input
							name="unit"
							type="text"
							placeholder="Enter unit here..."
							bind:value={unit}
							error={errors?.Unit}
						/>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
