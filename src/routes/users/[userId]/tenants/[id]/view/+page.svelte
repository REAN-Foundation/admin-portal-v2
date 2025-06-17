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

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Tenant</h2>
		<a href={tenantRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Code</td>
				<td class="table-data">{code}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Contact Number</td>
				<td class="table-data">{phone}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Email</td>
				<td class="table-data">{email}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<a
		href={settingsRoute}
		class="edit-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
	>
		<span>Setting</span>
	</a>
		<a
			href={editRoute}
			class="edit-btn variant-filled-secondary hover:!variant-soft-secondary text-[var(--color-info)]"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
</div>
