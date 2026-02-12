<script lang="ts">
	import PlatformBasedChart from '$lib/components/users-stats/charts/platform-based-chart.svelte';

	let { deviceDetails } = $props();

	const totalUsers: any = [];
	const androidUsers: any = [];
	const iOSUsers: any = [];
	const years: any = [];

	const details = Array.isArray(deviceDetails) ? deviceDetails : [];
	for (let i = 0; i < details.length; i++) {
		totalUsers.push(details[i]?.UserCount ?? 0);
		years.push(details[i]?.Year ?? '');
		androidUsers.push(details[i]?.DeviceDetails?.[0]?.Count ?? 0);
		iOSUsers.push(details[i]?.DeviceDetails?.[1]?.Count ?? 0);
	}
</script>

<div class="status-card h-auto w-auto sm:w-full sm:p-6">
	<div class="w-full pb-8">
		<h4 class="sub-heading mb-5 justify-center text-center">Platform Based Users</h4>
		{#if details.length > 0}
			<div class="h-auto w-full">
				<PlatformBasedChart {totalUsers} {androidUsers} {iOSUsers} lables={years} />
			</div>
		{:else}
			<div class="flex items-center justify-center py-10">
				<p class="text-gray-500">Data not available</p>
			</div>
		{/if}
	</div>
</div>
