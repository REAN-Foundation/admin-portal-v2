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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Create User Role</th>
							<th class="text-end">
								<a href={personRoleTypesRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Role Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="roleName"
									bind:value={roleName}
									placeholder="Enter role name here..."
									class="input"
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
									bind:value={description}
									placeholder="Enter description here..."
									class="input"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
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
