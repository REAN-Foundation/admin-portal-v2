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
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
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
			<Heading text="Edit Care Plan" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="name"
							type="text"
							placeholder="Enter name here..."
							bind:value={carePlanName}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Code" required={true} />
					<td class="table-data">
						<Input
							name="code"
							type="text"
							placeholder="Enter code here..."
							bind:value={code}
							error={errors?.Code}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Category" required={true} />
					<td class="table-data">
						<select
							name="categoryId"
							class="select select-primary w-full {errors?.CategoryId ? 'input-text-error' : ''}"
							bind:value={categoryId}
							required
						>
							<option disabled selected>Select category of plan here...</option>
							{#each careplanCategories as category}
								<option value={category.id}>{category.Type}</option>
							{/each}
						</select>
						{#if errors?.CategoryId}
							<p class="text-error">{errors?.CategoryId}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Version" />
					<td class="table-data">
						<Input
							name="version"
							type="text"
							placeholder="Enter version here..."
							bind:value={version}
							error={errors?.Version}
						/>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
