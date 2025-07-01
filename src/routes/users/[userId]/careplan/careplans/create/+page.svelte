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
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

	////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let code = $state('');
	let categoryId = $state('');
	let description = $state('');
	let version = $state('');
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Careplan" />
			<a href={careplansRoute} class="form-cancel-btn">
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
							bind:value={name}
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
					<td class="table-data relative">
						<div class="relative w-full">
							<select
								name="categoryId"
								class="select select-primary w-full pr-10 {errors?.CategoryId
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
							<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
								<Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
							</div>
						</div>
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

				<tr class="tables-row align-top">
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
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
