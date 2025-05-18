<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	// import type { PageServerData } from '../../../$types';
	import { createOrUpdateSchema } from '$lib/validation/challenges.schema';
	import type { ChallengesUpdateModel } from '$lib/types/challenges.types';


	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.challenges.Name);
	let description = $state(data.challenges.Description);
	let version = $state(data.challenges.Version);
	let keywords: string[] = $state(data.challenges.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	var challengesId = page.params.id;

	const editRoute = `/users/${userId}/careplan/assets/challenges/${challengesId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/biometric/${challengesId}/view`;
	const challengesRoute = `/users/${userId}/careplan/assets/challenges`;

	const breadCrumbs = [
		{ name: 'Challenges', path: challengesRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.challenges?.Name;
		challengesId = page.params.id;
		description = data?.challenges?.Description;
		version = data?.challenges?.Version;
		keywords = data?.challenges?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const challengesUpdateModel: ChallengesUpdateModel = {
				Name: name,
				Description: description,
				Version: version,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(challengesUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/challenges/${challengesId}`, {
				method: 'PUT',
				body: JSON.stringify(challengesUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log("Redirecting to:", response?.Data?.id);
				console.log('Full response:', response);
				await goto(`${challengesRoute}/${response?.Data?.id}/view`);
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
							<th>Edit Challenges</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name</td>
							<td>
								<input
									type="text"
									class="input {form?.errors?.Name ? 'input-text-error' : ''}"
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
							<td>Description</td>
							<td>
								<input
										type="textarea"
										class="input {form?.errors?.Name
											? 'input-text-error'
											: ''}"
										name="description"
										placeholder="Enter transcript here..."
										bind:value={description}
									/>
								{#if errors?.Name}
								<p class="text-error">{errors?.Name}</p>
								{/if}
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
