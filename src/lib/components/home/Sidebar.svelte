<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { sidebarMenu, type TabDefinition } from './navigation.tabs';


	const sidebarTabs: TabDefinition[] = sidebarMenu();

	// let homeLink = `/users/${userId}/careplan`;
</script>

<div class="hidden sm:flex">
	<div class="sidebar">
		<ul class="sidebar-list">
			{#each sidebarTabs as tab}
				<li>
					<a href="#" class="sidebar-item" class:!bg-active={page.url.pathname.startsWith(tab.path)}>
						<Icon icon={tab.icon} class="iconsize" />
						<span class="sidebar-text">{tab.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>
