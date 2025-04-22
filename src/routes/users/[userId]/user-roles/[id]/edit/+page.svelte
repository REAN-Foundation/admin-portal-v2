<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';

	export let form;
	export let data: PageServerData;
	let id = data.personRoleType.id;
	let roleName = data.personRoleType.RoleName;
	let description = data.personRoleType.Description;

	//Original data
	let _roleName = roleName;
	let _description = description;

	function handleReset() {
		roleName = _roleName;
		description = _description;
	}

	const userId = $page.params.userId;
	const editRoute = `/users/${userId}/user-roles/${id}/edit`;
	const viewRoute = `/users/${userId}/user-roles/${id}/view`;
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

	function handleSubmit() {
		isSubmitting = true;
	}

	$: isSubmitting = false;

	$: if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/updatePersonRoleTypeAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit User Role</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Role Name <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="roleName"
									required
									bind:value={roleName}
									placeholder="Enter role name here..."
									class="health-system-input {form?.errors?.roleName ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.roleName}
									<p class="text-error-500 text-xs">{form?.errors?.roleName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									bind:value={description}
									placeholder="Enter description here..."
									class="health-system-input {form?.errors?.description ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.description}
									<p class="text-error">{form?.errors?.description[0]}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
					<button
						type="submit"
						class="health-system-btn variant-soft-secondary"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
