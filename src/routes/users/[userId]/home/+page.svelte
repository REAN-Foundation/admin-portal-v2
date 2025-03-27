<script lang="ts">
	import type { PageServerData } from './$types';
	import SuperAdminDashboard from '$lib/components/dashboard/super.admin.dashboard.svelte';
	import DashboardTabs from '$lib/components/navbar/dashboard.tabs.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData }  = $props();
</script>

<SuperAdminDashboard {data} />
