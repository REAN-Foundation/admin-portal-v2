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
	let recommendedDurationMin = $state<number>(data.exercise.RecommendedDurationMin);
	let version = $state(data.exercise.Version);
	let keywords: string[] = $state(data.exercise.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var exerciseId = page.params.id;
	

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/exercises/${exerciseId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/exercises/${exerciseId}/view`;
	const exerciseRoute = `/users/${userId}/careplan/assets/exercises`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
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
				Tags: keywords,
				TenantId: tenantId
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

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Exercise</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
							name="biometricsName"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Exercise Type</td>
					<td class="table-data">
						<select class="input" bind:value={exerciseType}>
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

				<tr class="tables-row">
					<td class="table-label">Intensity Level</td>
					<td class="table-data">
						<select class="input" bind:value={intensityLevel}>
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

				<tr class="tables-row">
					<td class="table-label">Recommended Duration Min</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={recommendedDurationMin}
							placeholder="Enter recommended duration min..."
							class="input {errors?.RecommendedDurationMin ? 'input-text-error' : ''}"
						/>
						{#if errors?.RecommendedDurationMin}
							<p class="error-text">{errors?.RecommendedDurationMin}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="V 1.0"
							bind:value={version}
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary">
				Reset
			</button>
			{#await promise}
				<button type="submit" class="table-btn variant-soft-secondary" disabled>
					Submitting
				</button>
			{:then data}
				<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
			{/await}
		</div>
	</form>
</div>

