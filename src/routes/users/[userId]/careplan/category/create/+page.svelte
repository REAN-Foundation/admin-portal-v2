<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { createOrUpdateCategorySchema } from '$lib/validation/careplan.category.schema.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { CareplanCategoryCreateModel } from '$lib/types/careplan.category.types.js';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let categoryType = $state(undefined);
	let categoryDescription = $state(undefined);
	let promise = $state();
	data.title = 'Careplan Categories-Category Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/careplan/category/create`;
	const categoriesRoute = `/users/${userId}/careplan/category`;
	const breadCrumbs = [
		{ name: 'Careplan Categories', path: categoriesRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const categoryCreateModel: CareplanCategoryCreateModel = {
				Type: categoryType,
				Description: categoryDescription
			};

			const validationResult = createOrUpdateCategorySchema.safeParse(categoryCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/category`, {
				method: 'POST',
				body: JSON.stringify(categoryCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${categoriesRoute}/${response?.Data?.id}/view`);
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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Careplan Category</h2>
			<a href={categoriesRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Type <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.Type ? 'input-text-error' : ''}"
							name="categoryType"
							placeholder="Enter category type here..."
							bind:value={categoryType}
						/>
						{#if errors?.Type}
							<p class="error-text">{errors?.Type}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
							name="categoryDescription"
							placeholder="Enter description here..."
							bind:value={categoryDescription}
							rows="4"
						></textarea>
						{#if errors?.Description}
							<p class="error-text">{errors?.Description}</p>
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
