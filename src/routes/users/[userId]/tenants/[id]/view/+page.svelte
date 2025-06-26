<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

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
<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
<<<<<<< Updated upstream
		<Heading text="View Tenant" />
=======
		<h2 class="form-titles">View Tenant</h2>
>>>>>>> Stashed changes
		<a href={tenantRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
<<<<<<< Updated upstream
				<Label text="Name" />
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Code" />
				<td class="table-data">{code}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Contact Number" />
				<td class="table-data">{phone}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Email" />
=======
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
>>>>>>> Stashed changes
				<td class="table-data">{email}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
<<<<<<< Updated upstream
		<Button href={settingsRoute} text="Setting" variant="primary" size="md" />
=======
		<Button href={settingsRoute} size="md" text="Setting" variant="primary" />
>>>>>>> Stashed changes
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
<<<<<<< Updated upstream
			size="md"
=======
>>>>>>> Stashed changes
		/>
	</div>
</div>
