<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

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

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View User</h2>
		<a href={userRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">First Name</td>
				<td class="table-data">{firstName}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Last Name</td>
				<td class="table-data">{lastName}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Contact Number</td>
				<td class="table-data">{phone}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Email</td>
				<td class="table-data">{email}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Role</td>
				<td class="table-data">{role}</td>
			</tr>
		</tbody>
	</table>
	<div class="btn-container">
		<Button
			size="md"
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		/>
	</div>
</div>
