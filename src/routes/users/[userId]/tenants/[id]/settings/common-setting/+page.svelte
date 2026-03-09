<script lang="ts">
	import ExpandableSettings from './tenant-setting.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { commonUISettings } from './common-setting.types';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { CommonSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';
	import SettingsFooter from '$lib/components/settings/settings-footer.svelte';
	import { tenantSettingsStore } from '$lib/store/general.store';
	import { get } from 'svelte/store';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	let commonSetting = $state(data.commonSettings);
	let errors: Record<string, string> = $state({});

	let isEditing = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');

	let hasUnsavedChanges = $derived(
		isEditing && JSON.stringify($state.snapshot(commonSetting)) !== originalSnapshot
	);

	beforeNavigate((navigation) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	const handleToggleEdit = () => {
		isEditing = true;
		originalSnapshot = JSON.stringify($state.snapshot(commonSetting));
		addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
	};

	const handleCancelEdit = () => {
		commonSetting = JSON.parse(originalSnapshot);
		isEditing = false;
		errors = {};
		addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		try {
			if (!isEditing) {
				addToast({
					message: 'Nothing to edit !',
					type: 'warning',
					timeout: 3000
				});
				return;
			}

			isSubmitting = true;

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
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				// Update tenant settings store so sidebar reacts immediately
				const currentSettings = get(tenantSettingsStore);
				if (currentSettings) {
					tenantSettingsStore.set({ ...currentSettings, Common: $state.snapshot(commonSetting) });
				}
				toastMessage(response);
				isEditing = false;
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
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="px-5 py-4">
	<div class=" mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => handleSubmit(event)}>
			<SettingsPageHeader
				title="Common Settings"
				description="Configure general tenant settings and feature toggles."
				bind:isEditing
				{hasUnsavedChanges}
				closeHref={settingsRoute}
				onToggleEdit={handleToggleEdit}
				onCancelEdit={handleCancelEdit}
			/>
			<div class="flex flex-col space-y-4 px-4 py-4">
				<ExpandableSettings groupedSettings={commonUISettings} bind:commonSetting edit={!isEditing} />
			</div>

			<SettingsFooter {isEditing} {isSubmitting} onCancel={handleCancelEdit} />
		</form>
	</div>
</div>
