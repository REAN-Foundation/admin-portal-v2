<script lang="ts">
	import FunnelCard from '$lib/components/dashboard/funnel.card.svelte';
	import NumberCard from '$lib/components/dashboard/number.card.svelte';
	import PlatformStatsCard from '$lib/components/dashboard/platform.stats.card.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	let labels = ['Onboarded', 'Not Deleted ', 'Current Active'];

	const funnelChartData = $derived([
		data.userCountStats.TotalUsers.Count,
		data.userCountStats.NotDeletedUsers.Count,
		data.userCountStats.UsersWithActiveSession.Count
	]);

	$inspect(funnelChartData);

	const deviceDetails = $derived(data.deviceDetailsByYears);
</script>

<dl class="dashboard-cards">
	<NumberCard
		cardTitle="Onboarded Users"
		cardContent={data.userCountStats.TotalUsers.Count.toFixed()}
		additional=""
		prefix=""
	/>
	<NumberCard
		cardTitle="Not Deleted Users"
		cardContent={data.userCountStats.NotDeletedUsers.Count.toFixed()}
		additional={data.userCountStats.NotDeletedUsers.Ratio}
		prefix="%"
	/>
	<NumberCard
		cardTitle="Current Active Users"
		cardContent={data.userCountStats.UsersWithActiveSession.Count.toFixed()}
		additional={data.userCountStats.UsersWithActiveSession.Ratio}
		prefix="%"
	/>
	<NumberCard
		cardTitle="Deleted Users"
		cardContent={data.userCountStats.DeletedUsers.Count.toFixed()}
		additional={data.userCountStats.DeletedUsers.Ratio}
		prefix="%"
	/>
	<NumberCard
		cardTitle="Enrolled Users"
		cardContent={data.userCountStats.EnrolledUsers.Count.toFixed()}
		additional={data.userCountStats.EnrolledUsers.Ratio}
		prefix="%"
	/>
	<!-- {#each data.DeviceDetailWiseUsers as d }
        <NumberCard cardTitle={d.OSType} cardContent={d.count.toFixed()} />
    {/each} -->
</dl>

<div class="dashboard-subcards">
	<!-- <FunnelCard {labels} dataSource={funnelChartData} /> -->
	<PlatformStatsCard {deviceDetails} />
</div>
