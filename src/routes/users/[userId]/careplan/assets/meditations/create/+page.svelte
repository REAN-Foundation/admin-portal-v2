<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { MeditationCreateModel } from '$lib/types/meditations.types.js';
	import { createOrUpdateSchema } from '$lib/validation/meditations.schema.js';
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
	let description = $state('');
	let meditationType = $state('');
	let recommendedDurationMin = $state<number>();
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Create Meditation';
	const userId = page.params.userId;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/meditations/create`;
	const meditationRoute = `/users/${userId}/careplan/assets/meditations`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Meditation', path: meditationRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const meditationCreateModel: MeditationCreateModel = {
				Name: name,
				Description: description,
				MeditationType: meditationType,
				RecommendedDurationMin: recommendedDurationMin,
				Version: version,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(meditationCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(meditationCreateModel)
			const res = await fetch(`/api/server/careplan/assets/meditations`, {
				method: 'POST',
				body: JSON.stringify(meditationCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log("Full response:", response);
				await goto(`${meditationRoute}/${response?.Data?.id}/view`); 
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
		<div class="table-container">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<table class="table-c">
			<thead>
					<tr>
						<th>Create Meditation</th>
						<th class="text-end">
							<a href={assetRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name <span class="text-red-700">*</span></td>
						<td>
							<input
									type="text"
									class="input {form?.errors?.Name
										? 'input-text-error'
										: ''}"
									name="name"
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
						<td>Meditation Type</td>
						<td>
							<select class="input" bind:value={meditationType}>
								<option disabled value>Select meditation type</option>
								<option>Mindfulness</option>
								<option>Spiritual</option>
								<option>Focused</option>
								<option>Mantra</option>
								<option>Progressive relaxation</option>
								<option>Transcendental</option>
								<option>Visualization</option>
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
								class="input {errors?.RecommendedDurationMin ? 'input-text-error' : ''}"
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
							<input type="text" bind:value={version} class="input" placeholder="V 1.0" />
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
