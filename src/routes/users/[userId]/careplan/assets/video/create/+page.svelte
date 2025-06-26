<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { VideoCreateModel } from '$lib/types/video.js';
	import { createOrUpdateSchema } from '$lib/validation/video.schema.js';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state(undefined);
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let transcript = $state(undefined);
	let pathUrl = $state(undefined);
	let version = $state(undefined);

	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/video/create`;
	const videoRoute = `/users/${userId}/careplan/assets/video`;

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

			const videoCreateModel: VideoCreateModel = {
				Name: name,
				Transcript: transcript,
				PathUrl: pathUrl,
				Tags: keywords,
				Version: version,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(videoCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(`/api/server/careplan/assets/video`, {
				method: 'POST',
				body: JSON.stringify(videoCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${videoRoute}/${response?.Data.id}/view`);
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
            keywordsStr = keywords?.join(', ');
        });

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>

	<div class="form-headers">
			<h2 class="form-titles">Create Video</h2>
			<a href={assetRoute} class="form-cancel-btn">
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
							<td class="table-label">URL</td>
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
            		{#await promise}
                		<Button type="submit" text="Submitting" variant="primary" disabled={true} />
            		{:then data}
                		<Button type="submit" text="Submit" variant="primary" />
            		{/await}
				</div>
			</form>
		</div>
	
