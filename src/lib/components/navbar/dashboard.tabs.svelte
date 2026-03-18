<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	let {
		userId,
		tenantCode,
		downloadAnalyticsJSONReport,
		downloadAnalyticsExcelReport,
		downloadAnalyticsPdfReport
	} = $props();

	// Preserve tenant query params when navigating between tabs
	let queryString = $derived(() => {
		const params = new URLSearchParams($page.url.searchParams);
		const qs = params.toString();
		return qs ? `?${qs}` : '';
	});

	// Path-only constants for active tab detection
	const basicStatsPath = `/users/${userId}/analytics/basic`;
	const demographicsPath = `/users/${userId}/analytics/demographics`;
	const genericPath = `/users/${userId}/analytics/overall`;
	const featurePath = `/users/${userId}/analytics/feature-specific`;

	// Full links with query params preserved for navigation
	let basicStatsLink = $derived(`${basicStatsPath}${queryString()}`);
	let demographicsLink = $derived(`${demographicsPath}${queryString()}`);
	let genericLink = $derived(`${genericPath}${queryString()}`);
	let featureLink = $derived(`${featurePath}${queryString()}`);

	let isOpen = $state(false);
	let buttonLabel = $state('Download');

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
	<div
		class="grid w-full grid-cols-2 gap-2 text-center md:grid md:grid-cols-3 md:space-x-4 xl:flex xl:w-full"
	>
		<!-- Row 1 -->
		<a
			class="btn {$page.url.pathname === basicStatsPath
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2"
			href={basicStatsLink}
		>
			<Icon icon="material-symbols:layers-outline" class="h-5 w-5" />
			Basic
		</a>

		<a
			class="btn {$page.url.pathname === demographicsPath
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2"
			href={demographicsLink}
		>
			<Icon icon="octicon:people-16" class="h-5 w-5 shrink-0" />
			Demographics
		</a>

		<!-- Row 2 -->
		<a
			class="btn {$page.url.pathname === genericPath
				? 'variant-filled-secondary'
				: 'variant-soft-secondary'} flex items-center justify-center gap-2"
			href={genericLink}
		>
			<Icon icon="fluent-mdl2:tab" class="h-4 w-4" />
			Overall
		</a>

		<a
			class="btn {$page.url.pathname === featurePath
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
					<span class="mx-2 h-4 w-4 transition-transform duration-300">
						<Icon icon="material-symbols:download" class="h-5 w-5 shrink-0" />
					</span>
					{buttonLabel}
					<span class="mx-1 h-4 w-4 transition-transform duration-200" class:rotate-180={isOpen}>
						<Icon icon="icon-park-outline:down" class="h-5 w-5" />
					</span>
				</button>

				{#if isOpen}
					<div
						class="ring-opacity-5 absolute right-0 mt-2 w-full origin-top-right rounded-md bg-[var(--color-accent)] ring-1 shadow-lg ring-black"
					>
						<div
							class="py-1"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="options-menu"
						>
							{#each options as option}
								<button
									class=" text-[var(--color-info)] block flex w-full items-center justify-center gap-2 px-4 py-2 text-center text-sm hover:cursor-pointer hover:bg-gray-100 hover:text-gray-900"
									role="menuitem"
									onclick={() => handleSelect(option)}
								>
									{#if option === 'JSON'}
										<Icon icon="si:json-duotone" class="h-4 w-4 " />
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
