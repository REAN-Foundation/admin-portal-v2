<script lang="ts">
	import Icon from '@iconify/svelte';

	///////////////////////////////////////////////////////////////////////////

	let { 
		placeholder = 'Search...', 
		searchUrl = '', 
		searchField = 'name',
		displayField = 'name',
		valueField = 'id',
		selectedValue = $bindable(),
		selectedDisplay = $bindable(),
		onSelect = $bindable()
	} = $props();

	let searchTerm = $state('');
	let searchResults = $state([]);
	let isOpen = $state(false);
	let isLoading = $state(false);
	let debounceTimeout: NodeJS.Timeout;
	let dropdownContainer: HTMLDivElement;
	let isClickingInside = $state(false);

	const handleSearch = async (term: string) => {
		if (!term.trim()) {
			searchResults = [];
			return;
		}

		try {
			isLoading = true;
			let url = `${searchUrl}?${searchField}=${encodeURIComponent(term)}&itemsPerPage=10&pageIndex=0`;
			
			if (searchUrl.includes('/careplan/search') && searchField === 'code') {
				url = `${searchUrl}?code=${encodeURIComponent(term)}&itemsPerPage=10&pageIndex=0`;
			}
			
			const response = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});

			// if (!response.ok) {
			// 	const text = await response.text();
			// 	console.error(`Search request failed: ${response.status}`, text);
			// 	searchResults = [];
			// 	return;
			// }

			// const contentType = response.headers.get('content-type') ?? '';
			// if (!contentType.includes('application/json')) {
			// 	const text = await response.text();
			// 	console.error('Search failed: non-JSON response received', text);
			// 	searchResults = [];
			// 	return;
			// }

			const result = await response.json();
			
			if (result.Data && result.Data.Items) {
				searchResults = result.Data.Items;
			} else if (result.Data?.CourseRecords?.Items) {
				searchResults = result.Data.CourseRecords.Items;
			} else if (result.Data?.LearningPathRecords?.Items) {
				searchResults = result.Data.LearningPathRecords.Items;
			} else if (result.Data && result.Data.Patients && result.Data.Patients.Items) {
				searchResults = result.Data.Patients.Items;
			} else if (result.Data && result.Data.Careplans && result.Data.Careplans.Items) {
				searchResults = result.Data.Careplans.Items;
			} else if (result.Data && result.Data.Careplans) {
				searchResults = result.Data.Careplans;
			} else if (Array.isArray(result)) {
				searchResults = result;
			} else if (result.Items) {
				searchResults = result.Items;
			} else {
				searchResults = [];
			}
			console.log('Search results:', searchResults);
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		} finally {
			isLoading = false;
		}
	};

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;
		
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			handleSearch(searchTerm);
		}, 300);
	};

	const handleSelect = (item: any) => {
		selectedValue = item[valueField];
		selectedDisplay = item[displayField];
		searchTerm = item[displayField];
		isOpen = false;
		searchResults = [];
		isClickingInside = false;
		
		if (onSelect) {
			onSelect(item);
		}
	};

	const handleFocus = () => {
		isOpen = true;
		if (searchTerm.trim()) {
			handleSearch(searchTerm);
		}
	};

	const handleBlur = () => {
		// Delay closing to allow for click events, but only if not clicking inside dropdown
		setTimeout(() => {
			if (!isClickingInside) {
				isOpen = false;
			}
			isClickingInside = false;
		}, 200);
	};

	const handleDropdownMouseDown = () => {
		isClickingInside = true;
	};

	const clearSelection = () => {
		selectedValue = '';
		selectedDisplay = '';
		searchTerm = '';
		searchResults = [];
		isOpen = false;
		
		if (onSelect) {
			onSelect(null);
		}
	};
</script>

<div class="relative">
	<div class="relative">
		<Icon
			icon="heroicons:magnifying-glass"
			class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
		/>
		<input
			type="text"
			bind:value={searchTerm}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
			placeholder={placeholder}
			class="input !pr-10 !pl-10 w-full"
		/>
		{#if searchTerm}
			<button
				type="button"
				onclick={clearSelection}
				class="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
			>
				<Icon icon="material-symbols:close" class="h-5 w-5" />
			</button>
		{/if}
	</div>

	{#if isOpen && (searchResults.length > 0 || isLoading || (searchTerm.trim() && !isLoading))}
		<div 
			bind:this={dropdownContainer}
			class="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg"
			onmousedown={handleDropdownMouseDown}
		>
			{#if isLoading}
				<div class="p-4 text-center text-gray-500">
					<Icon icon="mdi:loading" class="h-5 w-5 animate-spin mx-auto" />
					Loading...
				</div>
			{:else if searchResults.length > 0}
				<ul class="max-h-60 overflow-auto">
					{#each searchResults as item (item[valueField])}
						<li>
							<button
								type="button"
								onmousedown={(e) => {
									e.preventDefault();
									handleSelect(item);
								}}
								class="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
							>
								{item[displayField] || 'No display value'}
							</button>
						</li>
					{/each}
				</ul>
			{:else if searchTerm.trim()}
				<div class="p-4 text-center text-gray-500">
					No records found
				</div>
			{/if}
		</div>
	{/if}
</div> 