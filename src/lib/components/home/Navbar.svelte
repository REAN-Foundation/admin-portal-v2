<script lang="ts">
	import Icon from '@iconify/svelte';
	import ConfirmModal from '../modal/confirm.modal.svelte';
	import { onMount } from 'svelte';
	import Image from '$lib/components/image.svelte';
	import { getPublicLogoImageSource } from '$lib/themes/theme.selector';
	import Sidebar from './Sidebar.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import Button from '$lib/components/button/button.svelte';


	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { logout, userId, imageUrl, userName, tenantSettings, userRole, email } = $props();

	let showConfirmDelete_ = false;
	let showConfirmLogout_ = $state(false);
	const logoutMessage_ = 'Are you sure you want to sign out?';
	let logoutMessage = $state(logoutMessage_);
	let showUserMenu = $state(false);
	let showThemeMenu = $state(false);
	const themeModes = ['Light', 'Dark'];
	const themeOptions = [
		{ name: 'Blue', color: 'rgba(0, 150, 255, 0.1)', borderColor: 'rgba(0, 150, 255, 1)' },
		{ name: 'Mint', color: 'rgba(78, 197, 90, 0.1)', borderColor: 'rgba(78, 197, 90, 1)' },
		{ name: 'Grey', color: 'rgba(128, 128, 128, 0.1)', borderColor: 'rgba(128, 128, 128, 1)' },
		{ name: 'Teal', color: 'rgba(50, 153, 153, 0.1)', borderColor: 'rgba(50, 153, 153, 1)' },
		{ name: 'Gold', color: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 1)' }
	];
	let selectedMode = $state('Light');
	let selectedOption = $state('Blue');
	let showSidebar = $state(false);
	const tenantId = tenantSettings.TenantId;
	const settingRoute = `/users/${userId}/tenants/${tenantId}/settings`
	const normalizedRoleName = (userRole ?? '').trim().toLowerCase();
	const canViewSettings = normalizedRoleName === 'system admin' || normalizedRoleName === 'tenant admin';

	const userMenuItems = [
		{
			label: 'User Profile',
			icon: 'material-symbols:person-outline',
			href: `/users/${userId}/my-profile`
		},
		{ label: 'Themes', icon: 'mdi:palette-outline' },
		{ label: 'Sign Out', icon: 'material-symbols:logout', action: openLogoutModal },
		{
			label: 'Change Password',
			icon: 'material-symbols:lock-outline',
			href: `/users/${userId}/change-password`
		}
	];

	const logoImageSource = getPublicLogoImageSource();

	const handleModeChange = (theme: string) => {
		selectedMode = theme;
		localStorage.setItem('themeMode', theme);
		applyThemeOption();
	};

	const handleOptionChange = (option: string) => {
		selectedOption = option;
		localStorage.setItem('themeOption', option);
		applyThemeOption();
	};

	const applyThemeOption = () => {
		const theme = selectedMode.toLowerCase();
		const option = selectedOption.toLowerCase();
		document.documentElement.setAttribute('data-theme', theme);
		document.documentElement.setAttribute('data-theme-option', option);
		const themeOption = themeOptions.find((opt) => opt.name.toLowerCase() === option);
		if (themeOption) {
			document.documentElement.style.setProperty('--theme-border-color', themeOption.borderColor);
		}
	};

	onMount(() => {
		const storedMode = localStorage.getItem('themeMode');
		const storedOption = localStorage.getItem('themeOption');

		if (storedMode) {
			selectedMode = storedMode;
			document.documentElement.setAttribute('data-theme', storedMode.toLowerCase());
		}

		if (storedOption) {
			selectedOption = storedOption;
		}

		applyThemeOption();
	});

	function openLogoutModal() {
		showConfirmLogout_ = true;
	}

	function handleLogoutConfirm() {
		// selectedMode = 'Light';
		// selectedOption = '';
		// localStorage.setItem('themeMode', 'Light');
		// applyThemeOption();
		if (logout) logout();
		localStorage.removeItem('themeOption');
		showConfirmLogout_ = false;
	}

	function handleCancel() {
		showConfirmDelete_ = false;
		showConfirmLogout_ = false;
	}

	const closeThemeMenu = () => {
		showThemeMenu = false;
	};

	const userInitials = userName
		.split(' ')
		.map((word: any[]) => word[0])
		.join('');
</script>

