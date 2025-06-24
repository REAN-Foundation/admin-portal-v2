<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { PersonRoleCreateModel } from '$lib/types/person.role.types.js';
	import { createOrUpdateSchema } from '$lib/validation/person.role.schemas.js';
	import Icon from '@iconify/svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let roleName = $state(undefined);
	let description = $state(undefined);
	let errors: Record<string, string> = $state({});

	let promise = $state();

	data.title = 'Administration-User Roles Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/user-roles/create`;
	const personRoleTypesRoute = `/users/${userId}/user-roles`;

	const breadCrumbs = [
		{
			name: 'User Roles',
			path: personRoleTypesRoute,
			home: true
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

			const personRoleCreateModel: PersonRoleCreateModel = {
				Name: roleName,
				Description: description
			};

			const validationResult = createOrUpdateSchema.safeParse(personRoleCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);

				return;
			}

			const res = await fetch(`/api/server/person-role-types`, {
				method: 'POST',
				body: JSON.stringify(personRoleCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			console.log(response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${personRoleTypesRoute}/${response?.Data?.RoleType?.id}/view`);
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
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create User Role" />
			<a href={personRoleTypesRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Role Name" required={true} />
					<td class="table-data">
						<Input
							name="roleName"
							type="text"
							placeholder="Enter role name here..."
							bind:value={roleName}
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
