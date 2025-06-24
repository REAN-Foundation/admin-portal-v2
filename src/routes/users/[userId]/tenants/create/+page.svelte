<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/tenants.schema.js';
	import type { TenantsCreateModel } from '$lib/types/tenants.types';
	import Button from '$lib/components/button/button.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';

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
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Tenant" />
			<a href={tenantRoute} class="form-cancel-btn">
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
					<Label text="Contact Number" required={true} />
					<td class="table-data">
						<Input
							name="phone"
							type="text"
							placeholder="Enter contact number here..."
							bind:value={phone}
							error={errors?.Phone}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Email" required={true} />
					<td class="table-data">
						<Input
							name="email"
							type="email"
							placeholder="Enter email here..."
							bind:value={email}
							error={errors?.Email}
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
