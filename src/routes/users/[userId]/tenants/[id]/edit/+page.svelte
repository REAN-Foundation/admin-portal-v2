<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { createOrUpdateSchema } from '$lib/validation/tenants.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { TenantsUpdateModel } from '$lib/types/tenants.types';

	//////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.tenant.id;
	let name = $state(data.tenant.Name);
	let description = $state(data.tenant.Description);
	let code = $state(data.tenant.Code);
	let phone = $state(data.tenant.Phone);
	let email = $state(data.tenant.Email);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const editRoute = `/users/${userId}/tenants/${tenantId}/edit`;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;

	const breadCrumbs = [
		{
			name: 'Tenants',
			path: tenantRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];

	const handleReset = () => {
		name = data?.tenant?.Name;
		description = data?.tenant?.Description;
		code = data?.tenant?.Code;
		phone = data?.tenant?.Phone;
		email = data?.tenant?.Email;
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const tenantsUpdateModel: TenantsUpdateModel = {
				Name: name,
				Description: description,
				Code: code,
				Phone: phone,
				Email: email
			};

			const validationResult = createOrUpdateSchema.safeParse(tenantsUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants/${id}`, {
				method: 'PUT',
				body: JSON.stringify(tenantsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${tenantRoute}/${response?.Data?.Tenant?.id}/view`);
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
			<h2 class="form-titles">Edit Tenant</h2>
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
							name="name"
							placeholder="Enter name here..."
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
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
							placeholder="Enter description here..."
							class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Code</td>
					<td class="table-data">
						<input
							type="text"
							name="code"
							placeholder="Enter code here..."
							class="input {form?.errors?.Code ? 'input-text-error' : ''}"
							bind:value={code}
						/>
						{#if errors?.Code}
							<p class="error-text">{errors?.Code}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Phone</td>
					<td class="table-data">
						<input
							type="text"
							name="phone"
							placeholder="Enter phone here..."
							class="input {form?.errors?.Phone ? 'input-text-error' : ''}"
							bind:value={phone}
						/>
						{#if errors?.Phone}
							<p class="error-text">{errors?.Phone}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Email</td>
					<td class="table-data">
						<input
							type="email"
							name="email"
							placeholder="Enter email here..."
							class="input {form?.errors?.Email ? 'input-text-error' : ''}"
							bind:value={email}
						/>
						{#if errors?.Email}
							<p class="error-text">{errors?.Email}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary">
				Reset
			</button>
			{#await promise}
				<button type="submit" class="table-btn variant-filled-secondary" disabled>
					Submitting...
				</button>
			{:then}
				<button type="submit" class="table-btn variant-filled-secondary">Submit</button>
			{/await}
		</div>
	</form>
</div>
