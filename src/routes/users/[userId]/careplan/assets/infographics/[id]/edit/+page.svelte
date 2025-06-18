<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { InfographicsUpdateModel } from '$lib/types/infographics.types';
	import { createOrUpdateSchema } from '$lib/validation/infographics.schema';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.infographics.Name);
	let description = $state(data.infographics.Description);
	let pathUrl = $state(data.infographics.Url);
	let version = $state(data.infographics.Version);
	let keywords: string[] = $state(data.infographics.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var infographicsId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/infographics/${infographicsId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/infographics/${infographicsId}/view`;
	const infographicsRoute = `/users/${userId}/careplan/assets/infographics`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.infographics?.Name;
		infographicsId = page.params.id;
		description = data?.infographics?.Description;
		pathUrl = data?.infographics?.Url;
		version = data?.infographics?.Version;
		keywords = data?.infographics?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const infographicsUpdateModel: InfographicsUpdateModel = {
				Name: name,
				Description: description,
				Url: pathUrl,
				Version: version,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(infographicsUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/infographics/${infographicsId}`, {
				method: 'PUT',
				body: JSON.stringify(infographicsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log('Full response:', response);
				await goto(`${infographicsRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Infographics</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="important-field">*</span></td>
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
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Description ? 'input-text-error' : ''}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
						{#if errors?.Description}
							<p class="error-text">{errors?.Description}</p>
						{/if}
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
			<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary">
				Reset
			</button>
			{#await promise}
				<button type="submit" class="table-btn variant-soft-secondary" disabled>
					Submitting
				</button>
			{:then}
				<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
			{/await}
		</div>
	</form>
</div>
