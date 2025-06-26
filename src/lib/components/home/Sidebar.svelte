<script lang="ts">
	import { navigating, page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { sidebarMenu, type TabDefinition } from './navigation.tabs';
	import { buildSidebarMenu } from './sidebar.menus';
	import SidebarNavItems from './SidebarNavItems.svelte';
	let { showSidebar = $bindable(), navParent, page_, userId, tenantSettings, userRole } = $props();

	let activeTab = $state('Home');
	const navData = buildSidebarMenu(userId, tenantSettings, userRole);
	console.log('Tenant Setting', navData);

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
						class="sidebar-item {activeTab === 'Analytics' ? 'variant-soft-secondary' : ''}"
						onclick={() => (activeTab = 'Analytics')}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class="text-2xl" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
					</a>
				{:else if navParent.title === 'Appointment Follow-Up'}
					<a
						href={`/users/${userId}/appointment-followup/summary-uploads`}
						class="sidebar-item {activeTab === 'Appointment' ? 'variant-soft-secondary' : ''}"
						onclick={() => (activeTab = 'Appointment')}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class="text-2xl" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
					</a>
				{:else if navParent.title === 'Home'}
					<a
						href={navParent.link}
						class="sidebar-item {activeTab === 'Home' ? 'variant-soft-secondary' : ''}"
						onclick={() => (activeTab = 'Home')}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class="text-2xl" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>
					</a>
				{:else}
					<button
						class="sidebar-item flex w-full items-center justify-between"
						onclick={() => toggleDropdown(navParent.title)}
					>
						<div class="flex items-center gap-1">
							<Icon icon={navParent.icon} class="text-2xl" />
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

				{#if openTab == navParent.title && navParent.title !== 'Analytics' && navParent.title !== 'Home'}
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
