<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getChartColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

    const tickColorLight = getTickColorLight();
    const tickColorDark = getTickColorDark();
    const color = getChartColors();

    let {lables,data,title} = $props();


    let barChart:any;
    let ctx;

    onMount(() => {
        ctx = barChart.getContext('2d');
        barChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: lables,
                datasets: [
                    {
                        label: 'Active Users',
                        data: data,
                        borderColor: color[0],
                        fill: true,
                        pointRadius: 0, // Remove intersection points
                        pointHoverRadius: 0 // Remove hover effect on points
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
                        },
                        title: {
                            display: true,
                            text: 'Till Month',
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
                        }
                    },
                    y: {
                        grid: {
                            display: true
                        },
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
                        },
                        title: {
                            display: true,
                            text: 'User Count',
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
                        }
                    }
                },
                layout: {
                    padding: {
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
                            boxWidth: 10,
                            boxHeight: 10
                        }
                    },
                    title: {
                        display: false,
                        text: title,
                        color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
                        font: {
                            size: 22,
                            weight: 'normal',
                            lineHeight: 1.2
                        }
                    }
                }
            }
        });
    });

</script>

<div class="h-80 w-full p-2">
    {#if data && data.length > 0}
        <canvas bind:this={barChart} ></canvas>
    {:else}
        <p>No data available.</p>
    {/if}
</div>
