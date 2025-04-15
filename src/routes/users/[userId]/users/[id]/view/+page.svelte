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

<!-- <div class="flex w-full flex-wrap justify-end gap-2">
	<a href={editRoute} class="btn variant-filled-secondary">
		<Icon icon="material-symbols:edit-outline" />
		<span>Edit</span>
	</a>
</div> -->

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View User</th>
						<th class="text-end">
							<a href={userRoute} class="health-system-btn variant-soft-secondary">
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
					<!-- <tr class="!border-b !border-b-secondary-100 dark:!border-b-surface-700">
				<td class="align-top">Image</td>
				<td>
					{#if imageUrl == 'undefined' || imageUrl == null}
						Not specified
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
					{/if}
				</td>
			</tr> -->
				</tbody>
			</table>
		</div>
	</div>
</div>
