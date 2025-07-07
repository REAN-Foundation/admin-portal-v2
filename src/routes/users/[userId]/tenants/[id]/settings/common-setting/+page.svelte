<script lang="ts">
	import ExpandableSettings from './tenant-setting.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import { commonUISettings } from './common-setting.types';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { CommonSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;

	let commonSetting = $state(data.commonSettings);
	let promise = $state();
	let errors: Record<string, string> = $state({});
	let disabled = $state(true);
	let edit = $derived(disabled);

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		try {
			console.log('disabled', disabled);
			if (disabled) {
				addToast({
					message: 'Nothing to edit !',
					type: 'info',
					timeout: 3000
				});
				return;
			}
			const validationResult = CommonSettingsSchema.safeParse(commonSetting);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Common`, {
				method: 'PUT',
				body: JSON.stringify(commonSetting),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response@@', response);
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				disabled = true;
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.log('error', error);
			toastMessage();
		}
	};

	// let edit = $derived(disabled);

	const handleEditClick = async () => {
		if (disabled) {
			addToast({
				message: 'Edit mode enabled.',
				type: 'info',
				timeout: 3000
			});
			disabled = false;
		} else {
			addToast({
				message: 'Edit mode disabled.',
				type: 'info',
				timeout: 3000
			});
			disabled = true;
		}
		// disabled = !disabled;
	};
</script>

<div class="px-5 py-4">
	<div class=" mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class=" text-xl text-[var(--color-info)]">Common Settings</h1>
				<div class="flex items-center gap-2 text-end">
					<Button
						variant="icon"
						icon="material-symbols:edit-outline"
						iconSize="sm"
						onclick={handleEditClick}
						className="table-btn variant-filled-secondary gap-1"
					/>
					<a href={tenantRoute} class="cancel-btn">
						<Icon icon="material-symbols:close-rounded" />
					</a>
				</div>
			</div>
			<div class="flex flex-col space-y-4 px-4 py-4">
				<ExpandableSettings groupedSettings={commonUISettings} bind:commonSetting edit={disabled} />
			</div>

			<hr class="border-[0.5px] border-t border-[var(--color-outline)]" />

			<div class="btn-container mr-4 mb-4">
				{#await promise}
					<Button type="submit" text="Submitting" variant="primary" disabled={true} />
				{:then data}
					<Button type="submit" text="Submit" variant="primary" />
				{/await}
			</div>
		</form>
	</div>
</div>
