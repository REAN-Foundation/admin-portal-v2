<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { LearningPathUpdateModel } from '$lib/types/lms/learning.journeys';
	import { createOrUpdateSchema } from '$lib/validation/lms/learning.journeys.schema';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();
	const tenantId = data.tenantId;

	let learningJourneyName = $state(data.learningJourney.Name);
	let description = $state(data.learningJourney.Description || undefined);
	let imageUrl = $state(data.learningJourney.ImageUrl ?? undefined);
	let durationInDays = $state(
		data.learningJourney.DurationInDays?.toString() ?? undefined
	);
	let preferenceWeight = $state(
		data.learningJourney.PreferenceWeight?.toString() ?? undefined
	);
	let enabled = $state(
		data.learningJourney.Enabled !== undefined ? data.learningJourney.Enabled : true
	);
	let courseIds = $state<string[]>(data.learningJourney.CourseIds || []);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let previewUrl = $state<string | undefined>(undefined);

	const userId = page.params.userId;
	var learningPathId = page.params.learningPathId;

	const editRoute = `/users/${userId}/learning-journeys/${learningPathId}/edit`;
	const viewRoute = `/users/${userId}/learning-journeys/${learningPathId}/view`;
	const learningJourneysRoute = `/users/${userId}/learning-journeys`;

	const breadCrumbs = [
		{ name: 'Learning Journeys', path: learningJourneysRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		learningPathId = page.params.learningPathId;
		learningJourneyName = data?.learningJourney?.Name;
		description = data?.learningJourney?.Description;
		imageUrl = data?.learningJourney?.ImageUrl;
		durationInDays = data?.learningJourney?.DurationInDays?.toString();
		preferenceWeight = data?.learningJourney?.PreferenceWeight?.toString();
		enabled = data?.learningJourney?.Enabled !== undefined ? data.learningJourney.Enabled : true;
		courseIds = data?.learningJourney?.CourseIds || [];
		errors = {};
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = undefined;
		}
	};

	const handleImageUrlChange = (e) => {
		imageUrl = e.target.value;
		if (imageUrl) {
			previewUrl = imageUrl;
		} else {
			previewUrl = undefined;
		}
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const learningJourneyUpdateModel: LearningPathUpdateModel = {
				TenantId: tenantId,
				Name: learningJourneyName,
				Description: description,
				ImageUrl: imageUrl,
				DurationInDays: durationInDays ? Number(durationInDays) : undefined,
				PreferenceWeight: preferenceWeight ? Number(preferenceWeight) : undefined,
				Enabled: enabled,
				CourseIds: courseIds.length > 0 ? courseIds : undefined
			};

			const validationResult = createOrUpdateSchema.safeParse(learningJourneyUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/lms/learning.journeys/${learningPathId}`, {
				method: 'PUT',
				body: JSON.stringify(learningJourneyUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					previewUrl = undefined;
				}
				toastMessage(response);
				goto(`${learningJourneysRoute}/${response?.Data?.id}/view`);
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
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Learning Journey</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.Name ? 'input-text-error' : ''}"
							name="learningJourneyName"
							placeholder="Enter name here..."
							bind:value={learningJourneyName}
						/>
						{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							class="input {errors?.Description ? 'input-text-error' : ''}"
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							rows="4"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Image URL</td>
					<td class="table-data">
						{#if imageUrl == undefined || imageUrl == null}
							<input
								type="url"
								class="input {errors?.ImageUrl ? 'input-text-error' : ''}"
								name="imageUrl"
								placeholder="Enter image URL here..."
								bind:value={imageUrl}
								oninput={handleImageUrlChange}
							/>
						{:else}
							<Image cls="flex h-24 w-24 rounded-lg mb-2" source={imageUrl} w="24" h="24" />
							<input
								type="url"
								class="input {errors?.ImageUrl ? 'input-text-error' : ''}"
								name="imageUrl"
								placeholder="Enter image URL here..."
								bind:value={imageUrl}
								oninput={handleImageUrlChange}
							/>
						{/if}
						{#if errors?.ImageUrl}
							<p class="text-error">{errors?.ImageUrl}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Duration (Days)</td>
					<td class="table-data">
						<input
							type="number"
							step="1"
							min="0"
							class="input {errors?.DurationInDays ? 'input-text-error' : ''}"
							name="durationInDays"
							placeholder="Enter duration in days..."
							bind:value={durationInDays}
						/>
						{#if errors?.DurationInDays}
							<p class="text-error">{errors?.DurationInDays}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Preference Weight</td>
					<td class="table-data">
						<input
							type="number"
							step="1"
							min="0"
							class="input {errors?.PreferenceWeight ? 'input-text-error' : ''}"
							name="preferenceWeight"
							placeholder="Enter preference weight..."
							bind:value={preferenceWeight}
						/>
						{#if errors?.PreferenceWeight}
							<p class="text-error">{errors?.PreferenceWeight}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Enabled</td>
					<td class="table-data">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								class="input"
								name="enabled"
								bind:checked={enabled}
							/>
							<span>Enable this learning journey</span>
						</label>
						{#if errors?.Enabled}
							<p class="text-error">{errors?.Enabled}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>

