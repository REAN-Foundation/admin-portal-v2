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
	import Button from '$lib/components/button/button.svelte';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.audio.Name);
	let transcript = $state(data.audio.Transcript || undefined);
	let pathUrl = $state(data.audio.Url || undefined);
	let version = $state(data.audio.Version);
	let tags = $state(data.audio.Tags);
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.audio.Tags);


	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var audioId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/audio/${audioId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/audio/${audioId}/view`;
	const audioRoute = `/users/${userId}/careplan/assets/audio`;

	const breadCrumbs = [
		{ name: 'Assets',path: assetRoute },
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
				Tags: keywords,
				TenantId: tenantId
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
				goto(`${audioRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	$effect(() => {
            keywordsStr = keywords?.join(', ');
        });

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Audio</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name</td>
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
							<input
									type="textarea"
									class="input {errors?.Transcript
											? 'input-text-error'
											: ''}"
									name="transcript"
									placeholder="Enter transcript here..."
									bind:value={transcript}
								/>
								{#if errors?.Transcript}
								<p class="text-error">{errors?.Transcript}</p>
								{/if}
							</td>
						</tr>

						<tr class="tables-row">
                            <td class="table-label">URL</td>
                            <td class="table-data">
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

						<tr class="tables-row">
							<td class="table-label">Tags</td>
							<td class="table-data">
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
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
