<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/button/button.svelte';

	let { showReminderModal = $bindable(), addSchedule, newReminder = $bindable() } = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" transition:fade>
	<!-- Modal Box -->
	<div class="relative w-[100%] max-w-md rounded-xl bg-white shadow-lg">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th class="">Add Reminder Schedule </th>
						<th class=" text-end">
							<button class="cancel-btn border-[0.5px] border-[var(--color-outline)]" onclick={() => (showReminderModal = false)}>
								<Icon icon="material-symbols:close-rounded" class=" text-md " />
							</button>
						</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						<td>
							<label for="type" class="mb-1 block font-medium"
								>Type <span class="text-red-700">*</span></label
							>
						</td>
						<td>
							<select bind:value={newReminder.Type} class="w-full rounded border p-2">
								<option value="PreviousDay">Previous Day</option>
								<option value="SameDayMorning">Same Day Morning</option>
								<option value="StartOfDay">Start Of Day</option>
								<option value="XHoursBefore">X Hours Before</option>
								<option value="XMinutesBefore">X Minutes Before</option>
								<option value="CustomTimeBefore">Custom Time Before</option>
								<option value="AfterAppointment">After Appointment</option>
								<option value="EndOfDay">End Of Day</option>
								<option value="NoReminder">No Reminder</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>
							<label for="offset" class="mb-1 block font-medium">Offset Value</label>
						</td>
						<td>
							<input
								type="number"
								bind:value={newReminder.OffsetValue}
								placeholder="Enter offset value"
								class="w-full rounded border p-2"
								min="0"
								max="24"
							/>
						</td>
					</tr>
					<tr>
						<td>
							<label for="unit" class="mb-1 block font-medium">Offset Unit</label>
						</td>
						<td>
							<select bind:value={newReminder.OffsetUnit} class="w-full rounded border p-2">
								<option value="minutes">Minutes</option>
								<option value="hours">Hours</option>
								<option value="days">Days</option>
							</select>
						</td>
					</tr>
					<tr>
						<td>
							<label for="time" class="mb-1 block font-medium">Time of Day</label>
						</td>
						<td>
							<input
								type="time"
								bind:value={newReminder.TimeOfDay}
								class="w-full rounded border p-2"
							/>
						</td>
					</tr>
				</tbody>
			</table>

		<div class="flex justify-end gap-3 p-3">
				<Button
					variant="outline"
					size="sm"
					text="Cancel"
					onclick={() => (showReminderModal = false)}
				/>
				<Button
					variant="primary"
					size="sm"
					text="Add"
					onclick={addSchedule}
				/>
			</div>
		</div>
	</div>
</div>
