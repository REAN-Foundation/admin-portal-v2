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
	<div class="form-title text p-4">Careplan Schedule</div>

	<div class="my-3 flex items-center justify-center">
		<div class="flex space-x-4 rounded-lg bg-gray-200 p-2">
			<button
				type="button"
				class="rounded-lg px-4 py-2 transition"
				class:bg-gray-400={value === 0}
				class:text-white={value === 0}
				class:bg-gray-200={value !== 0}
				class:text-gray-800={value !== 0}
				class:hover:bg-gray-300={value !== 0}
				onclick={() => (value = 0)}
			>
				Week View
			</button>
			<button
				type="button"
				class="rounded-lg px-4 py-2 transition"
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
