<canvas id="myChart" width="910" height="300" bind:this={lineChart}></canvas>
<script>
import {onMount} from 'svelte';
import Chart from 'chart.js/auto';
import {
		getTickColorLight,
		getTickColorDark
  	} from '$lib/themes/theme.selector';

  /////////////////////////////////////////////////////////////////////////////

  const tickColorLight = getTickColorLight();
  const tickColorDark = getTickColorDark();

	export let total;

let dates_arr = total.map((element) => {
  var d = new Date(element.Day);
   let value =d.getMonth()+1;

  return `${d.getDate()}/${filterMonth(value)}/${d.getFullYear() % 100}`;

  function filterMonth(value) {
    switch (value) {
    case 1:
        value = 'Jan';
        break;
    case 2:
        value = 'Feb';
        break;
    case 3:
        value = 'Mar';
        break;
    case 4:
        value = 'Apr';
        break;
    case 5:
        value = 'May';
        break;
    case 6:
        value = 'June';
        break;
    case 7:
        value = 'Jul';
        break;
    case 8:
        value = 'Agu';
        break;
    case 9:
        value = 'Sep';
        break;
    case 10:
        value = 'Oct';
        break;
    case 11:
        value = 'Nov';
        break;
    case 12:
        value = 'Apr';
        break;
    }
    return value;
};
});


let data_val = total.map((element)=>{
    let userEngagement = element.UserEngagementDaily;
   let val = userEngagement == null ? 0 : userEngagement;
    return val;
})

let ctx;
let lineChart
onMount(() => {
		ctx = lineChart.getContext('2d');
		lineChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: dates_arr,
				datasets: [
					{
						// label: 'Total users',
                        borderWidth: 2,
						data: data_val,
						borderColor: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
						fill: false

					},
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
							color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight // set x-axis label color here
						}
					},
					y: {
						grid: {
							display: false
						},
						ticks: {
							color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight // set y-axis label color here
						}
					}
				},
				layout: {
					padding: {
						bottom: 20 // Adjust the bottom padding value as needed
					}
				},
				plugins: {
					legend: {
						display: false,
						position: 'top',
						align: 'center',
						labels: {
							color: document.documentElement.classList.contains('dark') ? tickColorDark : tickColorLight,
							boxWidth: 10,
							boxHeight: 10
						}
					}
				}
			}
		});
	});

</script>
