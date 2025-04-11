<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';

	////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/hospitals/create`;
	const hospitalsRoute = `/users/${userId}/hospitals`;

	const breadCrumbs = [
		{ name: 'Hospitals', path: hospitalsRoute },
		{ name: 'Create', path: createRoute }
	];

	let healthSystems = $state(data.healthSystems);
	// console.log('healthSystems ->', JSON.stringify(healthSystems, null, 2));
	healthSystems = sortHealthSystemsByName(healthSystems);
	function sortHealthSystemsByName(healthSystems) {
		return healthSystems.sort((a, b) => a.Name.localeCompare(b.Name));
	}
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
			<form method="post" action="?/createHospitalAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Add Hospital</th>
							<th class="text-end">
								<a href={hospitalsRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
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
									class="health-system-input {form?.errors?.hospitalName ? 'input-text-error' : ''}"
									name="hospitalName"
									placeholder="Enter name here..."
									required
								/>
								{#if form?.errors?.hospitalName}
									<p class="text-error">{form?.errors?.hospitalName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Health System <span class="text-red-600">*</span></td>
							<td>
								<select required name="healthSystemId" class="health-system-input !pr-4">
									{#each healthSystems as healthSystem}
										<option value={healthSystem.id}>{healthSystem.Name}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="!py-4">Tags</td>
							<td>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" /> -->
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
