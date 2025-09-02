<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { WordPowerUpdateModel } from '$lib/types/word.power';
	import { createOrUpdateSchema } from '$lib/validation/word.power.schema';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.wordPower.id;
	let assetCode = data.wordPower.AssetCode;
	let name = $state(data.wordPower.Name);
	let description = $state(data.wordPower.Description || undefined);
	let additionalResources = $state(data.wordPower.AdditionalResources || undefined);
	let tags = $state(data.wordPower.Tags);
	let version = $state(data.wordPower.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.wordPower.Tags);

	const userId = page.params.userId;
	const wordPowerId = page.params.id;
	const tenantId = data.tenantId;

	const assetType = page.url.searchParams.get('assetType') || 'Word power';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const createRoute = `/users/${userId}/careplan/assets/word-power/create`;
	const editRoute = `/users/${userId}/careplan/assets/word-power/${wordPowerId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/word-power/${wordPowerId}/view`;
	const wordpowerRoute = `/users/${userId}/careplan/assets/word-power`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Word power',
			path: createRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];
	const handleReset = () => {
		name = data?.wordPower?.Name;
		description = data?.wordPower?.Description;
		additionalResources = data?.wordPower?.AdditionalResources;
		tags = data?.wordPower?.Tags;
		version = data?.wordPower?.Version;
	};
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const WordPowerUpdateModel: WordPowerUpdateModel = {
				Name: name,
				Description: description,
				AdditionalResources: additionalResources,
				Tags: keywords,
				Version: version,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(WordPowerUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/word-power/${id}`, {
				method: 'PUT',
				body: JSON.stringify(WordPowerUpdateModel),
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
	$effect(() => {
            keywordsStr = keywords?.join(', ');
        });

</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Word Power</h2>
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
					<td class="table-label">Additional Resources</td>
					<td class="table-data">
						<input
							type="text"
							name="additionalResources"
							placeholder="Enter word power additonal resources here..."
							class="input"
							bind:value={additionalResources}
						/>
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
