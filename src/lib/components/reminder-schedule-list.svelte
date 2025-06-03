<script lang="ts">
	import type { ReminderTrigger } from '$lib/types/tenant.settings.types';

	let { reminderSchedule = $bindable(), editSchedule, deleteSchedule } = $props();

	// let newReminder: ReminderTrigger = $state({
	// 	Type: 'PreviousDay',
	// 	OffsetValue: undefined,
	// 	OffsetUnit: 'hours',
	// 	TimeOfDay: ''
	// });

	// let editingIndex: number | null = null;

	// const deleteSchedule = (index: number) => {
	// 	if (source === 'Api') {
	// 		reminderSchedule.splice(index, 1);
	// 	} else if (source === 'File') {
	// 		reminderSchedule.splice(index, 1);
	// 	}
	// };

	// const editSchedule = (index: number) => {
	// 	editingIndex = index;

	// 	const scheduleToEdit = source === 'Api' ? reminderSchedule[index] : reminderSchedule[index];

	// 	newReminder = { ...scheduleToEdit };

	// 	showReminderModal = true;
	// };
</script>

<!-- <tr>
	<td><h3 class="text-sm font-medium">Reminder Schedules</h3></td>
	<td>
		<button
			onclick={(event) => {
				event.preventDefault();
				showReminderModal = true;
			}}
			class="table-btn variant-filled-secondary gap-1"
		>
			Add Schedule
		</button>
	</td>
</tr> -->

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
					class="text-xs text-blue-600 underline"
					onclick={(event) => {
						event.preventDefault();
						editSchedule(i);
					}}
				>
					Edit
				</button>
				<button
					class="text-xs text-red-600 underline"
					onclick={(event) => {
						event.preventDefault();
						deleteSchedule(i);
					}}
				>
					Delete
				</button>
			</div>
		</td>
	</tr>
{/each}

<!-- {#each followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule as schedule, i}
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

										
										<div class="flex gap-2">
											<button
												class="text-xs text-blue-600 underline"
												onclick={(event) => {
													event.preventDefault();
													editSchedule(i);
												}}
											>
												Edit
											</button>
											<button
												class="text-xs text-red-600 underline"
												onclick={(event) => {
													event.preventDefault();
													deleteSchedule(i);
												}}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							{/each} -->

<!-- {#each followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule as schedule, i}
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

								
										<div class="flex gap-2">
											<button
												class="text-xs text-blue-600 underline"
												onclick={(event) => {
													event.preventDefault();
													editSchedule(i);
												}}
											>
												Edit
											</button>
											<button
												class="text-xs text-red-600 underline"
												onclick={(event) => {
													event.preventDefault();
													deleteSchedule(i);
												}}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							{/each} -->
