<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	//////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	const tenantId = page.params.tenantId;
	const editRoute = `/users/${userId}/tenants/${tenantId}/edit`;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	let { data }: { data: PageServerData } = $props();

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
<!-- 
<div class="flex w-full flex-wrap justify-end gap-2">
	<a href={settingsRoute} class="btn variant-filled-secondary">
		<span>Setting</span>
	</a>
	<a href={editRoute} class="btn variant-filled-secondary">
		<Icon icon="material-symbols:edit-outline" />
		<span>Edit</span>
	</a>
</div> -->

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th>View Tenant</th>
						<th class="text-end">
							<a href={tenantRoute} class="table-btn variant-soft-secondary">
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
