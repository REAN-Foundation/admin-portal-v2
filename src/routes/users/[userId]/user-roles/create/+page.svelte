<script lang="ts">
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import toast from 'svelte-french-toast';

	///////////////////////////////////////////////////////////////////

	// export let form;
	// export let data;
	let { data, form } = $props();

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

	function handleSubmit() {
		isSubmitting = true;
	}

	let isSubmitting = $state(false);

	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/createPersonRoleTypeAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create User Role</th>
							<th class="text-end">
								<a href={personRoleTypesRoute} class="health-system-btn variant-soft-secondary">
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
									required
									placeholder="Enter role name here..."
									class="health-system-input {form?.errors?.roleName ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.roleName}
									<p class="text-error">{form?.errors?.roleName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
							<td>
								<textarea
									name="description"
									placeholder="Enter description here..."
									class="health-system-input"
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
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
