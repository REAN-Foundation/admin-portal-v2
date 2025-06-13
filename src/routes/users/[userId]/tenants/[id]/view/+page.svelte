<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	//////////////////////////////////////////////////////////////////////////
	let { data }: { data: PageServerData } = $props();


	const userId = page.params.userId;
	const tenantId = page.params.id;
	const editRoute = `/users/${userId}/tenants/${tenantId}/edit`;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	console.log("settingsRoute", page.params);
	


	let tenant = $state(data.tenant);
	let name = tenant.Name;
	let description = tenant.Description !== null ? tenant.Description : 'Not specified';
	let code = tenant.Code;
	let phone = tenant.Phone;
	let email = tenant.Email;

	const breadCrumbs = [
		{
			name: 'Tenants',
			path: tenantRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex justify-end gap-4">
		<div class="flex flex-wrap justify-end gap-2 py-2">
			<a href={settingsRoute} class="table-btn gap-1 variant-filled-secondary">
				<Icon icon="mdi:cog-outline" />
				<span>Settings</span>
			</a>
		</div>
		<div class="flex flex-wrap justify-end gap-2 py-2">
			<a href={editRoute} class="table-btn gap-1 variant-filled-secondary">
				<Icon icon="material-symbols:edit-outline" />
				<span>Edit</span>
			</a>
		</div>
	</div>

	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View Tenant</th>
						<th class="text-end">
							<a href={tenantRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" class="" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name</td>
						<td>{name}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
					<tr>
						<td>Code</td>
						<td>{code}</td>
					</tr>
					<tr>
						<td>Contact Number</td>
						<td>{phone}</td>
					</tr>
					<tr>
						<td>Email</td>
						<td>{email}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
