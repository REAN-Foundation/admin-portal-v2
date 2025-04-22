<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	// export let form;
	// export let data;
	let { data, form } = $props();

	data.title = 'Clinical-Lab Records Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/lab-records/create`;
	const labRecordTypesRoute = `/users/${userId}/lab-records`;

	const breadCrumbs = [
		{ name: 'Lab Records', path: labRecordTypesRoute },
		{ name: 'Create', path: createRoute }
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
			<form method="post" action="?/createLabRecordTypeAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Lab Record</th>
							<th class="text-end">
								<a href={labRecordTypesRoute} class="health-system-btn variant-soft-secondary">
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
									name="typeName"
									required
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
									placeholder="Enter display name here..."
									class="health-system-input"
								/>
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
								/>
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
								/>
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
								/>
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
								/>
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
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="submit"
						class="health-system-btn variant-filled-secondary"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
