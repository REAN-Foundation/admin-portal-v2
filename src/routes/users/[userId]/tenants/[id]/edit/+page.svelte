<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { createOrUpdateSchema } from '$lib/validation/tenants.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { TenantsUpdateModel } from '$lib/types/tenants.types';
	import Button from '$lib/components/button/button.svelte';

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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Tenant</th>
							<th class="text-end">
								<a href={viewRoute} class="form-cancel-btn">
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
									name="name"
									placeholder="Enter name here..."
									class="health-system-input"
									bind:value={name}
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
									name="description"
									placeholder="Enter description here..."
									class="health-system-input resize-none"
									bind:value={description}
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Code</td>
							<td>
								<input
									type="text"
									name="code"
									placeholder="Enter code here..."
									class="health-system-input"
									bind:value={code}
								/>
								{#if errors?.Code}
									<p class="text-error">{errors?.Code}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Phone</td>
							<td>
								<input
									type="text"
									name="phone"
									placeholder="Enter phone here..."
									class="health-system-input"
									bind:value={phone}
								/>
								{#if errors?.Phone}
									<p class="text-error">{errors?.Phone}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Email</td>
							<td>
								<input
									type="email"
									name="email"
									placeholder="Enter email here..."
									class="health-system-input"
									bind:value={email}
								/>
								{#if errors?.Email}
									<p class="text-error">{errors?.Email}</p>
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
