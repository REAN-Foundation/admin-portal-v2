<script lang="ts">
	import { initFlash } from 'sveltekit-flash-message';
	import '../app.css';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import toast, { Toaster } from 'svelte-french-toast';

	export let children: () => any; 


	const flash = initFlash(page);
	// initializeStores();
	beforeNavigate((nav) => {
		if ($flash && nav.from?.url.toString() != nav.to?.url.toString()) {
			$flash = undefined;
		}
	});

	flash.subscribe(($flash) => {
		if (!$flash) return;

		toast($flash.message, {
			icon: $flash.type == 'success' ? '✅' : '❌'
		});

		flash.set(undefined);
	});
</script>

<Toaster/>


{@render children()} 
