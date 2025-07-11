<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { HealthSystemUpdateModel } from '$lib/types/health.system.types';
	import { createOrUpdateSchema } from '$lib/validation/health.system.schema';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { CarePlanUpdateModel } from '$lib/types/careplan.types';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let carePlanName = $state(data.carePlan.Name);
	let code = $state(data.carePlan.Code);
	let description = $state(data.carePlan.Description);
	let version = $state(data.carePlan.Version);
	let keywords: string[] = $state(data.carePlan.Tags);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let careplanCategory = $state(data.carePlan.Category.Type);
	let categoryId = $state(data.carePlan.CategoryId);
	let careplanCategories = $state(data.careplanCategories);

	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	let carePlanId = page.params.careplanId;
	const tenantId = data.tenantId;

	const editRoute = `/users/${userId}/careplan/careplans/${carePlanId}/edit`;
	const viewRoute = `/users/${userId}/careplan/careplans/${carePlanId}/view`;
	const careplanRoute = `/users/${userId}/careplan/careplans`;

	const breadCrumbs = [
		{ name: 'Careplans', path: careplanRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		carePlanName = data?.carePlan?.Name;
		code = data?.carePlan?.Code;
		description = data?.carePlan?.Description;
		carePlanId = page.params.id;
		keywords = data?.carePlan?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const careplanUpdateModel: CarePlanUpdateModel = {
				Name: carePlanName,
				Code: code,
				CategoryId: categoryId,
				Description: description,
				Version: version,
				Tags: keywords,
				OwnerUserId: userId,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(careplanUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/${carePlanId}`, {
				method: 'PUT',
				body: JSON.stringify(careplanUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response response', response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${careplanRoute}/${response?.Data?.id}/view`);
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
			<h2 class="form-titles">Edit Careplan</h2>
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
							class="input {form?.errors?.carePlanName ? 'input-text-error' : ''}"
							name="name"
							placeholder="Enter name here..."
							bind:value={carePlanName}
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
							class="input {form?.errors?.code ? 'input-text-error' : ''}"
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
						<div class="relative w-full">
							<select
								name="categoryId"
								class="select select-primary w-full pr-10 {errors?.categoryId
									? 'input-text-error'
									: ''}"
								bind:value={categoryId}
								required
							>
								<option disabled selected>Select category of plan here...</option>
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

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.description ? 'input-text-error' : ''}"
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
					<td class="table-label align-top">Tags</td>
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
							class="input {form?.errors?.version ? 'input-text-error' : ''}"
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
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
