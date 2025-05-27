<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';

	let { onUpdateScoringCondition, closeModal } = $props();
	let score = $state();

	const submit = () => {
		onUpdateScoringCondition(score);
		closeModal();
	};

	const cancel = () => {
		closeModal();
	};
</script>

<!-- Overlay -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" transition:fade>
	<!-- Modal Box -->
	<div class="relative w-[90%] max-w-md rounded-xl bg-white p-6 shadow-lg">

		<!-- Top Bar -->
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold">Update Scoring Condition</h2>
			<button class="text-gray-500 hover:text-gray-700" onclick={cancel}>
				<Icon icon="material-symbols:close-rounded" class="text-2xl" />
			</button>
		</div>

		<p class="text-sm text-gray-600 mb-4">Please enter the new score for the scoring condition.</p>

		<!-- Input -->
		<input
			type="number"
			min="0"
			bind:value={score}
			class="mb-6 w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
			placeholder="Enter resolution score here..."
		/>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3">
			<button
				class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
				onclick={cancel}
			>
				Cancel
			</button>
			<button
				class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
				onclick={submit}
			>
				Submit
			</button>
		</div>
	</div>
</div>
