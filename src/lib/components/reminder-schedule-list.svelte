<script lang="ts">
	import Icon from "@iconify/svelte";


	let { reminderSchedule = $bindable(), editSchedule, deleteSchedule } = $props();

</script>

{#each reminderSchedule as schedule, i}
	<tr>
		<td>
			<div class="flex border-b pb-1 text-sm last:border-none">
				<span class="px-2">{i + 1}</span>
				<span class="justify-left">{schedule.Type}</span>
			</div>
		</td>
		<td class="flex items-center justify-between gap-2 text-sm">
			{#if schedule.TimeOfDay}
				{schedule.TimeOfDay}
			{:else if schedule.OffsetValue}
				{schedule.OffsetValue} {schedule.OffsetUnit} before
			{:else}
				—
			{/if}

			<!-- Buttons -->
			<div class="flex gap-2">
				<button
					class="health-system-btn"
					onclick={(event) => {
						event.preventDefault();
						editSchedule(i);
					}}
				>
						<Icon icon="material-symbols:edit-outline" height=15 width=15 />
				</button>
				<button
					class="health-system-btn !text-red-600"
					onclick={(event) => {
						event.preventDefault();
						deleteSchedule(i);
					}}
				>
				<Icon icon="material-symbols:delete-outline-rounded" height=15 width=15 />
				</button>
			</div>
		</td>
	</tr>
{/each}
