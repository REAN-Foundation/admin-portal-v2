<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/web.links.schema.js';
	import type { WebLinksCreateModel } from '$lib/types/web.links.js';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state(undefined);
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let description = $state(undefined);
	let pathUrl = $state(undefined);
	let version = $state(undefined);

	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/web-links/create`;
	const weblinkRoute = `/users/${userId}/careplan/assets/web-links`;

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

			const webLinksCreateModels: WebLinksCreateModel = {
				Name: name,
				Description: description,
				PathUrl: pathUrl,
				Tags: keywords,
				Version: version,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(webLinksCreateModels);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			const res = await fetch(`/api/server/careplan/assets/web-links`, {
				method: 'POST',
				body: JSON.stringify(webLinksCreateModels),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${weblinkRoute}/${response?.Data?.id}/view`);
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

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Web Link</h2>
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">
						Name <span class="important-field">*</span>
					</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
							name="name"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label align-top">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
						{#if errors?.Description}
							<p class="error-text">{errors?.Description}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">URL</td>
					<td class="table-data">
						<input
							type="url"
							name="url"
							class="input {errors?.Url ? 'input-text-error' : ''}"
							placeholder="Enter url here"
							bind:value={pathUrl}
						/>
						{#if errors?.Url}
							<p class="error-text">{errors?.Url}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label !py-3 align-top">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="V 1.0"
							bind:value={version}
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<button type="submit" class="table-btn variant-soft-secondary" disabled>
					Submitting
				</button>
			{:then data}
				<button type="submit" class="table-btn variant-soft-secondary">
					Submit
				</button>
			{/await}
		</div>
	</form>
</div>

<!-- <div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Web link</h2>
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class=" table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Mame ? 'input-text-error' : ''}"
							name="name"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class=" table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Description
								? 'border-error-300'
								: 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">URL</td>
					<td class="table-data">
						<input
							type="url"
							class="input {form?.errors?.Url ? 'input-text-error' : ''}"
							name="url"
							placeholder="Enter url here"
							bind:value={pathUrl}
						/>
						{#if errors?.Url}
							<p class="error-text">{errors?.Url}</p>
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
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="V 1.0"
							bind:value={version}
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			<Button />
		</div>
	</form>
</div> -->
