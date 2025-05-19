<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/tenants.schema.js';
	import type { TenantsCreateModel } from '$lib/types/tenants.types';

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
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Create Tenant</th>
							<th class="text-end">
								<a href={tenantRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name *</td>
							<td>
								<input
									type="text"
									name="name"
									bind:value={name}
									class="input w-full {errors?.Name ? 'border-error-300' : 'border-primary-200'}"
									placeholder="Enter name here..."
								/>
								{#if errors?.Name}
									<p class="text-error-500 text-xs">{errors?.Name}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={description}
									placeholder="Enter description here..."
								></textarea>
							</td>
						</tr>

						<tr>
							<td>Code *</td>
							<td>
								<input
									type="text"
									name="code"
									bind:value={code}
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									placeholder="Enter code here..."
								/>
								{#if errors?.Code}
									<p class="text-error-500 text-xs">{errors?.Code}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Contact Number *</td>
							<td>
								<input
									type="text"
									name="phone"
									bind:value={phone}
									class="input w-full {errors?.Phone ? 'border-error-300' : 'border-primary-200'}"
									placeholder="Enter phone here..."
								/>
								{#if errors?.Phone}
									<p class="text-error-500 text-xs">{errors?.Phone}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Email *</td>
							<td>
								<input
									type="email"
									name="email"
									bind:value={email}
									class="input w-full {errors?.Email ? 'border-error-300' : 'border-primary-200'}"
									placeholder="Enter email here..."
								/>
								{#if errors?.Email}
									<p class="text-error-500 text-xs">{errors?.Email}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>

				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
