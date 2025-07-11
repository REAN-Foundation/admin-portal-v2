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
	import Heading from '$lib/components/heading/heading.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';

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
			<Heading text="Add Hospital" />
			<a href={hospitalsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="hospitalName"
							type="text"
							placeholder="Enter name here..."
							bind:value={hospitalName}
							error={errors?.Name}
						/>
					</td>
				</tr>
				<tr class="tables-row">
					<Label text="Health System" required={true} />
					<td class="table-data">
						<div class="relative">
						<select name="healthSystemId" class="select" bind:value={selectedHealthSystemId}>
							{#each healthSystems as healthSystem}
								{#if healthSystemId !== healthSystem.id}
									<option value={healthSystem.id}>{healthSystem.Name}</option>
								{/if}
							{/each}
						</select>
						<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
							<Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
						</div>
					</div>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<Input type="hidden" name="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
