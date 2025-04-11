<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';

	//////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const hospitalId = page.params.id;
	const editRoute = `/users/${userId}/hospitals/${hospitalId}/edit`;
	const viewRoute = `/users/${userId}/hospitals/${hospitalId}/view`;
	const hospitalsRoute = `/users/${userId}/hospitals`;

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();
	console.log('data ===> ', data);

	let hospitalName = $state(data.hospital.Name);
	let healthSystemId = $state(data.hospital.HealthSystemId);
	let healthSystemName = data.hospital.HealthSystemName;
	let tags = $state(data.hospital.Tags);
	let healthSystems = $state(data.healthSystems);
	let isSubmitting = $state(false);

	function sortHealthSystemsByName(healthSystems) {
		return healthSystems.sort((a, b) => a.Name.localeCompare(b.Name));
	}
	// console.log('hospital name  ->', hospitalName);
	// console.log('healthSystemId ->', healthSystemId);
	// console.log('tags           ->', tags);
	// console.log('healthSystem   ->', healthSystemName);

	//Original data
	let _hospitalName = $derived(hospitalName);
	let _healthSystemId = $derived(healthSystemId);
	let _tags = $derived(JSON.stringify(tags));
	const r = $derived(
		healthSystems.filter((hs) => {
			return hs.id === healthSystemId;
		})
	);

	function handleReset() {
		hospitalName = _hospitalName;
		healthSystemId = _healthSystemId;
		tags = JSON.parse(_tags);
	}

	const breadCrumbs = [
		{ name: 'Hospitals', path: hospitalsRoute },
		{ name: 'Edit', path: editRoute }
	];

	function handleHealthSystemChange(event) {
		healthSystemId = event.target.value;
	}

	function handleSubmit() {
		isSubmitting = true;
	}

	$effect(() => {
		healthSystems = sortHealthSystemsByName(healthSystems);
	});

	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/updateHospitalAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Hospital</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class=" text-red-600">*</span></td>

							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.hospitalName ? 'input-text-error' : ''}"
									name="hospitalName"
									placeholder="Enter name here..."
									bind:value={hospitalName}
									required
								/>
								{#if form?.errors?.hospitalName}
									<p class="text-error-500 text-xs">{form?.errors?.hospitalName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Health System <span class=" text-red-600">*</span></td>
							<td>
								<select name="healthSystemId" class=" health-system-input">
									<option value={_healthSystemId}>{healthSystemName}</option>
									{#each healthSystems as healthSystem}
										{#if _healthSystemId !== healthSystem.id}
											<option value={healthSystem.id}>{healthSystem.Name}</option>
										{/if}
									{/each}
								</select>
								<input type="text" hidden bind:value={healthSystemId} />
							</td>
						</tr>
						<tr>
							<td class="!py-3">Tags</td>

							<td>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
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
