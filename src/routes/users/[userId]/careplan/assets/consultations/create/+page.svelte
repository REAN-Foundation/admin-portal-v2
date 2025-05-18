<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ConsultationCreateModel } from '$lib/types/consultation.types.js';
	import { createOrUpdateSchema } from '$lib/validation/consultation.schema.js';

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
	let description = $state('');
	let version = $state('');
	let consultationType = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Create Consultation';
	const userId = page.params.userId;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/consultations/create`;
	const consultationRoute = `/users/${userId}/careplan/assets/consultations`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Consultation', path: consultationRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const consultationCreateModel: ConsultationCreateModel = {
				Name: name,
				Description: description,
				Version: version,
				ConsultationType: consultationType,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(consultationCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(consultationCreateModel)
			const res = await fetch(`/api/server/careplan/assets/consultations`, {
				method: 'POST',
				body: JSON.stringify(consultationCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log("Redirecting to:", response?.Data?.id); 
				console.log("Full response:", response);
				await goto(`${consultationRoute}/${response?.Data?.id}/view`); 
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
						<th>Create Consultation</th>
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
						<td>Consultation Type </td>
						<td>
							<select class="input" bind:value={consultationType}>
								<option disabled value>Select Consultation type</option>
								<option>Tele-consultation</option>
								<option>Visit-consultation</option>
								<option>Other</option>
							</select>
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
