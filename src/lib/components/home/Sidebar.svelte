<script lang="ts">
	import { navigating, page } from '$app/state';
	import { onDestroy } from 'svelte';
	import Icon from '@iconify/svelte';
	import { sidebarMenu, type TabDefinition } from './navigation.tabs';
	import { buildSidebarMenu } from './sidebar.menus';
	import SidebarNavItems from './SidebarNavItems.svelte';
	import { tenantSettingsStore } from '$lib/store/general.store';
	let { showSidebar = $bindable(), navParent, page_, userId, tenantSettings, userRole } = $props();

	let activeTab = $state('Home');
	let navData = $state(buildSidebarMenu(userId, tenantSettings, userRole));
	console.log('Tenant Setting', navData);

	// Re-build sidebar menu when tenant settings store changes
	const unsubscribe = tenantSettingsStore.subscribe((storeSettings) => {
		if (storeSettings) {
			navData = buildSidebarMenu(userId, storeSettings, userRole);
		}
	});
	onDestroy(unsubscribe);

	const sidebarTabs: TabDefinition[] = sidebarMenu();
	$effect(() => {
		showSidebar = navigating ? false : true;
	});

	let openTab = $state(null);
	function toggleDropdown(tabName) {
		openTab = openTab === tabName ? null : tabName;
	}
</script>

<div class="{showSidebar ? 'z-10 max-md:fixed' : 'hidden'} transition-all md:block">
	<div class="sidebar">
		<ul class="sidebar-list">
			{#each navData as navParent, idx}
				{#if navParent.title === 'Analytics'}
					<a
						href={`/users/${userId}/analytics/basic`}
						class="sidebar-item {activeTab === 'Analytics' ? 'variant-filled-secondary' : ''}"
						onclick={() => (activeTab = 'Analytics')}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class=" h-6 w-6" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
					</a>
				{:else if navParent.title === 'Notifications'}
					<a
						href={navParent.link}
						class="sidebar-item {activeTab === 'Notifications' ? 'variant-filled-secondary' : ''}"
						onclick={() => (activeTab = 'Notifications')}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class=" h-6 w-6" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
					</a>
				{:else if navParent.title === 'Home'}
					<a
						href={navParent.link}
						class="sidebar-item {activeTab === 'Home' ? 'variant-filled-secondary' : ''}"
						onclick={() => (activeTab = 'Home')}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class=" h-6 w-6" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
					</a>
				{:else}
					<button
						class="sidebar-item flex w-full items-center justify-between"
						onclick={() => toggleDropdown(navParent.title)}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class=" h-6 w-6" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-180={openTab === navParent.title}
						>
							<Icon icon="icon-park-outline:down" class="h-4 w-4" />
						</span>
					</button>
				{/if}

				{#if openTab == navParent.title && navParent.title !== 'Analytics' && navParent.title !== 'Home' && navParent.childNav?.length > 0}
					<div class="mx-4">
						<nav class="space-y-1">
							{#each navParent.childNav as navItem}
								<SidebarNavItems {navItem} {page} bind:activeTab />
							{/each}
						</nav>
					</div>
				{/if}
			{/each}
		</ul>
	</div>
</div>
