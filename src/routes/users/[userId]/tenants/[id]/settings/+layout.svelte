<script>
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	let { children } = $props();
	// import { page } from '$app/stores';
	const userId = page.params.userId;
	const tenantId = page.params.userId;
	// const tenantRoute = `/users/${userId}/tenants`;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;

	const breadCrumbs = [
		{
			name: 'Tenants',
			path: tenantRoute
		},
		{
			name: 'Settings',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="flex w-full flex-col">
	<!-- Navigation Buttons -->
	<div class="flex gap-4 p-4">
		{#each [{ label: 'Basic', path: `${tenantRoute}/${tenantId}/settings/common-setting` }, { label: 'Chat Bot', path: `${tenantRoute}/${tenantId}/settings/chatbot-setting` }, { label: 'Forms', path: `${tenantRoute}/${tenantId}/settings/chatbot-setting` }, { label: 'Followup', path: `${tenantRoute}/${tenantId}/settings/followup-setting` }] as nav}
			<a
				href={nav.path}
				class={`rounded border px-4 py-2 ${
					page.url.pathname === nav.path
						? 'table-btn text-white  '
						: 'bg-white text-black hover:bg-gray-200'
				}`}
			>
				{nav.label}
			</a>
		{/each}
	</div>

	<!-- Page Content (Dynamic) -->
	{@render children()}
</div>
