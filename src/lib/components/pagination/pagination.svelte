<script lang="ts">
	import Icon from '@iconify/svelte';
	let { paginationSettings = $bindable(), onItemsPerPageChange, onPageChange } = $props();

	const onAmountChange = (event: Event) => {
		const value = Number((event.target as HTMLSelectElement).value);
		console.log('changeAmount', value);
		paginationSettings.limit = value;
		paginationSettings.page = 0;
		onItemsPerPageChange();
	};
</script>

<div class="pagination-container">
	<!-- Items Per Page Dropdown -->
	<div class="flex flex-col items-start text-sm">
		<div class="relative">
			<select id="itemsPerPage" class="pagination-select" onchange={onAmountChange}>
				{#each paginationSettings.amounts as amount (amount)}
					<option class="bg-[var(--color-secondary)]" value={amount}>{amount} Items</option>
				{/each}
			</select>
			<!-- Chevron Icon -->
			<div
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--color-info)]"
			>
				<Icon icon="mdi:chevron-down" class="h-4 w-4" />
			</div>
		</div>
	</div>
	<!-- Pagination Buttons -->
	<div class="flex items-center space-x-2">
		<button
			onclick={() => {
				paginationSettings.page = paginationSettings.page - 1;
				onPageChange();
			}}
			disabled={paginationSettings.page === 0}
		>
			<Icon
				icon="material-symbols:chevron-left-rounded"
				class="text-[var(--color-info)]"
				width="20"
				height="20"
			/>
		</button>

		<span class=" text-xs text-[var(--color-info)]">
			{`${paginationSettings.page * paginationSettings.limit + 1}-${(paginationSettings.page + 1) * paginationSettings.limit >= paginationSettings.size ? paginationSettings.size : (paginationSettings.page + 1) * paginationSettings.limit}`}
			of {paginationSettings.size}
		</span>
		<button
			onclick={() => {
				paginationSettings.page = paginationSettings.page + 1;
				onPageChange();
			}}
			disabled={(paginationSettings.page + 1) * paginationSettings.limit >= paginationSettings.size}
		>
			<Icon
				icon="material-symbols:chevron-right-rounded"
				class="text-[var(--color-info)]"
				width="20"
				height="20"
			/>
		</button>
	</div>
</div>
