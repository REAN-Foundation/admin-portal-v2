<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { NutritionUpdateModel } from '$lib/types/nutrition.types';
	import { createOrUpdateSchema } from '$lib/validation/nutrition.schema';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.nutrition.id;
	let assetCode = data.nutrition.AssetCode;
	let name = $state(data.nutrition.Name);
	let description = $state(data.nutrition.Description);
	let tags = $state(data.nutrition.Tags);
	let version = $state(data.nutrition.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.nutrition.Tags);

	const userId = page.params.userId;
	const nutritionId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/nutritions/${nutritionId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/nutritions/${nutritionId}/view`;
	const nutritionRoute = `/users/${userId}/careplan/assets/nutritions`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Nutrition',
			path: nutritionRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];
	const handleReset = () => {
		name = data?.nutrition?.Name;
		description = data?.nutrition?.Description;
		tags = data?.nutrition?.Tags;
		version = data?.nutrition?.Version;
	};
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const nutritionUpdateModel: NutritionUpdateModel = {
				Name: name,
				Description: description,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(nutritionUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/nutrition/${id}`, {
				method: 'PUT',
				body: JSON.stringify(nutritionUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${nutritionRoute}/${response?.Data?.id}/view`);
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
	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Nutrition</th>
							<th class="text-end">
								<a href={viewRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead><tbody>
						<tr>
							<td>Asset Code</td>
							<td>{assetCode}</td>
						</tr>
						<tr>
							<td>Name *</td>
							<td>
								<input
									type="text"
									class="table-input-field {form?.errors?.Name ? 'input-text-error' : ''}"
									name="name"
									placeholder="Enter name here..."
									bind:value={name}
								/>
								{#if errors?.Name}
									<p class="text-error-500 text-xs">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
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
							<td class="!py-3">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
							</td>
						</tr>
						<tr>
							<td>Version</td>
							<td>
								<input
									type="text"
									class="table-input-field {form?.errors?.Version ? 'input-text-error' : ''}"
									name="version"
									placeholder="V 1.0"
									bind:value={version}
								/>
								{#if errors?.Version}
									<p class="text-error-500 text-xs">{errors?.Version}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary"
						>Reset</button
					>
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
