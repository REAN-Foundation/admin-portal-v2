<script lang="ts">
	import FunnelCard from '$lib/components/dashboard/funnel.card.svelte';
	import NumberCard from '$lib/components/dashboard/number.card.svelte';
	import PlatformStatsCard from '$lib/components/dashboard/platform.stats.card.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	let labels = ['Onboarded', 'Not Deleted ', 'Current Active'];

	const stats = $derived(data.userCountStats);

	const funnelChartData = $derived([
		stats?.TotalUsers?.Count ?? 0,
		stats?.NotDeletedUsers?.Count ?? 0,
		stats?.UsersWithActiveSession?.Count ?? 0
	]);

	$inspect(funnelChartData);

	const deviceDetails = $derived(data.deviceDetailsByYears ?? []);
</script>

<dl class=" dashboard-cards">
	<NumberCard
		cardTitle="Onboarded Users"
		cardContent={(stats?.TotalUsers?.Count ?? 0).toFixed()}
	/>
	<NumberCard
		cardTitle="Not Deleted Users"
		cardContent={(stats?.NotDeletedUsers?.Count ?? 0).toFixed()}
		additional={stats?.NotDeletedUsers?.Ratio ?? 0}
		prefix="%"
	/>
	<NumberCard
		cardTitle="Current Active Users"
		cardContent={(stats?.UsersWithActiveSession?.Count ?? 0).toFixed()}
		additional={stats?.UsersWithActiveSession?.Ratio ?? 0}
		prefix="%"
	/>
	<NumberCard
		cardTitle="Deleted Users"
		cardContent={(stats?.DeletedUsers?.Count ?? 0).toFixed()}
		additional={stats?.DeletedUsers?.Ratio ?? 0}
		prefix="%"
	/>
	<NumberCard
		cardTitle="Enrolled Users"
		cardContent={(stats?.EnrolledUsers?.Count ?? 0).toFixed()}
		additional={stats?.EnrolledUsers?.Ratio ?? 0}
		prefix="%"
	/>
	<!-- {#each data.DeviceDetailWiseUsers as d }
        <NumberCard cardTitle={d.OSType} cardContent={d.count.toFixed()} />
    {/each} -->
</dl>

<div class=" dashboard-subcards px-4 pt-2">
	<!-- <FunnelCard {labels} dataSource={funnelChartData} /> -->
	<PlatformStatsCard {deviceDetails} />
</div>
