<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////

	export let data: PageServerData;
	let id = data.personRoleType.id;
	let roleName = data.personRoleType.RoleName;
	let description =
		data.personRoleType.Description !== null ? data.personRoleType.Description : 'Not specified';

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
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<div class=" btn-container">
			<Button
				size="md"
				href={editRoute}
				text="Edit"
				variant="primary"
				iconBefore="mdi:edit"
				iconSize="md"
			></Button>
		</div>
	</div>
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View User Role</th>
						<th class="text-end">
							<a href={personRoleTypesRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Role Name</td>
						<td>{roleName}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
