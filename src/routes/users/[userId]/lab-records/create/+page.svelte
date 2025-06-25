<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { LabRecordCreateModel } from '$lib/types/lab.records.types.js';
	import { createOrUpdateSchema } from '$lib/validation/lab.records.schema.js';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';

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
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Lab Record" />
			<a href={labRecordTypesRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Type Name" required={true} />
					<td class="table-data">
						<Input
							type="text"
							name="typeName"
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
							type="text"
							name="displayName"
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
							type="text"
							name="snowmedCode"
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
							type="text"
							name="loincCode"
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
							type="number"
							name="normalRangeMin"
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
							type="number"
							name="normalRangeMax"
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
							type="text"
							name="unit"
							placeholder="Enter unit here..."
							bind:value={unit}
							error={errors?.Unit}
						/>
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
