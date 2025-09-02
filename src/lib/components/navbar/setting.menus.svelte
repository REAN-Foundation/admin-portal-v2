<script>
  // import { goto } from '$app/navigation';
	// import Icon from '@iconify/svelte';
	// import { LightSwitch } from '@skeletonlabs/skeleton';
	// import { createEventDispatcher } from 'svelte';

	// export let userId;

	// const dispatch = createEventDispatcher();

	// const gotoLogout = async () => {
	// 	dispatch('logout');
	// };

	// async function changePassword() {
	// 	dispatch('click');
	// 	await goto(`/users/${userId}/change-password`);
	// }

	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
  import Image from '$lib/components/image.svelte';

  //////////////////////////////////////////////////////////

  const expandedMenus = writable({});

  export let userId = undefined;
  export let username = undefined;
  export let email = undefined;
  export let imageUrl = undefined
  $: avatarSource = imageUrl;
  
	const dispatch = createEventDispatcher();
	async function changePassword() {
		dispatch('click');
		await goto(`/users/${userId}/change-password`);
	}

	const gotoLogout = async () => {
		dispatch('logout');
	};

  async function myProfile() {
		dispatch('click');
		await goto(`/users/${userId}/my-profile`);
	}

  let menuItems = [
    { name: 'My Profile', link: '', action: () => myProfile(), icon:'material-symbols:person-outline'},
    { name: 'Change Password', link: '', action: () => changePassword(), icon:'material-symbols:lock-outline'},
    { name: 'Logout', link: '',action: () => gotoLogout(), icon:'material-symbols:logout'}
    // {
    //   name: 'Authorization and security', subMenu: [
    //     { name: 'Change Password', link: '', action: () => changePassword() },
    //   ]
    // },
    // {
    //   name: 'Miscellaneous', subMenu: [
    //     { name: 'Logout', link: '',action: () => gotoLogout() },
    //   ]
    // }
  ];

  function toggleMenu(name) {
    expandedMenus.update(state => {
      state[name] = !state[name];
      return state;
    });
  }
	
</script>

<div class="w-72 h-full">
  <!-- <div class="px-2 py-2">
    <div class="flex items-center gap-2">
      <img
        class="object-cover rounded-full h-16 w-16"
        src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
        alt="avatar"
      />
      <div class="flex-1">
        <h3 class="text-lg font-medium truncate">{username}</h3>
        <p class="text-sm text-gray-500 truncate">{email}</p>
      </div>
      <button class="ml-auto btn variant-soft-error p-2" on:click>
        <Icon icon="material-symbols:close-rounded" class="text-xl" />
      </button>
    </div>
  </div> -->
  <!-- <div class="px-2 py-2">
    <div class="flex items-center gap-2">
      <img
        class="object-cover rounded-full h-16 w-16"
        src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
        alt="avatar"
      />
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-medium truncate">{username}</h3>
        <p class="text-sm text-gray-500 truncate">{email}</p>
      </div>
      <button class="ml-auto btn variant-soft-error p-2" on:click>
        <Icon icon="material-symbols:close-rounded" class="text-xl" />
      </button>
      </div>
    </div> -->
    <div class="relative px-2 py-2">
      <button class="absolute top-2 right-2 btn variant-soft-error p-2" on:click>
        <Icon icon="material-symbols:close-rounded" class="text-xl" />
      </button>
      <div class="flex flex-col items-center gap-2">
        <div class="relative inline-block bg-primary-200 rounded-full h-16 w-16">
          <!-- <img
            class="object-cover rounded-full h-16 w-16"
            src="/user.png"
            alt="avatar"
          /> -->
      {#if avatarSource}
				<Image cls="flex h-16 w-16 rounded-full" source={avatarSource} w=24 h=24 />
				<!-- <img class="flex h-24 w-24 rounded-full" src={avatarSource} alt="d" /> -->
			{:else}
        <img
          class="object-cover rounded-full h-16 w-16"
          src="/user.png"
          alt="avatar"
        />
		  {/if}
        </div>
        <div class="text-center w-64">
          <h3 class="text-lg font-medium truncate">{username}</h3>
          <p class="text-sm text-gray-500 truncate">{email ? email: ''}</p>
        </div>
      </div>
    </div>
  <div class="border-t border-primary-200 mt-2"></div>
  <ul class="py-4 space-y-2">
    {#each menuItems as item}
      <li>
        {#if item.subMenu}
          <div>
            <button on:click={() => toggleMenu(item.name)} class="w-full text-left px-4 py-2 hover:bg-primary-100 rounded-md">
              {item.name}
            </button>
            <!-- <button on:click={() => toggleMenu(item.name)} class="w-full text-left flex items-center justify-between">
              {item.name}
              <Icon icon={$expandedMenus[item.name] ? "material-symbols:expand-less-rounded" : "material-symbols:expand-more-rounded"} class="text-xl" />
            </button> -->
            {#if $expandedMenus[item.name]}
              <ul class="ml-4 mt-2 space-y-1">
                {#each item.subMenu as subItem}
                  <li>
                    {#if subItem.action}
                      <button on:click={subItem.action} class="w-full text-left px-4 py-2 hover:bg-primary-100 rounded-md">
                        {subItem.name}
                      </button>
                    {:else}
                      <a href={subItem.link} class="block px-4 py-2 hover:bg-primary-100 rounded-md">
                        {subItem.name}
                      </a>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {:else}
          <!-- <a href={item.link} class="block px-4 py-2 hover:bg-primary-100 rounded-md">
            {item.name}
          </a> -->
         
          <button on:click={item.action} class="w-full text-left px-4 py-2 hover:bg-primary-100 rounded-md">
            <div class="flex gap-4 items-start justify-start">
              <Icon icon={item.icon} class='text-xl'/> 
              {item.name}
            </div>
          </button>
          
        {/if}
      </li>
    {/each}
  </ul>
</div>
<!-- <div class="flex justify-between">
	<button on:click={async () => await gotoLogout()} class="btn p-2 variant-soft-error">
		<Icon icon="material-symbols:logout-rounded" />
		<span class="text-xs">Sign Out</span>
	</button>

	<button class="btn variant-soft-error p-2" on:click>
		<Icon icon="material-symbols:close-rounded" class="text-xl" />
	</button>
</div>

<div class="flex items-center gap-2">
	<img
		class="object-cover rounded-full h-16 w-16"
		src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
		alt="avatar"
	/>
	<div>
		<h3 class="!text-lg font-medium">John Doe</h3>
		<p class="!text-sm">user@gmail.com</p>
		<p class="!text-sm">UserId:12345</p>
		<div class="flex gap-2 text-xs">
			<a href="/">My Accounts</a>
			<a href="/">My Portals</a>
		</div>
	</div>
</div>

<hr class="border-surface-200 dark:border-surface-700" />

<div class="flex items-center justify-between gap-2">
	<h3 class="!text-lg">Themes</h3>
	<LightSwitch rounded="rounded-full" height="h-6" width="w-12" />
</div>

<div class="mt-4">
	<button class="btn variant-filled-secondary" on:click={changePassword}>
			Change Password
	</button>
</div> -->

