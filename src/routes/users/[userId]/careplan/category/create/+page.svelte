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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Careplan Category</th>
							<th class="text-end">
								<a href={categoriesRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Type <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {errors?.Type ? 'input-text-error' : ''}"
									name="categoryType"
									placeholder="Enter category type here..."
									bind:value={categoryType}
								/>
								{#if errors?.Type}
									<p class="text-error">{errors?.Type}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
							<td>
								<textarea
									class="health-system-input {errors?.Description ? 'input-text-error' : ''}"
									name="categoryDescription"
									placeholder="Enter description here..."
									bind:value={categoryDescription}
									rows="4"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					{#await promise}
						<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
					{:then data}
						<Button size="md" type="submit" text="Submit" variant="primary" />
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
