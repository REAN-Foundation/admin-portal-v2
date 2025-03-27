<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getDoughnutColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';
    /////////////////////////////////////////////////////////////////////////////
    const tickColorLight = getTickColorLight();
    const tickColorDark = getTickColorDark();
    let {labels,dataSource,title} =$props();
    // export let rate;
    console.log('this is title=============', title);

    let barChart:any;
    let ctx;

    let xLabel: string;
    let yLabel: string;
    let MAX_INDEX;
    function selectAxisLabel(title: any) {
        switch (title) {
            case 'Engagement Rate (%)':
                (xLabel = 'Month'), (yLabel = 'Percentage of Users (%)');
                break;
            case 'Retention User Count On Specific Days':
                (xLabel = 'Days of the Month'), (yLabel = 'User Count');
                // MAX_INDEX = 10;
                break;
            case 'Retention User Count On Specific Days (%)':
                (xLabel = 'Days of the Month'), (yLabel = 'Percentage');
                // MAX_INDEX = 10;
                break;
            case 'Retention User Count On Specific Intervals':
                (xLabel = 'Retention Interval'), (yLabel = 'User Count');
                break;
            case 'Retention User Count On Specific Intervals (%)':
                (xLabel = 'Retention Interval'), (yLabel = 'Percentage');
                // MAX_INDEX = 100;
                break;
            case 'Retention On Specific Days':
                (xLabel = 'Retention Interval'), (yLabel = 'User Count');
                // MAX_INDEX = 10;
                break;
            case 'Retention On Specific Days (%)':
                (xLabel = 'Retention Interval'), (yLabel = 'User Count');
                // MAX_INDEX = 10;
                break;
            case 'Retention On Specific Interval':
                (xLabel = 'Retention Interval'), (yLabel = 'User Count');
                break;
            case 'Retention On Specific Interval (%)':
                (xLabel = 'Retention Interval'), (yLabel = 'User Count');
                // MAX_INDEX = 100;

                break;
        }
    }
    onMount(() => {
        selectAxisLabel(title);
        ctx = barChart.getContext('2d');
        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: dataSource,
                        backgroundColor: '#D3D3D3',
                        borderColor: '#808080',
                        borderWidth: 1,
                        borderRadius: {
                            topLeft: 4,
                            topRight: 4
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
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
                            text: xLabel,
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
                        }
                    },
                    y: {
                        max: MAX_INDEX,
                        beginAtZero: true,
                        grid: {
                            display: true
                        },
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
                        },
                        title: {
                            display: true,
                            text: yLabel,
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
                        position: 'top',
                        align: 'center',
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight
                        }
                    },
                    title: {
                        display: false,
                        text: title,
                        position: 'top',
                        color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
                        align: 'start',
                        padding: 20,
                        font: {
                            size: 22,
                            weight: 'normal',
                            lineHeight: 1.2
                        }
                    },
                    tooltip: {
                        callbacks: {
                            // label: function (context) {
                            //     let label = context.dataset.label || '';
                            //     let customNames = labels;
                            //     let extraInfo = rate;
                            //     let tooltipLines = [];
                            //     if (context.parsed.y !== null) {
                            //         let customLabel = customNames[context.dataIndex] || 'Default Name';
                            //         tooltipLines.push(customLabel);
                            //         let extra = extraInfo[context.dataIndex] || 'No Extra Info';
                            //         tooltipLines.push(extra);
                            //     }
                            //     return tooltipLines;
                            // }
                        }
                    }
                }
            }
        });
    });
</script>

<canvas
    class="h-96"
    bind:this={barChart}
></canvas>
