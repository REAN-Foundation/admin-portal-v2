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

	console.log('settingsRoute', page.params);

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
	<div class="button-container mt-4 flex gap-4">
		<a
			href={settingsRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
		>
			<span>Setting</span>
		</a>
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Tenant</th>
						<th class="text-end">
							<a href={tenantRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
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
