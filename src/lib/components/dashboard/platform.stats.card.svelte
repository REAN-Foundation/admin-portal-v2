<script lang="ts">
	import PlatformBasedChart from '$lib/components/users-stats/charts/platform-based-chart.svelte';

	let { deviceDetails } = $props();

	const totalUsers: any = [];
	const androidUsers: any = [];
	const iOSUsers: any = [];
	const years: any = [];

	for (let i = 0; i < deviceDetails.length; i++) {
		totalUsers.push(deviceDetails[i].UserCount);
		years.push(deviceDetails[i].Year);
		androidUsers.push(deviceDetails[i].DeviceDetails[0].Count);
		iOSUsers.push(deviceDetails[i].DeviceDetails[1].Count);
	}
</script>

<div class="status-card h-auto w-auto sm:w-full sm:p-6">
	<div class="w-full pb-8">
		<h4 class="sub-heading mb-5 justify-center text-center">Platform Based Users</h4>
		<div class="h-auto w-full">
			<PlatformBasedChart {totalUsers} {androidUsers} {iOSUsers} lables={years} />
		</div>
	</div>
</div>
