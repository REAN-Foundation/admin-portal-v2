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
	let password = $state(undefined);
	let username = $state(undefined);
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
				Email: email,
				Username: username,
				Password: password
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

<div class="p-6">
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
					<td class="table-label">Name <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							bind:value={name}
							class="input {errors?.name ? 'input-text-error' : ''}"
							name="name"
							placeholder="Enter name here..."
						/>
						{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							bind:value={description}
							name="description"
							placeholder="Enter description here..."
							class="input resize-none {errors?.description ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Code <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							bind:value={code}
							class="input {errors?.code ? 'input-text-error' : ''}"
							name="code"
							placeholder="Enter code here..."
						/>
						{#if errors?.Code}
							<p class="text-error">{errors?.Code}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Contact Number <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							bind:value={phone}
							class="input {errors?.phone ? 'input-text-error' : ''}"
							name="phone"
							placeholder="Enter contact number here..."
						/>
						{#if errors?.Phone}
							<p class="text-error">{errors?.Phone}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Email <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="email"
							bind:value={email}
							class="input {errors?.email ? 'input-text-error' : ''}"
							name="email"
							placeholder="Enter email here..."
						/>
						{#if errors?.Email}
							<p class="text-error">{errors?.Email}</p>
						{/if}
					</td>
				</tr>
					<tr>
							<td>Username <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									bind:value={username}
									class="input {errors?.username ? 'input-text-error' : ''}"
									name="username"
									placeholder="Enter username here..."
								/>
								{#if errors?.Username}
									<p class="text-error">{errors?.Username}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Password <span class="text-red-600">*</span></td>
							<td>
								<input
									type="password"
									bind:value={password}
									class="input {errors?.password ? 'input-text-error' : ''}"
									name="password"
									placeholder="Enter password here..."
								/>
								{#if errors?.Password}
									<p class="text-error">{errors?.Password}</p>
								{/if}
							</td>
						</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