<header class="navbar">
	<div class="flex h-14 w-full items-center justify-between sm:px-4">
		<div class="flex items-center">
			<img src={logoImageSource} alt="Logo" class="px-4" width="100" height="100" />
		</div>
		<div class="relative ml-auto flex items-center">
			<!-- <Button
			href={settingRoute}
			variant="icon"
			icon="material-symbols:settings-outline"
			iconSize="xl"
			tooltip="Settings"
			/> -->


		{#if canViewSettings}
			<a
				href={settingRoute}
				data-sveltekit-preload-data
				class="btn-icon rounded mr-4"
				title="Settings"
			>
				<Icon icon="heroicons:cog-6-tooth" class="!text-3xl" />
			</a>
		{/if}
			<button
				onclick={() => (showSidebar = !showSidebar)}
				class=" btn-icon mx-4 rounded p-1 text-white hover:bg-white/10 md:hidden"
			>
				<Icon icon="material-symbols:menu-rounded" class="text !text-3xl " />
			</button>
			<button
				class=" user-profile-btn"
				aria-label="Toggle user menu"
				onclick={() => {
					showUserMenu = !showUserMenu;
					if (showUserMenu) showThemeMenu = false;
				}}
			>
				{#if imageUrl}
					<Image cls="initial-icon" source={imageUrl} w="24" h="24" />
				{:else}
					<span class="initial-icon">{userInitials}</span>
				{/if}
			</button>

			{#if showUserMenu}
				<div
					class="user-menu"
					use:clickOutside={() => {
						showUserMenu = false;
					}}
				>
					<button class="user-menu-close" onclick={() => (showUserMenu = false)}>
						<Icon icon="ant-design:close-outlined" class="h-5 w-5" />
					</button>
					<div class="user-name">
						{#if imageUrl}
							<Image cls="initial-icon" source={imageUrl} w="24" h="24" />
						{:else}
							<div class="initial-icon">{userInitials}</div>
						{/if}
						<span>{userName}</span>
					</div>
					<hr class="user-menu-divider" />

					{#each userMenuItems as item}
						{#if item.label === 'Themes'}
							<button
								class="user-menu-item"
								onclick={() => {
									showUserMenu = false;
									showThemeMenu = !showThemeMenu;
								}}
							>
								<Icon icon={item.icon} class="menu-icon" />
								<span>{item.label}</span>
							</button>
						{:else if item.label === 'Sign Out'}
							<button
								class="user-menu-item"
								onclick={() => {
									showUserMenu = false;
									item.action();
								}}
							>
								<Icon icon={item.icon} class="menu-icon" />
								<span>{item.label}</span>
							</button>
							<!-- <hr class="user-menu-divider" /> -->
						{:else}
							<a href={item.href} class="user-menu-item" onclick={() => (showUserMenu = false)}>
								<Icon icon={item.icon} class="menu-icon" />
								<span>{item.label}</span>
							</a>
						{/if}
					{/each}
				</div>
			{/if}

			{#if showThemeMenu}
				<div
					class="theme-menu"
					use:clickOutside={() => {
						showThemeMenu = false;
					}}
				>
					<button class="themes-close-button" onclick={closeThemeMenu}>
						<Icon icon="ant-design:close-outlined" class="h-5 w-5" />
					</button>
					<div>
						<p class="para">Appearance</p>
						<div class="flex items-center space-x-4">
							{#each themeModes as theme}
								<div class="flex flex-col items-center">
									<button
										class={`relative  rounded-md border-2 px-8 py-4 ${
											theme === selectedMode
												? 'border-[var(--theme-border-color)]'
												: 'border-transparent'
										}`}
										style={`background-color: ${theme === 'Light' ? '#ffffff' : '#1a1a1a'}; color: ${
											theme === 'Light' ? '#000000' : '#ffffff'
										};`}
										onclick={() => handleModeChange(theme)}
									>
										<!-- Text inside the button -->
										<span class="flex h-full w-full items-center justify-center">
											{theme}
										</span>
									</button>
								</div>
							{/each}
						</div>
					</div>
					<!-- <hr class="theme-divider" /> -->

					<div>
						<p class="para">Themes</p>
						<div class="grid grid-cols-3 gap-2 sm:gap-4">
							{#each themeOptions as { name, color, borderColor }}
								<button
									class="theme-option"
									class:selected={selectedOption === name}
									style="background-color: {color}; border: 1px solid {selectedOption === name
										? borderColor
										: 'grey'};"
									onclick={() => handleOptionChange(name)}
								>
									<div
										class="flex flex-shrink-0 items-center justify-center rounded-full border"
										style="background-color: {borderColor}; width: 1rem; height: 1rem; sm:width: 1.5rem; sm:height: 1.5rem;"
									>
										{#if selectedOption === name}
											<Icon icon="mdi:check" class="text-info h-2 w-2 sm:h-3 sm:w-3" />
										{/if}
									</div>
									<div class="text-info ml-1 text-[var(--color-info)] sm:ml-2">{name}</div>
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<Sidebar bind:showSidebar {userId} {tenantSettings} {userRole} />

	<ConfirmModal
		show={showConfirmLogout_}
		title="Sign Out"
		message={logoutMessage}
		close={handleCancel}
		confirm={handleLogoutConfirm}
		confirmButtonText="Sign Out"
	/>
</header>
