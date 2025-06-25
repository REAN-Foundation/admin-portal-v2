<script lang="ts">
	import ExpandableSettings from '$lib/components/tenant-setting.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import { commonUISettings } from './common-setting.types';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { CommonSettingsSchema } from '$lib/validation/tenant.settings.schema';

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
                    type: 'warning',
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
        disabled = !disabled;
	};
</script>

<div class="px-5 py-4">
	<div class=" mx-auto my-6 border !border-zinc-200">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div class="flex items-center justify-between !rounded-b-none border bg-[#F2F3F5] px-5 py-6">
				<h1 class=" text-xl">Common Settings</h1>
				<div class="flex items-center gap-2 text-end">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" />
						<!-- <span>{edit ? 'Edit' : 'Save'}</span> -->
					</button>
					<a
						href={tenantRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] !border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
					>
						<Icon icon="material-symbols:close-rounded" class=" h-5" />
					</a>
				</div>
			</div>
			<div class="flex flex-col space-y-4 px-4 py-4">
				<ExpandableSettings groupedSettings={commonUISettings} bind:commonSetting edit={disabled} />
			</div>
			<hr class="border-t border-[#F2F3F5]" />

			<div class="button-container my-4">
				{#await promise}
					<button type="submit" class="table-btn variant-soft-secondary" disabled>
						Submiting
					</button>
				{:then data}
					<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
				{/await}
			</div>
		</form>
	</div>
</div>
