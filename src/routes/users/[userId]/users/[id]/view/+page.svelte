<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	//////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let firstName = data.user.Person.FirstName || 'Not specified';
	let lastName = data.user.Person.LastName || 'Not specified';
	let phone = data.user.Person.Phone;
	let email = data.user.Person.Email || 'Not specified';
	let role = data.user.Role.RoleName || 'Not specified';
	// let imageUrl = data.user.ImageUrl;
	const userId = page.params.userId;
	const id = page.params.id;
	const editRoute = `/users/${userId}/users/${id}/edit`;
	const viewRoute = `/users/${userId}/users/${id}/view`;
	const userRoute = `/users/${userId}/users`;

	const breadCrumbs = [
		{
			name: 'Users',
			path: userRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />



<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end py-2 gap-2">
		<a href={editRoute} class="table-btn variant-filled-secondary">
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View User</th>
						<th class="text-end">
							<a href={userRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>First Name</td>
						<td>{firstName}</td>
					</tr>
					<tr>
						<td>Last Name</td>
						<td>{lastName}</td>
					</tr>
					<tr>
						<td>Contact Number</td>
						<td>{phone}</td>
					</tr>
					<tr>
						<td>Email</td>
						<td>{email}</td>
					</tr>
					<tr>
						<td>Role</td>
						<td>{role}</td>
					</tr>
				
				</tbody>
			</table>
		</div>
	</div>
</div>
