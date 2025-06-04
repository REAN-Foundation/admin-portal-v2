<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';

	let { showReminderModal = $bindable(), addSchedule, newReminder = $bindable() } = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" transition:fade>
	<!-- Modal Box -->
	<div class="relative w-[100%] max-w-md rounded-xl bg-white p-6 shadow-lg">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th class="w-[30%]">Add Reminder Schedule </th>
						<th class="w-[70%] text-end">
							<button class="cancel-btn" onclick={() => (showReminderModal = false)}>
								<Icon icon="material-symbols:close-rounded" class="text-2xl" />
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

			<div class=" flex justify-end gap-3 p-3">
				<button
					class="cancel-btn rounded px-4 py-2 text-sm hover:bg-gray-300"
					onclick={() => (showReminderModal = false)}
				>
					Cancel
				</button>
				<button class="table-btn variant-filled-secondary gap-1 rounded" onclick={addSchedule}>
					Add
				</button>
			</div>
		</div>
	</div>
</div>
