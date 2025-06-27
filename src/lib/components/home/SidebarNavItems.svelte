<script>
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import SidebarNavItems from './SidebarNavItems.svelte';

	let { navItem, page, activeTab = $bindable() } = $props();
	let openTab = $state(null);

	function toggleDropdown(tabName) {
		openTab = openTab === tabName ? null : tabName;
	}

	onMount(() => {
		if (page.url.pathname === navItem.link) {
			activeTab = navItem.title;
		}
		if (navItem.link && page.url.pathname.startsWith(navItem.link)) {
			openTab = navItem.title;
		}
	});
</script>

{#if navItem.childNav && navItem.childNav.length > 0}
	<button
		class="sidebar-item flex w-full items-center justify-between"
		onclick={() => toggleDropdown(navItem.title)}
	>
		{#if navItem.link}
			<a
				href={navItem.link}
				class="sidebar-item flex items-center"
				class:variant-soft-secondary={activeTab === navItem.title}
				onclick={() => (activeTab = navItem.title)}
			>
				{#if navItem.icon?.endsWith('.png')}
					<img src={navItem.icon} alt="" class="h-6 w-6 invert dark:filter-none" />
				{:else}
					<Icon
						icon={activeTab === navItem.title ? navItem.icon.replace('-outline', '') : navItem.icon}
						class="text-2xl"
					/>
				{/if}

				<span class="sidebar-text">{navItem.title}</span>

				<span
					class="transition-transform duration-300"
					class:rotate-180={openTab === navItem.title}
				>
					<Icon icon="icon-park-outline:down" width="10" height="10" class="h-4 w-4" />
				</span>
			</a>
		{:else}
			<div class="flex items-center gap-2">
				<Icon icon={navItem.icon} class="text-2xl" />
				<span class="sidebar-text">{navItem.title}</span>
			</div>
			<span class="transition-transform duration-300" class:rotate-180={openTab === navItem.title}>
				<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
			</span>
		{/if}
	</button>

	{#if openTab === navItem.title}
		<div class="mt-1 ml-4 space-y-1">
			{#each navItem.childNav as childItem}
				<SidebarNavItems navItem={childItem} {page} bind:activeTab />
			{/each}
		</div>
	{/if}
{:else if navItem.link}
	<a
		href={navItem.link}
		class="sidebar-item flex items-center gap-1"
		class:variant-soft-secondary={activeTab === navItem.title}
		onclick={() => (activeTab = navItem.title)}
	>
		{#if navItem.icon?.endsWith('.png')}
			<img src={navItem.icon} alt="" class="h-6 w-6 invert dark:filter-none" />
		{:else}
			<Icon
				icon={activeTab === navItem.title ? navItem.icon.replace('-outline', '') : navItem.icon}
				class="h-5 w-5"
			/>
		{/if}

		<span class="sidebar-text">{navItem.title}</span>
	</a>
{/if}
