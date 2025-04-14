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
	let usersLink = `/users/${userId}/analytics/users-stats`;
	let basicStatsLink = `/users/${userId}/analytics/basic`;
	let demographicsLink = `/users/${userId}/analytics/demographics`;
	let genericLink = `/users/${userId}/analytics/overall`;
	let featureLink = `/users/${userId}/analytics/feature-specific`;
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

<div class="w-full md:flex md:items-center md:space-x-4">
	<!-- Button Group in Grid -->
	<div
		class="  grid w-full grid-cols-2 gap-2 text-center md:grid md:grid-cols-3 md:space-x-4 xl:flex xl:w-full"
	>
		<!-- Row 1 -->
		<a
			class="btn {page.url.pathname === basicStatsLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2"
			href={basicStatsLink}
		>
			<Icon icon="mdi:home" class=" h-5 w-5" />
			Basic
		</a>
		<!-- <a
			class="btn {page.url.pathname === usersLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'}"
			href={usersLink}
		>
			Distribution
		</a> -->

		<a
			class="btn {page.url.pathname === demographicsLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2"
			href={demographicsLink}
		>
			<Icon icon="octicon:people-16" class="  h-5 w-5 shrink-0" />
			Demographics
		</a>

		<!-- Row 2 -->
		<a
			class="btn {page.url.pathname === genericLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2"
			href={genericLink}
			><Icon icon="fluent-mdl2:tab" class="  h-4 w-4 " />
			Overall
		</a>
		<a
			class="btn {page.url.pathname === featureLink
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2 whitespace-nowrap"
			href={featureLink}
		>
			<Icon icon="material-symbols:featured-play-list-outline-rounded" class="h-5 w-5 shrink-0" />
			Feature Specific
		</a>

		<!-- Dropdown Button (Download) -->
		{#if tenantCode === 'default'}
			<div class="relative">
				<button
					type="button"
					class="btn variant-soft-secondary inline-flex w-full items-center justify-center"
					onclick={toggleDropdown}
				>
					<span class=" mx-2 h-4 w-4 transition-transform duration-300">
						<Icon icon="material-symbols:download" class="h-5 w-5  shrink-0" />
					</span>
					{buttonLabel}
					<span class=" mx-1 h-4 w-4 transition-transform duration-200" class:rotate-180={isOpen}>
						<Icon icon="icon-park-outline:down" class="h-5 w-5  " />
					</span>
				</button>

				{#if isOpen}
					<div
						class="ring-opacity-5 absolute right-0 mt-2 w-full origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black"
					>
						<div
							class="py-1"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="options-menu"
						>
							{#each options as option}
								<button
									class="text-primary-500 dark:text-primary-100 block flex w-full items-center justify-center gap-2 px-4 py-2 text-center text-sm hover:bg-gray-100 hover:text-gray-900"
									role="menuitem"
									onclick={() => handleSelect(option)}
								>
									{#if option === 'JSON'}
										<Icon icon="si:json-duotone" class="h-4 w-4" />
									{:else if option === 'Excel'}
										<Icon icon="teenyicons:ms-excel-outline" class="h-4 w-4" />
									{/if}
									{option}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
