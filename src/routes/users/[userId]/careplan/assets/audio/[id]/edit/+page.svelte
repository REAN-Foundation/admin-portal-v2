<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { AudioUpdateModel } from '$lib/types/audio.type';
	import { createOrUpdateSchema } from '$lib/validation/audio.schema';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.audio.Name);
	let transcript = $state(data.audio.Transcript);
	let pathUrl = $state(data.audio.PathUrl);
	let version = $state(data.audio.Version);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	var audioId = page.params.id;

	const editRoute = `/users/${userId}/careplan/assets/audio/${audioId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/biometric/${audioId}/view`;
	const audioRoute = `/users/${userId}/careplan/assets/audio`;

	const breadCrumbs = [
		{ name: 'Audio', path: audioRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.audio?.Name;
		audioId = page.params.id;
		transcript = data?.audio?.Transcript;
		pathUrl = data?.audio?.PathUrl;
		version = data?.audio?.Version;
		keywords = data?.audio?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const audioUpdateModel: AudioUpdateModel = {
				Name: name,
				Transcript: transcript,
				PathUrl: pathUrl,
				Version: version,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(audioUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/audio/${audioId}`, {
				method: 'PUT',
				body: JSON.stringify(audioUpdateModel),
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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Audio</th>
							<th class="text-end">
								<a href={audioRoute} class="health-system-btn variant-soft-secondary">
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
									class="health-system-input {form?.errors?.Name ? 'input-text-error' : ''}"
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
							<td>Transcript</td>
							<td>
								<input
										type="textarea"
										class="health-system-input {form?.errors?.Name
											? 'input-text-error'
											: ''}"
										name="transcript"
										placeholder="Enter transcript here..."
										bind:value={transcript}
									/>
								{#if errors?.Name}
								<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>

						<tr>
                            <td>Url</td>
                            <td>
                                <input
                                    type="url"
									name="url"
									bind:value={pathUrl}
									placeholder="Enter url here"
                                    class="health-system-input {errors?.Url ? 'input-text-error' : ''}"
                                />
                                {#if errors?.Url}
                                    <p class="text-error">{errors?.Url}</p>
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
