<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import type { PageServerData } from './$types';

	//////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let followupSettings = data.settings;
	let tenantId = data.tenantId;
	const userId = page.params.userId;
	let source = $state(followupSettings?.Source);
	const setRemindersRoute = `/users/${userId}/appointment-followup/set-reminders`;
	const breadCrumbs = [{ name: 'Set Reminders', path: setRemindersRoute }];
</script>

{#if source === 'None' || !followupSettings}
	<div class="flex min-h-[60vh] items-center justify-center px-6">
		<div class="w-full max-w-lg rounded-xl border border-[var(--color-outline)] bg-[var(--color-primary)] p-8 text-center shadow-sm">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
				<Icon icon="material-symbols:settings-alert-outline" class="h-8 w-8 text-amber-600 dark:text-amber-400" />
			</div>
			<h2 class="mb-2 text-xl font-semibold text-[var(--color-info)]">Follow-up Settings Not Configured</h2>
			<p class="mb-6 text-sm text-[var(--color-info)] opacity-70">
				The appointment follow-up feature requires configuration before use. Please set up the follow-up settings to start managing appointment reminders and schedules.
			</p>
			<Button
				href={`/users/${userId}/tenants/${tenantId}/settings/followup-setting`}
				text="Configure Follow-up Settings"
				size="md"
				variant="primary"
				className="w-full"
			/>
		</div>
	</div>
{:else}
	<BreadCrumbs crumbs={breadCrumbs} />
	<div class="px-6 py-4">
		<p class="text-[var(--color-info)]">Set Reminders page content goes here.</p>
	</div>
{/if}
