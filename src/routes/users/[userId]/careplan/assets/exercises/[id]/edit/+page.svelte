<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types'
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ExerciseUpdateModel } from '$lib/types/exercises.types';
	import { createOrUpdateSchema } from '$lib/validation/exercises.schema';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.exercise.Name);
	let description = $state(data.exercise.Description);
	let exerciseType = $state(data.exercise.ExerciseType);
	let intensityLevel = $state(data.exercise.IntensityLevel);
	// let recommendedDurationMin = $state();
	let recommendedDurationMin = $state<number>(data.exercise.RecommendedDurationMin);
	let version = $state(data.exercise.Version);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	var exerciseId = page.params.id;

	const editRoute = `/users/${userId}/careplan/assets/exercises/${exerciseId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/exercises/${exerciseId}/view`;
	const exerciseRoute = `/users/${userId}/careplan/assets/exercises`;

	const breadCrumbs = [
		{ name: 'Exercise', path: exerciseRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset =  () => {
		 name = data?.exercise?.Name;
		 exerciseId = page.params.id;
		 description = data?.exercise?.Description;
		 exerciseType = data?.exercise?.ExerciseType,
		 intensityLevel = data?.exercise?.IntensityLevel,
		 recommendedDurationMin = data?.exercise.RecommendedDurationMin,
		 version = data?.exercise?.Version;
		 keywords = data?.exercise?.Tags;
		 errors = {};
		}

		const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const exerciseUpdateModel: ExerciseUpdateModel = {
				Name: name,
				Description: description,
				ExerciseType: exerciseType,
				IntensityLevel: intensityLevel,
				RecommendedDurationMin: recommendedDurationMin,
				Version: version,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(exerciseUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/exercises/${exerciseId}`, {
				method: 'PUT',
				body: JSON.stringify(exerciseUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log("Full response:", response);
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
						<th>Edit Biometric</th>
						<th class="text-end">
							<a href={exerciseRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name </td>
						<td>
							<input
									type="text"
									class="health-system-input {form?.errors?.Name
										? 'input-text-error'
										: ''}"
									name="biometricsName"
									placeholder="Enter name here..."
									bind:value={name}
								/>
							{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="align-top">Description</td>
						<td>
							<textarea
								name="description"
								class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
								bind:value={description}
								placeholder="Enter description here..."
							></textarea>
						</td>
					</tr>
					<tr>
						<td>Exercise Type</td>
						<td>
							<select class="health-system-input" bind:value={exerciseType}>
								<option disabled value>Select exercise type</option>
								<option>Strength</option>
								<option>Aerobic</option>
								<option>Balance</option>
								<option>Reflexes</option>
								<option>Flexibility</option>
								<option>Body temperature</option>
								<option>Pulse</option>
								<option>Other</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Intensity Level</td>
						<td>
							<select class="health-system-input" bind:value={intensityLevel}>
								<option disabled value>Select Intensity Level</option>
								<option>None</option>
								<option>Minimal</option>
								<option>Moderate</option>
								<option>Somewhat hard</option>
								<option>Hard</option>
								<option>Harder</option>
								<option>Very hard</option>
								<option>Extremely hard</option>
								<option>Maximum effort</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>Recommended Duration Min</td>
						<td>
							<input
								type="text"
								bind:value={recommendedDurationMin}
								placeholder="Enter recommended duration min..."
								class="health-system-input {errors?.RecommendedDurationMin ? 'input-text-error' : ''}"
							/>
							{#if errors?.RecommendedDurationMin}<p class="text-error">{errors?.RecommendedDurationMin}</p>{/if}
						</td>
					</tr>
					<tr class="">
						<td class="!py-3 align-top">Tags</td>
						<td>
							<InputChips
								bind:keywords
								name="keywords"
								id="keywords"
								keywordsChanged={onUpdateKeywords}
							/>
							<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
							<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
						</td>
					</tr>
					<tr>
						<td>Version</td>
						<td>
							<input type="text" bind:value={version} class="health-system-input" placeholder="V 1.0" />
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
