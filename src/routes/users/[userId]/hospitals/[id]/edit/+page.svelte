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
	});

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Hospital</th>
							<th class="text-end">
								<a href={viewRoute} class="form-cancel-btn">
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
									class="input"
									name="hospitalName"
									placeholder="Enter name here..."
									bind:value={hospitalName}
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Health System <span class=" text-red-600">*</span></td>
							<td>
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
						<tr>
							<td class="!py-3">Tags</td>

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
									class="input"
									bind:value={keywordsStr}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
					{#await promise}
						<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
					{:then data}
						<Button size="md" type="submit" text="Submit" variant="primary" />
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
