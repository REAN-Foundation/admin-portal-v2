<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import SuperAdminDashboard from '$lib/components/dashboard/super.admin.dashboard.svelte';
	import SearchDropdown from '$lib/components/search-dropdown.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData }  = $props();

	let isSystemAdmin = $derived(data.sessionUser?.roleName === 'System admin' || data.sessionUser?.roleName === 'System user');

	let selectedTenantCode = $state('');
	let selectedTenantDisplay = $state('');

	function handleTenantSelect(item: any) {
		const code = item ? item.Code : '';
		const id = item ? item.id : '';
		selectedTenantCode = code;
		const currentPath = page.url.pathname;
		const params = new URLSearchParams();
		if (code) params.set('tenantCode', code);
		if (id) params.set('tenantId', id);
		const url = params.toString() ? `${currentPath}?${params}` : currentPath;
		goto(url, { invalidateAll: true });
	}
</script>

{#if isSystemAdmin}
	<div class="px-6 pt-4">
		<div class="w-full md:w-64">
			<SearchDropdown
				placeholder="Search by tenant"
				searchUrl="/api/server/tenants/search"
				searchField="name"
				displayField="Name"
				valueField="Code"
				bind:selectedValue={selectedTenantCode}
				bind:selectedDisplay={selectedTenantDisplay}
				onSelect={handleTenantSelect}
			/>
		</div>
	</div>
{/if}
<SuperAdminDashboard {data} />
