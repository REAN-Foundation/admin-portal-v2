<script lang="ts">
	import CareplanScheduleweek from './careplan-scheduleweek.svelte';
	import CareplanScheduleday from './careplan-scheduleday.svelte';

	let { userId, careplanId, classifiedByDay, classifiedByWeek, handleCareplanScheduleDelete } =
		$props();

	let value = $state(0);
</script>

<div
	class="border-secondary-100 dark:!border-surface-700 mx-4 my-2 flex flex-col overflow-hidden rounded-lg border"
>
	<div class="text p-4 border border-secondary-100 dark:!border-surface-700">Careplan Schedule</div>

	<div class="my-3 flex items-center justify-center">
		<div class="flex space-x-4 rounded-lg border border-gray-200 p-2">
			<button
	type="button"
	class="rounded-lg px-4 py-2 transition"
	class:health-system-btn={value === 0}
	class:variant-filled-secondary={value === 0}
	class:hover:variant-soft-secondary={value === 0}
	class:bg-gray-400={value === 0}
	class:text-white={value === 0}
	class:bg-gray-200={value !== 0}
	class:text-gray-800={value !== 0}
	class:hover:bg-gray-300={value !== 0}
	onclick={() => (value = 0)}
>
	Week View
</button>

<!-- Day View Button -->
<button
	type="button"
	class="rounded-lg px-4 py-2 transition"
	class:health-system-btn={value === 1}
	class:variant-filled-secondary={value === 1}
	class:hover:variant-soft-secondary={value === 1}
	class:bg-gray-400={value === 1}
	class:text-white={value === 1}
	class:bg-gray-200={value !== 1}
	class:text-gray-800={value !== 1}
	class:hover:bg-gray-300={value !== 1}
	onclick={() => (value = 1)}
>
	Day View
</button>
		</div>
	</div>

	{#if value === 0}
		<CareplanScheduleweek {classifiedByWeek} {userId} {careplanId} {handleCareplanScheduleDelete} />
	{:else}
		<CareplanScheduleday {classifiedByDay} {userId} {careplanId} {handleCareplanScheduleDelete} />
	{/if}
</div>
