<script lang="ts">
  import { Pie } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
  } from 'chart.js';
  import {
    getChartColors,
    getHoverChartColors,

  } from '$lib/themes/theme.selector';

  /////////////////////////////////////////////////////////////////////////////

  const chartColors = getChartColors();
  const hoverChartColors = getHoverChartColors();


  export let ageWiseUsers;

  $:ageWiseUsers;

  let usersBelowThirtyfiveRatio = ageWiseUsers.UsersBelowThirtyfive.Ratio;
  let usersBetweenThirtysixToSeventyRatio = ageWiseUsers.UsersBetweenThirtysixToSeventy.Ratio;
  let usersAboveSeventyRatio = ageWiseUsers.UsersAboveSeventy.Ratio;
  let ageNotSpecifiedUsersRatio = ageWiseUsers.AgeNotSpecifiedUsers.Ratio;

  let sourceData = [usersBelowThirtyfiveRatio, usersBetweenThirtysixToSeventyRatio, usersAboveSeventyRatio, ageNotSpecifiedUsersRatio];
  $ : sourceData = [usersBelowThirtyfiveRatio, usersBetweenThirtysixToSeventyRatio, usersAboveSeventyRatio, ageNotSpecifiedUsersRatio];

  let data = {
  labels: ['Users below 35', 'Users between 36 to 70', 'Users above 70', 'Age not specified'],
  datasets: [
    {
      data:sourceData,
      backgroundColor: chartColors,
      hoverBackgroundColor: hoverChartColors,
    },
  ],
};

 ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

</script>

<Pie id="dataSource" bind:this={ageWiseUsers} {data} options={{ responsive: true }} />
