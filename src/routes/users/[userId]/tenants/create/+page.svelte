<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/tenants.schema.js';
	import type { TenantsCreateModel } from '$lib/types/tenants.types';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state(undefined);
	let description = $state(undefined);
	let code = $state(undefined);
	let phone = $state(undefined);
	let email = $state(undefined);
	let promise = $state();

	data.title = 'Tenants Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/tenants/create`;
	const tenantRoute = `/users/${userId}/tenants`;

	const breadCrumbs = [
		{ name: 'Tenants', path: tenantRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const tenantsCreateModel: TenantsCreateModel = {
				Name: name,
				Description: description,
				Code: code,
				Phone: phone,
				Email: email
			};

			const validationResult = createOrUpdateSchema.safeParse(tenantsCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants`, {
				method: 'POST',
				body: JSON.stringify(tenantsCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			console.log(response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${tenantRoute}/${response?.Data?.Tenant?.id}/view`);
				return;
			}

			if (response.Errors) {
				errors = response.Errors;
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
							<th>Create Tenant</th>
							<th class="text-end">
								<a href={tenantRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									bind:value={name}
									class="health-system-input"
									name="name"
									placeholder="Enter name here..."
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Description</td>
							<td>
								<textarea
									bind:value={description}
									name="description"
									placeholder="Enter description here..."
									class="health-system-input resize-none"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Code <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									bind:value={code}
									class="health-system-input"
									name="code"
									placeholder="Enter code here..."
								/>
								{#if errors?.Code}
									<p class="text-error">{errors?.Code}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Contact Number <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									bind:value={phone}
									class="health-system-input"
									name="phone"
									placeholder="Enter contact number here..."
								/>
								{#if errors?.Phone}
									<p class="text-error">{errors?.Phone}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Email <span class="text-red-600">*</span></td>
							<td>
								<input
									type="email"
									bind:value={email}
									class="health-system-input"
									name="email"
									placeholder="Enter email here..."
								/>
								{#if errors?.Email}
									<p class="text-error">{errors?.Email}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>

				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submitting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary">Submit</button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>


<!-- <div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Tenant</h2>
			<a href={tenantRoute} class="form-cancel-btn">
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
							name="name"
							bind:value={name}
							class="input {errors?.Name ? 'input-text-error' : ''}"
							placeholder="Enter name here..."
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
							bind:value={description}
							class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Code <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="code"
							bind:value={code}
							class="input {errors?.Code ? 'input-text-error' : ''}"
							placeholder="Enter code here..."
						/>
						{#if errors?.Code}
							<p class="error-text">{errors?.Code}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Contact Number <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="phone"
							bind:value={phone}
							class="input {errors?.Phone ? 'input-text-error' : ''}"
							placeholder="Enter phone here..."
						/>
						{#if errors?.Phone}
							<p class="error-text">{errors?.Phone}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Email <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="email"
							name="email"
							bind:value={email}
							class="input {errors?.Email ? 'input-text-error' : ''}"
							placeholder="Enter email here..."
						/>
						{#if errors?.Email}
							<p class="error-text">{errors?.Email}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button />
		</div>
	</form>
</div> -->
