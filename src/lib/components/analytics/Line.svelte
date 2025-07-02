<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getChartColors, getTickColorLight, getTickColorDark } from '$lib/themes/theme.selector';

    const color = getChartColors();

    let { lables, data, title } = $props();

    let canvas = $state<HTMLCanvasElement>();
    let lineChart: Chart | null = null;
    let observer: MutationObserver | null = null;
    let isCanvasReady = $state(false);

    $inspect("Line Chart Props:", { lables, data, title });

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    function getThemeColor(): { textColor: string; gridColor: string; fillColor: string } {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            textColor: isDarkMode ? '#d9dee9' : '#1c252a',
            gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            fillColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        };
    }

    function initChart() {
        if (!canvas || !isCanvasReady) return;
        
        if (lineChart) {
            lineChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const chartData = data.map(d => typeof d === 'number' ? d : Number(d) || 0);
        const chartLabels = lables.map(l => String(l));

        if (chartData.length === 0 || chartLabels.length === 0) {
            console.log('No valid data for line chart');
            return;
        }

        console.log('Initializing line chart with:', { chartLabels, chartData });
        console.log('Chart constructor available:', typeof Chart);

        try {
            const { textColor, gridColor, fillColor } = getThemeColor();
            lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Active Users',
                            data: chartData,
                            backgroundColor: fillColor,
                            borderColor: '#000000',
                            fill: true,
                            pointRadius: 0, // Remove intersection points
                            pointHoverRadius: 0 
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
                                color: gridColor
                            },
                            ticks: {
                                color: textColor
                            },
                            title: {
                                display: true,
                                text: 'Till Month',
                                color: textColor
                            },
                            border: {
							display: true,
							color: isDarkMode ? '#d9dee9' : '#1c252a'
						},
                        },
                        y: {
                            grid: {
                                display: true,
                                color: gridColor
                            },
                            ticks: {
                                color: textColor
                            },
                            title: {
                                display: true,
                                text: 'User Count',
                                color: textColor
                            },
                            border: {
							display: true,
							color: isDarkMode ? '#d9dee9' : '#1c252a'
						},
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
                                color: textColor,
                                boxWidth: 10,
                                boxHeight: 10
                            }
                        },
                        title: {
                            display: false,
                            text: title,
                            color: textColor,
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

    function updateChartOnThemeChange() {
        if (lineChart) {
            const { textColor, gridColor, fillColor } = getThemeColor();
            lineChart.data.datasets[0].backgroundColor = fillColor;
            lineChart.options.scales.x.ticks.color = textColor;
            lineChart.options.scales.x.grid.color = gridColor;
            lineChart.options.scales.x.title.color = textColor;
            lineChart.options.scales.y.ticks.color = textColor;
            lineChart.options.scales.y.grid.color = gridColor;
            lineChart.options.scales.y.title.color = textColor;
            lineChart.options.plugins.legend.labels.color = textColor;
            lineChart.options.plugins.title.color = textColor;
            lineChart.update();
        }
    }

    $effect(() => {
        if (data && data.length > 0 && lables && lables.length > 0 && isCanvasReady) {
            initChart();
        }
    });

    onMount(() => {
        observer = new MutationObserver(updateChartOnThemeChange);
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
