<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	// export let form;
	// export let data;

	let { data, form } = $props();
	data.title = 'Clinical-Drugs Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/drugs/create`;
	const drugsRoute = `/users/${userId}/drugs`;

	const breadCrumbs = [
		{ name: 'Drugs', path: drugsRoute },
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
		<div class="health-system-table-container z-0 shadow">
			<form method="post" action="?/createDrugAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Drug</th>
							<th class="text-end">
								<a href={drugsRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" class="text-lg" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.drugName ? 'input-text-error' : ''}"
									name="drugName"
									placeholder="Enter name here..."
									required
								/>
								{#if form?.errors?.drugName}
									<p class="text-error">{form?.errors?.drugName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Generic Name</td>
							<td>
								<input
									type="text"
									name="genericName"
									placeholder="Enter generic name here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Ingredients</td>
							<td>
								<input
									type="text"
									name="ingredients"
									placeholder="Enter ingredients here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Strength</td>
							<td>
								<select name="strength" class="health-system-input">
									<option value="High">High</option>
									<option value="Auto">Auto</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>Commercial Name</td>
							<td>
								<input
									type="text"
									name="otherCommercialNames"
									placeholder="Enter commercial name here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Manufacture</td>
							<td>
								<input
									type="text"
									name="manufacturer"
									placeholder="Enter manufacture here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Other Information</td>
							<td>
								<input
									type="text"
									name="otherInformation"
									placeholder="Enter other information here..."
									class="health-system-input"
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
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
