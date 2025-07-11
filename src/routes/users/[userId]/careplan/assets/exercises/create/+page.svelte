<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ExerciseCreateModel } from '$lib/types/exercises.types.js';
	import { createOrUpdateSchema } from '$lib/validation/exercises.schema.js';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(undefined);
	let description = $state('');
	let exerciseType = $state('Strength');
	let intensityLevel = $state('None');
	let recommendedDurationMin = $state<number>();
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Create Exercise';
	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;

	// Get asset type from URL params or default to 'Exercise'
	const assetType = page.url.searchParams.get('assetType') || 'Exercise';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const createRoute = `/users/${userId}/careplan/assets/exercises/create`;
	const exerciseRoute = `/users/${userId}/careplan/assets/exercises`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Exercise', path: createRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const exerciseCreateModel: ExerciseCreateModel = {
				Name: name,
				Description: description,
				ExerciseType: exerciseType,
				IntensityLevel: intensityLevel,
				RecommendedDurationMin: recommendedDurationMin,
				Version: version,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(exerciseCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(exerciseCreateModel);
			const res = await fetch(`/api/server/careplan/assets/exercises`, {
				method: 'POST',
				body: JSON.stringify(exerciseCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log('Full response:', response);
				await goto(`${exerciseRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
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
			<Heading text="Create Exercise" />
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="name"
							type="text"
							placeholder="Enter name here..."
							bind:value={name}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Exercise Type" />
					<td class="table-data">
						<div class="relative">
						<select class="select" bind:value={exerciseType}>
							<!-- <option disabled value>Select exercise type</option> -->
							<option>Strength</option>
							<option>Aerobic</option>
							<option>Balance</option>
							<option>Reflexes</option>
							<option>Flexibility</option>
							<option>Body temperature</option>
							<option>Pulse</option>
							<option>Other</option>
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Intensity Level" />
					<td class="table-data">
						<div class="relative">
						<select class="select" bind:value={intensityLevel}>
							<!-- <option disabled value>Select Intensity Level</option> -->
							<option selected>None</option>
							<option>Minimal</option>
							<option>Moderate</option>
							<option>Somewhat hard</option>
							<option>Hard</option>
							<option>Harder</option>
							<option>Very hard</option>
							<option>Extremely hard</option>
							<option>Maximum effort</option>
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Recommended Duration Min" />
					<td class="table-data">
						<Input
							name="recommendedDurationMin"
							type="text"
							placeholder="Enter recommended duration min..."
							bind:value={recommendedDurationMin}
							error={errors?.RecommendedDurationMin}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Version" />
					<td class="table-data">
						<Input
							name="version"
							type="text"
							placeholder="V 1.0"
							bind:value={version}
							error={errors?.Version}
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
