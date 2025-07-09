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
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let categoryType = $state(data.careplanCategory.Type);
	let categoryDescription = $state(data.careplanCategory.Description || undefined);
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Edit Careplan Category" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Type" required={true} />
					<td class="table-data">
						<Input
							name="categoryType"
							type="text"
							placeholder="Enter category type here..."
							bind:value={categoryType}
							error={errors?.Type}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="categoryDescription"
							placeholder="Enter description here..."
							bind:value={categoryDescription}
							error={errors?.Description}
							resize={false}
							rows={4}
						/>
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
