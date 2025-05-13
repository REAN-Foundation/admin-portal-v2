<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { AnimationsUpdateModel } from '$lib/types/animation';
	import { createOrUpdateSchema } from '$lib/validation/animation.schema';

	/////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.animation.id;
	let assetCode = data.animation.AssetCode;
	let name = $state(data.animation.Name);
	let transcript = $state(data.animation.Transcript);
	let pathUrl = $state(data.animation.Url);
	let tags = $state(data.animation.Tags);
	let version = $state(data.animation.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.animation.Tags);

	const userId = page.params.userId;
	const animationId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/animations/${animationId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/animations/${animationId}/view`;
	const animationRoute = `/users/${userId}/careplan/assets/animations`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Animation',
			path: animationRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];
	const handleReset = () => {
		name = data?.animation?.Name;
		transcript = data?.animation?.Transcript;
		pathUrl = data?.animation?.PathUrl;
		tags = data?.animation?.Tags;
		version = data?.animation?.Version;
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const animationsUpdateModel: AnimationsUpdateModel = {
				Name: name,
				Transcript: transcript,
				PathUrl: pathUrl,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(animationsUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/animation/${id}`, {
				method: 'PUT',
				body: JSON.stringify(animationsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${animationRoute}/${response?.Data?.id}/view`);
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
							<th>Edit Animation</th>
							<th class="text-end">
								<a href={viewRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
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
							<td>Transcript</td>
							<td>
								<textarea
									name="transcript"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={transcript}
									placeholder="Enter transcript here..."
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Path Url</td>
							<td>
								<input
									type="url"
									class="table-input-field {form?.errors?.PathUrl ? 'input-text-error' : ''}"
									name="pathUrl"
									placeholder="Enter url here"
									bind:value={pathUrl}
								/>
								{#if errors?.Url}
									<p class="text-error-500 text-xs">{errors?.PathUrl}</p>
								{/if}
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
