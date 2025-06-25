<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { CareplanCategoryUpdateModel } from '$lib/types/careplan.category.types';
	import { createOrUpdateCategorySchema } from '$lib/validation/careplan.category.schema';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let categoryType = $state(data.careplanCategory.Type);
	let categoryDescription = $state(data.careplanCategory.Description);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	var categoryId = page.params.catogoryId;

	const editRoute = `/users/${userId}/careplan/category/${categoryId}/edit`;
	const viewRoute = `/users/${userId}/careplan/category/${categoryId}/view`;
	const categoriesRoute = `/users/${userId}/careplan/category`;

	const breadCrumbs = [
		{ name: 'Careplan Categories', path: categoriesRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		categoryType = data?.careplanCategory?.Type;
		categoryDescription = data?.careplanCategory?.Description;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const categoryUpdateModel: CareplanCategoryUpdateModel = {
				Type: categoryType,
				Description: categoryDescription
			};

			const validationResult = createOrUpdateCategorySchema.safeParse(categoryUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/category/${categoryId}`, {
				method: 'PUT',
				body: JSON.stringify(categoryUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
            console.log("response in edit ==>",response);

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
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Careplan Category</th>
							<th class="text-end">
								<a href={viewRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Type <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {errors?.Type ? 'input-text-error' : ''}"
									name="categoryType"
									placeholder="Enter category type here..."
									bind:value={categoryType}
								/>
								{#if errors?.Type}
									<p class="text-error-500 text-xs">{errors?.Type}</p>
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
									<p class="text-error-500 text-xs">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
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
