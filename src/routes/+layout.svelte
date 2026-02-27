<script lang="ts">
	// import { initFlash } from 'sveltekit-flash-message';
	// import '../app.css';
	// import { page } from '$app/state';
	// import { beforeNavigate } from '$app/navigation';
	// import toast, { Toaster } from 'svelte-french-toast';
	import '../app.css';
	import { addToast } from '$lib/components/toast/toast.store';
	import Toasts from '$lib/components/toast/toasts.svelte';
	import { page } from '$app/state';
	import { getFlash } from 'sveltekit-flash-message';
	import { getSystemName } from '$lib/themes/theme.selector';

	const systemName = getSystemName();
	let fullTitle = $derived(page.data.title ? `${systemName} - ${page.data.title}` : systemName);

	// export let children: () => any; 
	// const flash = initFlash(page);
	// // initializeStores();
	// beforeNavigate((nav) => {
	// 	if ($flash && nav.from?.url.toString() != nav.to?.url.toString()) {
	// 		$flash = undefined;
	// 	}
	// });

	// flash.subscribe(($flash) => {
	// 	if (!$flash) return;

	// 	toast($flash.message, {
	// 		icon: $flash.type == 'success' ? '✅' : '❌'
	// 	});

	// 	flash.set(undefined);
	// });

	let { children } = $props();
	const flash = getFlash(page);

	flash.subscribe(($flash) => {
		if (!$flash) return;
		addToast({
			type: $flash.type || 'info',
			message: $flash.message,
			dismissible: true,
			timeout: 3000
		});
		flash.set(undefined);
	});

</script>

<!-- <Toaster/> -->
<Toasts />

<svelte:head>
	<title>{fullTitle}</title>
</svelte:head>

{@render children()}
