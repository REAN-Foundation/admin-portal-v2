<script lang="ts">
	import SearchDropdown from '$lib/components/search-dropdown.svelte';

	///////////////////////////////////////////////////////////////////////////

	let {
		sessionUser,
		tenantParam = 'tenantId',
		onSelect
	}: {
		sessionUser: any;
		tenantParam?: 'tenantId' | 'tenantCode';
		onSelect?: (tenant: { tenantId: string; tenantCode: string } | null) => void;
	} = $props();

	let isSystemAdmin = $derived(
		sessionUser?.roleName === 'System admin' || sessionUser?.roleName === 'System user'
	);

	let selectedValue = $state('');
	let selectedDisplay = $state('');

	function handleTenantSelect(item: any) {
		if (item) {
			onSelect?.({ tenantId: item.id, tenantCode: item.Code });
		} else {
			onSelect?.(null);
		}
	}

	export function getTenantParam(): string {
		if (!isSystemAdmin || !selectedValue) return '';
		if (tenantParam === 'tenantCode') {
			return `tenantCode=${selectedValue}`;
		}
		return `tenantId=${selectedValue}`;
	}

	export function appendTenantParam(url: string): string {
		const param = getTenantParam();
		if (!param) return url;
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}${param}`;
	}
</script>

{#if isSystemAdmin}
	<div class="relative w-full md:flex-1">
		<SearchDropdown
			placeholder="Search by tenant"
			searchUrl="/api/server/tenants/search"
			searchField="name"
			displayField="Name"
			valueField={tenantParam === 'tenantCode' ? 'Code' : 'id'}
			dataPath="Data.TenantRecords.Items"
			bind:selectedValue
			bind:selectedDisplay
			onSelect={handleTenantSelect}
		/>
	</div>
{/if}
