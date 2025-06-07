<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ArticlesUpdateModel } from '$lib/types/articles';
	import { createOrUpdateSchema } from '$lib/validation/articles.schema';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////
	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.article.id;
	let assetCode = data.article.AssetCode;
	let name = $state(data.article.Name);
	let summary = $state(data.article.Summary);
	let pathUrl = $state(data.article.PathUrl);
	let tags = $state(data.article.Tags);
	let version = $state(data.article.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.article.Tags);

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	const articleId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/articles/${articleId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/articles/${articleId}/view`;
	const articleRoute = `/users/${userId}/careplan/assets/articles`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},

		{
			name: 'Edit',
			path: editRoute
		}
	];
	const handleReset = () => {
		name = data?.article?.Name;
		summary = data?.article?.Summary;
		pathUrl = data?.article?.PathUrl;
		tags = data?.article?.Tags;
		version = data?.article?.Version;
	};
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const articlesUpdateModel: ArticlesUpdateModel = {
				Name: name,
				Summary: summary,
				PathUrl: pathUrl,
				Tags: keywords,
				Version: version,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(articlesUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/articles/${id}`, {
				method: 'PUT',
				body: JSON.stringify(articlesUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${articleRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Article</h2>
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
					<td class="table-label">Summary</td>
					<td class="table-data">
						<textarea
							name="summary"
							class="input resize-none {errors?.Summary
								? 'border-error-300'
								: 'border-primary-200'}"
							bind:value={summary}
							placeholder="Enter summary here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Path Url</td>
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
			<Button />
		</div>
	</form>
</div>
