<script lang="ts">
import { onMount, tick } from 'svelte';

let {
  totalWeeks = 60,
  currentWeek,
  MAX_STEP_WIDTH = 580,
} = $props();

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let MAX_STEP_HEIGHT = 296;
let MIN_STEP_HEIGHT = 7;
const X_OFFSET = 60;
const Y_OFFSET = 26;

let GAP_BETWEEN_STEPS = $derived(totalWeeks > 40 ? 2 : 2);
let ROUNDED_CORNER_RADIUS = $derived(15 / (1 + totalWeeks / 25));

function getStepHeight(weeks: number) {
  if (weeks === 0) {
    return MIN_STEP_HEIGHT;
  }
  let height = (MAX_STEP_HEIGHT / weeks);
  return height;
}

let height = $derived(getStepHeight(totalWeeks));
let canvasWidth = $derived(MAX_STEP_WIDTH + 2 * X_OFFSET);
let canvasHeight = $derived(totalWeeks * (height + GAP_BETWEEN_STEPS) + 2 * Y_OFFSET);

function getStepWidth(weekIndex: number, weeks: number) {
  if (weeks === 0) {
    return MAX_STEP_WIDTH;
  }
  const width = (weeks - weekIndex) / weeks;
  let w = MAX_STEP_WIDTH * width;
  return w;
}

function drawEnrollmentStatus(ctx: CanvasRenderingContext2D, currentWeek: number, totalWeeks: number) {
  // Ensure currentWeek is within valid range
  const safeCurrentWeek = Math.max(1, Math.min(currentWeek, totalWeeks));
  const ratio = Math.max(0, Math.min((safeCurrentWeek - 1) / totalWeeks, 1));
  
  console.log("ratio", ratio);
  
  var grd = ctx.createLinearGradient(0, (height + 2) * totalWeeks, 0, 0);
  
  // Clear the canvas first
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  try {
    grd.addColorStop(0, 'MediumSeaGreen');
    
    // Only add middle gradient stops if ratio is within valid range
    if (ratio > 0 && ratio < 1) {
      grd.addColorStop(ratio, 'DarkSlateBlue');
      grd.addColorStop(ratio, 'DarkOrchid');
    }
    
    grd.addColorStop(1, 'DarkSlateBlue');
    
    ctx.font = '13px Arial';
    ctx.beginPath();

    for (var i = 0; i < totalWeeks; i++) {
      const width = getStepWidth(i, totalWeeks) + 5;
      const x = MAX_STEP_WIDTH - width;
      const y = (totalWeeks - i) * (height + 2);
      
      ctx.fillStyle = grd;
      const weekStr = (i + 1).toFixed();
      
      ctx.roundRect(
        MAX_STEP_WIDTH - width + X_OFFSET, 
        y, 
        width, 
        height, 
        [ROUNDED_CORNER_RADIUS, 2, 2, 2]
      );
      
      if (i % 2 === 0 && totalWeeks > 35) {
        ctx.fillText(weekStr, MAX_STEP_WIDTH + X_OFFSET + 10, y + height);
      } else {
        ctx.fillText(weekStr, MAX_STEP_WIDTH + X_OFFSET + 10, y + height);
      }
      ctx.fill();
    }
  } catch (error) {
    console.error('Error drawing enrollment status:', error);
  }
}

$effect(() => {
  if (canvas && currentWeek !== undefined && ctx) {
    drawEnrollmentStatus(ctx, currentWeek, totalWeeks);
  }
});

onMount(async () => {
  await tick();
  if (canvas) {
    ctx = canvas.getContext('2d');
    if (ctx && currentWeek !== undefined) {
      drawEnrollmentStatus(ctx, currentWeek, totalWeeks);
    }
  }
});
</script>

<div class="container" style:width={canvasWidth + 'px'} style:height={canvasHeight + 'px'}>
  <canvas bind:this={canvas} width={canvasWidth} height={canvasHeight} />
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style> 