<script>
  import { onMount, tick } from 'svelte';
  let canvas;
  let ctx;
  export let totalWeeks = 60;
  export let currentWeek;
  export let MAX_STEP_WIDTH = 580;
  let MAX_STEP_HEIGHT = 296;
	let MIN_STEP_HEIGHT = 7;
  const X_OFFSET = 60;
  const Y_OFFSET = 26;
  const GAP_BETWEEN_STEPS = totalWeeks > 40 ? 2 : 2;
  const ROUNDED_CORNER_RADIUS = 15 / (1 + totalWeeks / 25);

  const getStepHeight = (totalWeeks) => {
    if (totalWeeks === 0) {
      return MIN_STEP_HEIGHT;
    }
  let height  =  (MAX_STEP_HEIGHT / totalWeeks)
  return height;
  };
  const height = getStepHeight(totalWeeks) ;

  let canvasWidth = MAX_STEP_WIDTH + 2 * X_OFFSET;
  let canvasHeight = totalWeeks * (height + GAP_BETWEEN_STEPS ) + 2 * Y_OFFSET;

  const drawEnrollmentStatus = (ctx, currentWeek, totalWeeks) => {
    const ratio = (currentWeek - 1) / totalWeeks;
    console.log("ratio", ratio);
    var grd = ctx.createLinearGradient(0, (height + 2) * totalWeeks, 0, 0);
    grd.addColorStop(0, 'MediumSeaGreen');
    grd.addColorStop(ratio, 'DarkSlateBlue');
    grd.addColorStop(ratio, 'DarkOrchid');
    grd.addColorStop(1, 'DarkSlateBlue');
    ctx.font = '13px Arial';
    ctx.beginPath();

    for (var i = 0; i < totalWeeks; i++) {
      const width = getStepWidth(i, totalWeeks) + 5;
      const x = MAX_STEP_WIDTH - width;
      const y = (totalWeeks - i) * (height + 2);
      console.log(x, y, width, height);
      ctx.fillStyle = grd;
      const weekStr = (i + 1).toFixed();
      ctx.roundRect(MAX_STEP_WIDTH - width + X_OFFSET, y , width, height, [
        ROUNDED_CORNER_RADIUS,
        2,
        2,
        2
      ]);
      if(i % 2 === 0 && totalWeeks > 35){
				 ctx.fillText(weekStr , MAX_STEP_WIDTH + X_OFFSET + 10, y + height);
			}
			else {
				ctx.fillText(weekStr , MAX_STEP_WIDTH + X_OFFSET + 10, y + height);
			}
      ctx.fill();
    }
  };


  const getStepWidth = (weekIndex, totalWeeks) => {
    if (totalWeeks === 0) {
      return MAX_STEP_WIDTH;
    }
    const width = (totalWeeks - weekIndex) / totalWeeks;
    let w = MAX_STEP_WIDTH * width;
    return w;
  };

  onMount(async () => {
    ctx = canvas.getContext('2d');
    await tick();
    drawEnrollmentStatus(ctx, currentWeek, totalWeeks);
  });
</script>

<div class="container" bind:clientWidth={canvasWidth} bind:clientHeight={canvasHeight}>
  <canvas bind:this={canvas} width={canvasWidth} height={canvasHeight} />
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    
  }
</style>
