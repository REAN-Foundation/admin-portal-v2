<script lang="ts">
    import FunnelCard from '$lib/components/dashboard/funnel.card.svelte';
    import NumberCard from '$lib/components/dashboard/number.card.svelte';
    
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    export let data;

    let yearsArray = [];
    let androidUsers = [];
    let iOSUsers = [];
    let funnelChartData;
    
    function extractYearWiseUserCount(data) {
        data.forEach((value)=>{
            yearsArray.push(value.Year);
            totalUsers.push(value.UserCount);
        })
    }

    function extractYearWiseDeviceDetails(data) {
        data.forEach(value=>{
            if (value.DeviceDetails.length===0){
                androidUsers.push(0);
                iOSUsers.push(0);
            }else{
                let andriodCount=undefined;
                let iOSCount=undefined;
                value.DeviceDetails.forEach(devicedetails=>{
                    if(devicedetails.OSType==='Android'){
                        andriodCount = devicedetails.count;
                        // androidUsersData.push(devicedetails.count);
                    }
                    if(devicedetails.OSType==='iOS'){
                        iOSCount = devicedetails.count;
                        // iOSUsersData.push(devicedetails.count);
                    }
                })
                if (!andriodCount){
                    androidUsers.push(0);
                }else{
                    androidUsers.push(andriodCount);
                }
                if (!iOSCount){
                    iOSUsers.push(0);
                }else{
                    iOSUsers.push(iOSCount);
                }
            }

        })
    }

    let userCountStats       = data.userCountStats;
    let userCountByYears     = data.userCountByYears
    let deviceDetailsByYears = data.deviceDetailsByYears;

    let totalUsers      = userCountStats.TotalUsers;
    let activeUsers     = userCountStats.UsersWithActiveSession;
    let deletedUsers    = userCountStats.DeletedUsers;
    let nonDeletedUsers = userCountStats.NotDeletedUsers;

    extractYearWiseUserCount(userCountByYears);
    extractYearWiseDeviceDetails(deviceDetailsByYears);

    let enrolledUsersData = userCountStats.EnrolledUsers;

    let labels = [
        'Onboarded',
        'Not-Deleted ',
        'Enrolled Users',
        'Users With Active Session',
    ];

    $: funnelChartData = [
        totalUsers.Count,
        nonDeletedUsers.Count,
        enrolledUsersData.Count,
        activeUsers.Count,
    ];

    $: deviceDetails = {
        TotalUsers: totalUsers,
        AndroidUsers: androidUsers.reduce((a, b) => a + b, 0),
        iOSUsers: iOSUsers.reduce((a, b) => a + b, 0),
        Years: yearsArray
    }

</script>

<dl class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
    <!-- <NumberCard cardTitle="App Downloads" cardContent={appDownloads.toFixed()} /> -->
    <NumberCard cardTitle="Onboarded Users" cardContent={totalUsers.Count.toFixed()} />
    <NumberCard cardTitle="Not Deleted Users" cardContent={nonDeletedUsers.Count.toFixed()} additional={nonDeletedUsers.Ratio} prefix="%" />
    <NumberCard cardTitle="Current Active Users" cardContent={activeUsers.Count.toFixed()} additional={activeUsers.Ratio} prefix="%" />
    <NumberCard cardTitle="Deleted Users" cardContent={deletedUsers.Count.toFixed()} additional={deletedUsers.Ratio} prefix="%" />
    <!-- <NumberCard cardTitle="Enrolled Users" cardContent={enrolledUsersData.Count.toFixed()} additional={enrolledUsersData.Ratio} prefix="%" /> -->
    <!-- {#each deviceDetailsStats as d }
        <NumberCard cardTitle={d.OSType} cardContent={d.count.toFixed()} />
    {/each} -->
</dl>

<div class="flex h-80 gap-10 w-full mt-5">
    <FunnelCard {labels} dataSource={funnelChartData} />
    <!-- <PlatformStatsCard {deviceDetails} /> -->
</div>
