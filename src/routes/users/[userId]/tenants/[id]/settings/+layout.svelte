<script>
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';

	//////////////////////////////////////////////////////////////////////////////

	let { children } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;

	const viewRoute = `/users/${userId}/tenants/${tenantId}/settings`;
	const tenantRoute = `/users/${userId}/tenants`;

	// Primary horizontal tabs configuration
	const primaryTabs = [
		{
			id: 'integrations',
			name: 'Integrations',
			path: viewRoute,
			icon: 'mdi:view-dashboard-outline',
			description: 'Toggle integrations and modules'
		},
		{
			id: 'common',
			name: 'Common',
			path: `${viewRoute}/common-setting`,
			icon: 'material-symbols:layers-outline',
			description: 'Clinical, wellness, and general settings'
		}
	];

	// Get current active tab
	const currentTab = $derived.by(() => {
		const currentPath = page.url.pathname;

		// Check if we're on the common settings page
		if (currentPath.includes('common-setting')) {
			return 'common';
		}

		// Default to integrations for main page and other sub-pages
		return 'integrations';
	});

	// Build breadcrumbs dynamically
	const breadCrumbs = $derived.by(() => {
		const activeTab = primaryTabs.find(tab => tab.id === currentTab);

		const crumbs = [
			{
				name: 'Tenants',
				path: tenantRoute
			},
			{
				name: 'Settings',
				path: viewRoute
			}
		];

		if (activeTab && activeTab.id !== 'integrations') {
			crumbs.push({
				name: activeTab.name,
				path: activeTab.path
			});
		}

		return crumbs;
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="settings-container flex min-h-[calc(100vh-180px)] w-full flex-col px-4 py-2 gap-4">
	<!-- Horizontal Tabs -->
	<div class="tabs-container border-b border-[var(--color-outline)] bg-[var(--color-primary)] rounded-t-lg">
		<nav class="flex gap-1 px-2" aria-label="Settings tabs">
			{#each primaryTabs as tab}
				<a
					href={tab.path}
					class="tab-item flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-[1px]
						{currentTab === tab.id
							? 'border-blue-600 text-blue-600 bg-blue-50/50'
							: 'border-transparent text-[var(--color-info)] hover:text-blue-600 hover:bg-gray-50'}"
					aria-current={currentTab === tab.id ? 'page' : undefined}
				>
					<Icon icon={tab.icon} class="h-5 w-5" />
					<span>{tab.name}</span>
				</a>
			{/each}
		</nav>
	</div>

	<!-- Main Content Area -->
	<main class="settings-content flex-1 min-w-0">
		{@render children()}
	</main>
</div>

<style>
	.settings-container {
		max-width: 1600px;
		margin: 0 auto;
	}

	.tabs-container {
		animation: fadeIn 0.2s ease-out;
	}

	.tab-item {
		position: relative;
	}

	.tab-item:hover {
		background-color: rgba(59, 130, 246, 0.05);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
