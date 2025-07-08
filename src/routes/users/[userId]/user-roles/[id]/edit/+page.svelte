<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { PersonRoleUpdateModel } from '$lib/types/person.role.types';
	import { createOrUpdateSchema } from '$lib/validation/person.role.schemas';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let roleName = $state(data.personRoleType.RoleName);
	let description = $state(data.personRoleType.Description ?? undefined);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	function handleReset() {
		roleName = data?.personRoleType?.RoleName;
		description = data?.personRoleType?.Description;
		errors = {};
	}

	const userId = page.params.userId;
	let personRoleId = page.params.id;
	const editRoute = `/users/${userId}/user-roles/${personRoleId}/edit`;
	const viewRoute = `/users/${userId}/user-roles/${personRoleId}/view`;
	const personRoleTypesRoute = `/users/${userId}/user-roles`;

	const breadCrumbs = [
		{
			name: 'User Roles',
			path: personRoleTypesRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const personRoleUpdateRoute: PersonRoleUpdateModel = {
				Name: roleName,
				Description: description
			};

			const validationResult = createOrUpdateSchema.safeParse(personRoleUpdateRoute);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/person-role-types/${personRoleId}`, {
				method: 'PUT',
				body: JSON.stringify(personRoleUpdateRoute),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit User Role</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Role Name <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="roleName"
							bind:value={roleName}
							placeholder="Enter role name here..."
							class="input {errors?.roleName ? 'input-text-error' : ''}"
						/>
						{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							bind:value={description}
							placeholder="Enter description here..."
							class="input {errors?.description ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
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
