<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';
	import type { HospitalCreateModel } from '$lib/types/hospital.types';
	import { createOrUpdateSchema } from '$lib/validation/hospital.schemas';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';

	////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let hospitalName = $state(undefined);
	let keywords: string[] = $state([]);
	let promise = $state();
	let keywordsStr = $state('');
	let healthSystemId = $state('');
	let selectedHealthSystemId = $state('');
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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const hospitalCreateModel: HospitalCreateModel = {
				Name: hospitalName,
				HealthSystemId: selectedHealthSystemId,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(hospitalCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/hospitals`, {
				method: 'POST',
				body: JSON.stringify(hospitalCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${hospitalsRoute}/${response?.Data?.Hospital?.id}/view`);
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

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
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
							<th>Add Hospital</th>
							<th class="text-end">
								<a href={hospitalsRoute} class=" cancel-btn">
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
									bind:value={hospitalName}
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
								<select required name="healthSystemId" class="health-system-input !pr-4" bind:value={selectedHealthSystemId}>
									{#each healthSystems as healthSystem}
										{#if healthSystemId !== healthSystem.id}
											<option value={healthSystem.id}>{healthSystem.Name}</option>
										{/if}
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="!py-4">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input
									type="hidden"
									name="keywordsStr"
									id="keywordsStr"
									class="health-system-input"
									bind:value={keywordsStr}
								/>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" /> -->
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
