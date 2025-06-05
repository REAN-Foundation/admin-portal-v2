<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { AudioCreateModel } from '$lib/types/audio.type.js';
	import { createOrUpdateSchema } from '$lib/validation/audio.schema.js';

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
	let transcript = $state('');
	let pathUrl = $state(undefined);
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Create Audio';
	const userId = page.params.userId;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/audio/create`;
	const audioRoute = `/users/${userId}/careplan/assets/audio`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const audioCreateModel: AudioCreateModel = {
				Name: name,
				Transcript: transcript,
				PathUrl: pathUrl,
				Version: version,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(audioCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(audioCreateModel);
			const res = await fetch(`/api/server/careplan/assets/audio`, {
				method: 'POST',
				body: JSON.stringify(audioCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log("Redirecting to:", response?.Data?.id);
				console.log('Full response:', response);
				await goto(`${audioRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>

	<div class="form-headers">
			<h2 class="form-titles">Create Audio</h2>
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
				<table class="w-full">
					<!-- <thead>
						<tr>
							<th>Create Audio</th>
							<th class="text-end">
								<a href={assetRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead> -->
					<tbody>
						<tr class="tables-row">
							<td class="table-label">Name <span class="text-red-700">*</span></td>
							<td class="table-data">
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

						<tr class="tables-row">
							<td class="table-label">Transcript</td>
							<td class="table-data">
								<textarea
									name="transcript"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={transcript}
									placeholder="Enter transcript here..."
								></textarea>
							</td>
						</tr>

						<tr class="tables-row">
							<td class="table-label">Url</td>
							<td class="table-data">
								<input
									type="url"
									name="url"
									bind:value={pathUrl}
									placeholder="Enter url here"
                                    class="input {errors?.Url ? 'input-text-error' : ''}"
                                />
                                {#if errors?.Url}
                                    <p class="text-error">{errors?.Url}</p>
                                {/if}
                            </td>
                        </tr>
						<tr class="tables-row">
                            <td class="table-label">Tags</td>
                            <td class="table-data">
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
						<tr class="tables-row">
							<td class="table-label">Version</td>
							<td class="table-data">
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
	

