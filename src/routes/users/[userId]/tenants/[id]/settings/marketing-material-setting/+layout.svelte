<script>
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';

	let { children } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;
</script>

<div class="flex w-full flex-col px-5">
	<div class="mb-6 flex items-center gap-3">
		<Icon icon="material-symbols:campaign-outline" class="h-8 w-8 text-primary" />
		<h1 class="text-2xl font-bold text-gray-900">Marketing Material Settings</h1>
	</div>
</div>

{@render children()}
