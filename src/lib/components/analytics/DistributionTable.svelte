<script lang="ts">
    import { onMount } from 'svelte';
    import Doughnut from './Doughnut.svelte';
    let { title, tableHeaders, tableData, labelKey, countKey } = $props();
    // export let chartLabels: string[] = [];
    // export let chartData: number[] = [];
    // Dynamically set keys for labels and counts, passed in by the parent component
    //    let {labelKey,countKey} = $props(); // e.g., 'age_group', 'gender', 'hospital', etc.
    const MAX_ENTRIES = 6;
    // Function to handle truncating long labels
    function truncateLabel(label: string, maxLength: number): string {
        if (!label) return 'Unknown';
        return label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
    }
    // Process the data: map table data to format {label, count, percentage}, limit to MAX_ENTRIES
    let processedData: any = $state();
    processedData = (() => {
        const totalCount = tableData.reduce(
            (sum: any, item: { [x: string]: any }) => sum + (item[countKey] || 0),
            0
        );
        let processed = tableData
            .map((item: { [x: string]: any }) => ({
                label: item[labelKey] || 'Unknown',
                count: item[countKey] || 0,
                percentage:
                    totalCount > 0 ? (((item[countKey] || 0) / totalCount) * 100).toFixed(2) : '0.00'
            }))
            .sort((a: { count: number }, b: { count: number }) => b.count - a.count);
        if (processed.length > MAX_ENTRIES) {
            const topItems = processed.slice(0, MAX_ENTRIES - 1);
            const otherItems = processed.slice(MAX_ENTRIES - 1);
            const otherCount = otherItems.reduce((sum: any, item: { count: any }) => sum + item.count, 0);
            const otherPercentage =
                totalCount > 0 ? ((otherCount / totalCount) * 100).toFixed(2) : '0.00';
            processed = [...topItems, { label: 'Other', count: otherCount, percentage: otherPercentage }];
        }
        return processed;
    })();
    // Updated data for chart rendering
    let updatedChartLabels = $derived(
        processedData.map((item: { label: string }) => truncateLabel(item.label, 20))
    );
    let updatedChartData = $derived(processedData.map((item: { count: any }) => item.count));
    let hasData = $derived(processedData && processedData.length > 0);
    $inspect('processedData', processedData);
    $inspect('updatedChart', updatedChartData);
</script>
{#if hasData}
    <div class="stats-container distribution-card-container">
        <div class="col-span-2 px-4 sm:px-6 lg:px-8">
            <div class=" distribution-card-content">
                <table class="min-w-full">
                    <thead>
                        <tr class="w-full">
                            {#each tableHeaders as header}
                                <th class=" card-header">
                                    {header}
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each processedData as data}
                            <tr class="transition">
                                <td class=" chart-details">{data.label}</td>
                                <td class="chart-details">{data.count}</td>
                                <td class="chart-details">{data.percentage}%</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
        <div class=" chart-view">
            <Doughnut {updatedChartData} {updatedChartLabels} {title} />
        </div>
    </div>
{:else}
    <div class="stats-container data-not-available-container">
        <p class=" data-not-available">Data Not Available</p>
    </div>
{/if}
