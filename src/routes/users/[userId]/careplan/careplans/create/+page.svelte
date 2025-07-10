<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { createOrUpdateSchema } from '$lib/validation/care.plan.schema.js';
	import type { CarePlanCreateModel } from '$lib/types/careplan.types.js';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state(undefined);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let code = $state(undefined);
	let categoryId = $state(undefined);
	let description = $state(undefined);
	let version = $state(undefined);
	let promise = $state();
	let careplanCategories = $state(data.careplanCategories);

	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;
	const createRoute = `/users/${userId}/careplan/careplans/create`;
	const careplansRoute = `/users/${userId}/careplan/careplans`;

	data.title = 'Care Plans - Create';

	const breadCrumbs = [
		{
			name: 'Careplans',
			path: careplansRoute
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
			console.log('keywords', keywords);
			const payload: CarePlanCreateModel = {
				Name: name,
				Description: description,
				Code: code,
				CategoryId: categoryId,
				Tags: keywords,
				Version: version,
				OwnerUserId: userId,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(payload);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch('/api/server/careplan', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' }
			});
			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${careplansRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
				errors = response.Errors;
			} else {
				toastMessage(response);
			}
		} catch (err) {
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
			<h2 class="form-titles">Create Careplan</h2>
			<a href={careplansRoute} class="form-cancel-btn">
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
							class="input {errors?.name ? 'input-text-error' : ''}"
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
					<td class="table-label">Code <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.code ? 'input-text-error' : ''}"
							name="code"
							placeholder="Enter code here..."
							bind:value={code}
						/>
						{#if errors?.Code}
							<p class="error-text">{errors?.Code}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Category <span class="important-field">*</span></td>
					<td class="table-data">
						<div class="relative ">
							<select
								name="categoryId"
								class="select  {errors?.categoryId
									? 'input-text-error'
									: ''}"
								bind:value={categoryId}
							>
								<!-- <option disabled selected>Select category of plan here...</option> -->
								{#each careplanCategories as category}
									<option value={category.id}>{category.Type}</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
					</td>
				</tr>
				<tr> </tr><tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.description ? 'input-text-error' : ''}"
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
						/>
						{#if errors?.Description}
							<p class="error-text">{errors?.Description}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="Enter version here..."
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
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
