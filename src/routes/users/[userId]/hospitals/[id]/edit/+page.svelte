<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { HospitalUpdateModel } from '$lib/types/hospital.types';
	import { createOrUpdateSchema } from '$lib/validation/hospital.schemas';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';

	//////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let hospitalName = $state(data.hospital.Name);
	let healthSystemId = $state(data.hospital.HealthSystemId);
	let healthSystemName = $state(data.hospital.HealthSystemName);
	let keywords: string[] = $state(data.hospital.Tags);
	let healthSystems = $state(data.healthSystems);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	const hospitalId = page.params.id;
	const editRoute = `/users/${userId}/hospitals/${hospitalId}/edit`;
	const viewRoute = `/users/${userId}/hospitals/${hospitalId}/view`;
	const hospitalsRoute = `/users/${userId}/hospitals`;

	function sortHealthSystemsByName(healthSystems) {
		return healthSystems.sort((a, b) => a.Name.localeCompare(b.Name));
	}

	let _healthSystemId = $derived(healthSystemId);
	const r = $derived(
		healthSystems.filter((hs) => {
			return hs.id === healthSystemId;
		})
	);

	function handleReset() {
		hospitalName = data?.hospital?.Name;
		healthSystemId = _healthSystemId;
		healthSystemName = data?.hospital?.HealthSystemName;
		keywords = data?.hospital?.Tags;
		errors = {};
	}

	const breadCrumbs = [
		{ name: 'Hospitals', path: hospitalsRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const hospitalUpdateModel: HospitalUpdateModel = {
				Name: hospitalName,
				HealthSystemId: healthSystemId,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(hospitalUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/hospitals/${hospitalId}`, {
				method: 'PUT',
				body: JSON.stringify(hospitalUpdateModel),
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
		healthSystems = sortHealthSystemsByName(healthSystems);
		keywordsStr = keywords?.join(', ');
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Edit Hospital" />
			<a href={viewRoute} class="form-cancel-btn">
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
						<select name="healthSystemId" class=" input">
							<option value={healthSystemId}>{healthSystemName}</option>
							{#each healthSystems as healthSystem}
								{#if healthSystemId !== healthSystem.id}
									<option value={healthSystem.id}>{healthSystem.Name}</option>
								{/if}
							{/each}
						</select>
						<input type="text" hidden bind:value={healthSystemId} />
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
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
