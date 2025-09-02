<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { GoalsUpdateModel } from '$lib/types/goals';
	import { createOrUpdateSchema } from '$lib/validation/goals.schema';
	import Button from '$lib/components/button/button.svelte';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.goals.Name);
	let description = $state(data.goals.Description || undefined);
	let version = $state(data.goals.Version);
	let keywords: string[] = $state(data.goals.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var goalsId = page.params.id;
	// Get asset type from URL params or default to 'Goal'
	const assetType = page.url.searchParams.get('assetType') || 'Goal';

	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const createRoute = `/users/${userId}/careplan/assets/goals/create`;
	const editRoute = `/users/${userId}/careplan/assets/goals/${goalsId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/goals/${goalsId}/view`;
	const goalsRoute = `/users/${userId}/careplan/assets/goals`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Goal', path: createRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.goals?.Name;
		goalsId = page.params.id;
		description = data?.goals?.Description;
		version = data?.goals?.Version;
		keywords = data?.goals?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const goalsUpdateModel: GoalsUpdateModel = {
				Name: name,
				Description: description,
				Version: version,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(goalsUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/goals/${goalsId}`, {
				method: 'PUT',
				body: JSON.stringify(goalsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log('Full response:', response);
				await goto(`${goalsRoute}/${response?.Data?.id}/view`);
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
			<h2 class="form-titles">Edit Goal</h2>
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
							class="input resize-none {form?.errors?.Description ? 'input-text-error' : ''}"
							placeholder="Enter description here..."
							bind:value={description}
						></textarea>
						{#if errors?.Description}
							<p class="error-text">{errors?.Description}</p>
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
