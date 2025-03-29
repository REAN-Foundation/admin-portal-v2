<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	// function handleDownloadReportClick() {
	//     console.log('Created custom event: downloadReport');
	//     downloadReport({});
	// }
	let {
		userId,
		tenantCode,
		downloadAnalyticsJSONReport,
		downloadAnalyticsExcelReport,
		downloadAnalyticsPdfReport
	} = $props();

	let homeLink = `/users/${userId}/home`;
	let usersLink = `/users/${userId}/home/users-stats`;
	let basicStatsLink = `/users/${userId}/home/analytics-overview`;
	let demographicsLink = `/users/${userId}/home/patient-demographics`;
	let genericLink = `/users/${userId}/home/generic-engagement`;
	let featureLink = `/users/${userId}/home/feature-engagement`;
	// let rhgLink;
	// let botLink;

	let isOpen = $state(false);
	let buttonLabel = $state('Download');

	// const options = ['JSON', 'Excel', 'PDF'];
	const options = ['JSON', 'Excel'];
	function handleDownloadAnalyticsReportInJSONClick() {
		console.log('Created custom event: downloadAnalyticsJSONReport');
		downloadAnalyticsJSONReport({});
	}

	function handleDownloadAnalyticsReportInExcelClick() {
		console.log('Created custom event: downloadAnalyticsExcelReport');
		downloadAnalyticsExcelReport({});
	}

	function handleDownloadAnalyticsReportInPdfClick() {
		console.log('Created custom event: downloadAnalyticsPdfReport');
		downloadAnalyticsPdfReport({});
	}

	function handleSelect(selectedValue: string) {
		// This function would handle the selected option
		console.log(`Selected: ${selectedValue}`);
		switch (selectedValue) {
			case 'JSON':
				handleDownloadAnalyticsReportInJSONClick();
				break;
			case 'Excel':
				handleDownloadAnalyticsReportInExcelClick();
				break;
			case 'PDF':
				handleDownloadAnalyticsReportInPdfClick();
				break;
			default:
				// Handle the case where no valid option is selected
				break;
		}
		buttonLabel = 'Download';
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}
</script>

<div class="flex w-full items-center">
	<div class="flex flex-grow gap-4">
		<a
			class="btn {page.url.pathname === homeLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'}"
			href={homeLink}
		>
			Overall
		</a>
		<a
			class="btn {page.url.pathname === usersLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'}"
			href={usersLink}
		>
			Distribution
		</a>
		{#if tenantCode === 'default'}
			<a
				class="btn {page.url.pathname === basicStatsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'}"
				href={basicStatsLink}
			>
				Basic
			</a>
			<a
				class="btn {page.url.pathname === demographicsLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'}"
				href={demographicsLink}
			>
				Demographics
			</a>
			<a
				class="btn {page.url.pathname === genericLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'}"
				href={genericLink}
			>
				Generic
			</a>
			<a
				class="btn {page.url.pathname === featureLink
					? 'variant-filled-secondary'
					: 'variant-soft-secondary'}"
				href={featureLink}
			>
				Feature
			</a>
		{/if}
	</div>
	{#if tenantCode === 'default'}
		<div class="relative ml-auto inline-block pl-2 text-left">
			<div>
				<button
					type="button"
					class="btn variant-filled-secondary inline-flex justify-center"
					onclick={toggleDropdown}
				>
					{buttonLabel}
					<Icon icon="gridicons:dropdown" width="16" height="16" class="-mr-1 ml-2 h-5 w-5" />
				</button>
			</div>
			{#if isOpen}
				<div
					class="ring-opacity-5 absolute right-0 mt-2 w-full origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black"
				>
					<div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
						{#each options as option}
							<button
								class="text-primary-500 dark:text-primary-100 block w-full px-4 py-2 text-center text-sm hover:bg-gray-100 hover:text-gray-900"
								role="menuitem"
								onclick={() => handleSelect(option)}
							>
								{option}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
