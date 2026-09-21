<script lang="ts">
	//////////////////////////////////////////////////////////////////////////

	let {
		range = 'yearToDate',
		startDate = '',
		endDate = '',
		onSelect
	}: {
		range?: string;
		startDate?: string;
		endDate?: string;
		onSelect?: (value: { range: string; startDate: string; endDate: string }) => void;
	} = $props();

	const presets = [
		{ value: 'today', label: 'Today' },
		{ value: 'last7days', label: 'Last 7 Days' },
		{ value: 'last30days', label: 'Last 30 Days' },
		{ value: 'thisMonth', label: 'This Month' },
		{ value: 'lastMonth', label: 'Last Month' },
		{ value: 'yearToDate', label: 'Year to Date' },
		{ value: 'lastYear', label: 'Last Year' },
		{ value: 'custom', label: 'Custom Range' }
	];

	let selectedRange = $state(range);
	let customStart = $state(startDate);
	let customEnd = $state(endDate);
	let validationMessage = $state('');

	function handleRangeChange() {
		validationMessage = '';
		if (selectedRange !== 'custom') {
			onSelect?.({ range: selectedRange, startDate: '', endDate: '' });
		}
	}

	function handleCustomApply() {
		if (!customStart || !customEnd) {
			validationMessage = 'Select both a start and end date.';
			return;
		}
		if (customEnd < customStart) {
			validationMessage = 'End date must be on or after the start date.';
			return;
		}
		validationMessage = '';
		onSelect?.({ range: 'custom', startDate: customStart, endDate: customEnd });
	}
</script>

<div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
	<select
		bind:value={selectedRange}
		onchange={handleRangeChange}
		class="table-input-field w-full md:w-56"
	>
		{#each presets as preset}
			<option value={preset.value}>{preset.label}</option>
		{/each}
	</select>

	{#if selectedRange === 'custom'}
		<input type="date" bind:value={customStart} class="table-input-field" />
		<input type="date" bind:value={customEnd} class="table-input-field" />
		<button type="button" class="btn variant-filled-secondary" onclick={handleCustomApply}>
			Apply
		</button>
	{/if}
</div>
{#if validationMessage}
	<p class="mt-1 text-sm text-[var(--color-error)]">{validationMessage}</p>
{/if}
