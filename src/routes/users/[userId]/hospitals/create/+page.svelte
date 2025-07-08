<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { HospitalCreateModel } from '$lib/types/hospital.types';
	import { createOrUpdateSchema } from '$lib/validation/hospital.schemas';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let hospitalName = $state(undefined);
	let keywords: string[] = $state([]);
	let promise = $state();
	let keywordsStr = $state('');
	let healthSystemId = $state('');
	let selectedHealthSystemId = $state(undefined);
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/hospitals/create`;
	const hospitalsRoute = `/users/${userId}/hospitals`;

	const breadCrumbs = [
		{ name: 'Hospitals', path: hospitalsRoute },
		{ name: 'Create', path: createRoute }
	];

	let healthSystems = $state(data.healthSystems);
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

	$effect(() => {
		keywordsStr = keywords?.join(', ');
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Add Hospital</h2>
			<a href={hospitalsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input"
							name="hospitalName"
							placeholder="Enter name here..."
							bind:value={hospitalName}
						/>
						{#if errors?.Name}
							<p class="text-error ml-1">{errors?.Name}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Health System <span class="text-red-600">*</span></td>
					<td class="table-data">
						<select name="healthSystemId" class="input !pr-4" bind:value={selectedHealthSystemId}>
							{#each healthSystems as healthSystem}
								{#if healthSystemId !== healthSystem.id}
									<option value={healthSystem.id}>{healthSystem.Name}</option>
								{/if}
							{/each}
						</select>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input
							type="hidden"
							name="keywordsStr"
							id="keywordsStr"
							class="input"
							bind:value={keywordsStr}
						/>
						<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" /> -->
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
