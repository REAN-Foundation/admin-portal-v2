<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getChartColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';
	import { TextColorDark } from '$lib/themes/rean.theme';

    const tickColorLight = getTickColorLight();
    const tickColorDark = getTickColorDark();
    const color = getChartColors();

    let { lables, data, title } = $props();

    let canvas: HTMLCanvasElement;
    let lineChart: Chart | null = null;
    let observer: MutationObserver | null = null;
    let isCanvasReady = $state(false);

    $inspect("Line Chart Props:", { lables, data, title });

    function getThemeColor(): string {
        return document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
    }

    function getTickColor(): string {
	return document.documentElement.getAttribute('data-theme') === 'dark'
		? TextColorDark
		: '#00000';
}

    function initChart() {
        if (!canvas || !isCanvasReady) return;
        
        if (lineChart) {
            lineChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure data is properly formatted
        const chartData = data.map(d => typeof d === 'number' ? d : Number(d) || 0);
        const chartLabels = lables.map(l => String(l));

        // Validate data
        if (chartData.length === 0 || chartLabels.length === 0) {
            console.log('No valid data for line chart');
            return;
        }

        console.log('Initializing line chart with:', { chartLabels, chartData });
        console.log('Chart constructor available:', typeof Chart);

        try {
            lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Active Users',
                            data: chartData,
                            borderColor: color[2],
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
                                display: false,
                                color: getTickColor() // Set grid line color based on theme
                            },
                            ticks: {
                                color: getTickColor() // Set tick color based on theme
                            },
                            title: {
                                display: true,
                                text: 'Till Month',
                                color: getTickColor() // Set axis title color based on theme
                            },
                            border: {
                                color: getTickColor() // Set axis line color based on theme
                            }
                        },
                        y: {
                            grid: {
                                display: true,
                             
                            },
                            ticks: {
                                color: getTickColor()
                            },
                            title: {
                                display: true,
                                text: 'User Count',
                                color: getTickColor()
                            },
                            border: {
                                color: getTickColor() // Set axis line color based on theme
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
                                color: getTickColor(),
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        },
                        title: {
                            display: false,
                            text: title,
                            color: getTickColor(),
                            font: {
                                size: 22,
                                weight: 'normal',
                                lineHeight: 1.2
                            }
                        }
                    }
                }
            });
            console.log('Line chart created successfully');
        } catch (error) {
            console.error('Error creating line chart:', error);
        }
    }

    // function updateChartOnThemeChange() {
    //     if (lineChart) {
    //         // Update colors for theme change
    //         lineChart.options.scales.x.ticks.color = getThemeColor();
    //         lineChart.options.scales.x.title.color = getThemeColor();
    //         lineChart.options.scales.y.ticks.color = getTickColor();
    //         lineChart.options.scales.y.title.color = getThemeColor();
    //         lineChart.options.plugins.legend.labels.color = getThemeColor();
    //         lineChart.options.plugins.title.color = getThemeColor();
    //         lineChart.update();
    //     }
    // }

    $effect(() => {
        if (data && data.length > 0 && lables && lables.length > 0 && isCanvasReady) {
            console.log('Effect triggered - updating line chart');
            initChart();
        }
    });

    onMount(() => {
        observer = new MutationObserver(()=>{
            initChart();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        setTimeout(() => {
            isCanvasReady = true;
            if (data && data.length > 0 && lables && lables.length > 0) {
                initChart();
            }
        }, 100);
    });

    onDestroy(() => {
        if (lineChart) {
            lineChart.destroy();
        }
        if (observer) {
            observer.disconnect();
        }
    });
</script>

<div class="h-96 w-full p-2 border shadow-lg border-[var(--color-outline)]">
    {#if data && data.length > 0}
        <canvas bind:this={canvas} class="w-full mx-auto h-auto"></canvas>
    {:else}
        <p>No data available.</p>
    {/if}
</div>
