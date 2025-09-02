<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/web.links.schema';
	import type { WebNewsfeedsUpdateModel } from '$lib/types/web.newsfeeds';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.webNewsfeed.id;
	let assetCode = data.webNewsfeed.AssetCode;
	let name = $state(data.webNewsfeed.Name);
	let description = $state(data.webNewsfeed.Description ?? undefined);
	let pathUrl = $state(data.webNewsfeed.Url || undefined);
	let tags = $state(data.webNewsfeed.Tags);
	let version = $state(data.webNewsfeed.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.webNewsfeed.Tags);

	const userId = page.params.userId;
	const webNewsfeedId = page.params.id;
	const tenantId = data.tenantId;

	const assetType = page.url.searchParams.get('assetType') || 'Web newsfeed';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const createRoute = `/users/${userId}/careplan/assets/web-newsfeeds/create`;
	const editRoute = `/users/${userId}/careplan/assets/web-newsfeeds/${webNewsfeedId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/web-newsfeeds/${webNewsfeedId}/view`;
	const webNewsfeedRoute = `/users/${userId}/careplan/assets/web-newsfeeds`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Web newsfeed',
			path: createRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];
	const handleReset = () => {
		name = data?.webNewsfeed?.Name;
		description = data?.webNewsfeed?.Description;
		pathUrl = data?.webNewsfeed?.PathUrl;
		tags = data?.webNewsfeed?.Tags;
		version = data?.webNewsfeed?.Version;
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const webNewsfeedsUpdateModel: WebNewsfeedsUpdateModel = {
				Name: name,
				Description: description,
				PathUrl: pathUrl,
				Tags: keywords,
				Version: version,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(webNewsfeedsUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/web-newsfeeds/${id}`, {
				method: 'PUT',
				body: JSON.stringify(webNewsfeedsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${webNewsfeedRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Web Newsfeed</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Asset Code</td>
					<td class="table-data">{assetCode}</td>
				</tr>
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
							class="input {form?.errors?.PathUrl ? 'input-text-error' : ''}"
							name="pathUrl"
							placeholder="Enter url here"
							bind:value={pathUrl}
						/>
						{#if errors?.Url}
							<p class="error-text">{errors?.PathUrl}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"						/>
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
            <Button type="button" onclick={handleReset} text="Reset" variant="primary" />
            {#await promise}
                <Button type="submit" text="Submitting" variant="primary" disabled={true} />
            {:then data}
                <Button type="submit" text="Submit" variant="primary" />
            {/await}
		</div>
	</form>
</div>
