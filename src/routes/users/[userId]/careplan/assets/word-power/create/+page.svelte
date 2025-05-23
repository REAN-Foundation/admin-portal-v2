<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { WordPowerCreateModel } from '$lib/types/word.power';
	import { createOrUpdateSchema } from '$lib/validation/word.power.schema.js';
	/////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state(undefined);
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let description = $state(undefined);
	let additionalResources = $state(undefined);
	let version = $state(undefined);

	const userId = page.params.userId;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/word-power/create`;
	const wordpowerRoute = `/users/${userId}/careplan/assets/word-power`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		
		{
			name: 'Create',
			path: createRoute
		}
	];
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const wordPowerCreateModel: WordPowerCreateModel = {
				Name: name,
				Description: description,
				AdditionalResources: additionalResources,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(wordPowerCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(`/api/server/careplan/assets/word-power`, {
				method: 'POST',
				body: JSON.stringify(wordPowerCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${wordpowerRoute}/${response?.Data?.id}/view`);
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
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Create Word power</th>
							<th class="text-end">
								<a href={assetRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name *</td>
							<td>
								<input
									type="text"
									class="input {form?.errors?.name ? 'input-text-error' : ''}"
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
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									class="input w-full {errors?.Description
										? 'border-error-300'
										: 'border-primary-200'}"
									bind:value={description}
									placeholder="Enter description here..."
								></textarea>
							</td>
						</tr>
						<tr>
							<td class="align-top">Additional Resources</td>
							<td>
								<input
									type="text"
									placeholder="Enter word power additionalresources here..."
									class="input {form?.errors?.AdditionalResources ? 'input-text-error' : ''}"
									name="additionalResources"
								/>
							</td>
						</tr>
						<tr>
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
								<input
									type="text"
									class="input {form?.errors?.version ? 'input-text-error' : ''}"
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
