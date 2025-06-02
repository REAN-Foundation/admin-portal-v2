<script lang="ts">
	import { navigating, page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { sidebarMenu, type TabDefinition } from './navigation.tabs';
	import { buildSidebarMenu } from './sidebar.menus';

	let { showSidebar = $bindable(), userId, tenantSettings, userRole } = $props();

	let activeTab = $state('');
	const navData = buildSidebarMenu(userId, tenantSettings, userRole);
	console.log('Tenant Setting', tenantSettings);

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
						class="sidebar-item items-center {activeTab === 'Analytics'
							? 'variant-soft-secondary'
							: ''}"
						onclick={() => (activeTab = 'Analytics')}
					>
						<Icon icon={navParent.icon} class="mx-1 text-2xl" />
						<span class="sidebar-text">{navParent.title}</span>
					</a>
				{:else if navParent.title === 'Appointment Follow-Up'}
					<a
						href={`/users/${userId}/appointment-followup/summary-uploads`}
						class="sidebar-item items-center {activeTab === 'Appointment'
							? 'variant-soft-secondary'
							: ''}"
						onclick={() => (activeTab = 'Appointment')}
					>
						<Icon icon={navParent.icon} class="mx-1 text-2xl" />
						<span class="sidebar-text">{navParent.title}</span>
					</a>
				{:else if navParent.title === 'Home'}
					<a
						href={navParent.link}
						class="sidebar-item items-center {activeTab === 'Home' ? 'variant-soft-secondary' : ''}"
						onclick={() => (activeTab = 'Home')}
					>
						<Icon icon={navParent.icon} class="mx-1 text-2xl" />
						<span class="sidebar-text">{navParent.title}</span>
					</a>
				{:else}
					<button
						class="sidebar-item flex w-full items-center justify-between"
						onclick={() => toggleDropdown(navParent.title)}
					>
						<div class="flex items-center gap-2">
							<Icon icon={navParent.icon} class="text-2xl" />
							<span class="sidebar-text">{navParent.title}</span>
						</div>

						<!-- Right-aligned dropdown icon with rotation -->
						<span
							class="transition-transform duration-300"
							class:rotate-180={openTab === navParent.title}
						>
							<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
						</span>
					</button>
				{/if}

				{#if openTab == navParent.title && navParent.title !== 'Analytics' && navParent.title !== 'Home'}
					<div class="mx-4">
						<nav class="space-y-1">
							{#each navParent.childNav as navItem}
								{#if navItem.link}
									<a
										href={navItem.link}
										class="sidebar-item items-center"
										class:variant-soft-secondary={page.url.pathname === navItem.link}
										onclick={() => (activeTab = navItem.title)}
									>
										{#if navItem.icon.endsWith('.png')}
											<img src={navItem.icon} alt="" class="h-6 w-6 invert dark:filter-none" />
										{:else}
											<Icon
												icon={page.url.pathname === navItem.link
													? navItem.icon.replace('-outline', '')
													: navItem.icon}
												class="mx-1 text-2xl"
											/>
										{/if}
										<span class="sidebar-text">{navItem.title}</span>
									</a>
								{:else if navItem.childNav}
									<div>
										<Icon icon={navItem.icon} class="text-2xl" />
									</div>
									<div>{navItem.title}</div>
									<div>
										<nav class="list-nav space-y-1">
											{#each navItem.childNav as childItem}
												<a
													href={childItem.link}
													class:!variant-soft-secondary={page.url.pathname === childItem.link}
													onclick={() => (activeTab = childItem.title)}
												>
													<Icon
														icon={page.url.pathname === childItem.link
															? childItem.icon.replace('-outline', '')
															: childItem.icon}
														class="text-2xl"
													/>
													<span>{childItem.title}</span>
												</a>
											{/each}
										</nav>
									</div>
								{/if}
							{/each}
						</nav>
					</div>
				{/if}
			{/each}
		</ul>
	</div>
</div>
