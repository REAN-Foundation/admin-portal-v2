<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import { commonUISettings } from './common-setting.types';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { CommonSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import SettingsPageWrapper from '../components/SettingsPageWrapper.svelte';
	import SettingsSection from '../components/SettingsSection.svelte';
	import SettingsToggleCard from '../components/SettingsToggleCard.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	let commonSetting = $state(data.commonSettings);
	let isSubmitting = $state(false);
	let errors: Record<string, string> = $state({});
	let disabled = $state(false);

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		try {
			isSubmitting = true;
			const validationResult = CommonSettingsSchema.safeParse(commonSetting);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				isSubmitting = false;
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Common`, {
				method: 'PUT',
				body: JSON.stringify(commonSetting),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
			} else if (response.Errors) {
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

	// Helper function to get setting metadata
	function getSettingMeta(group: string, key: string) {
		return (
			commonUISettings?.[group]?.[key] || {
				Name: key,
				Path: 'mdi:cog-outline',
				Description: ''
			}
		);
	}

	// Get groups to display (excluding UserInterfaces and General)
	const settingGroups = $derived(
		Object.entries(commonSetting || {}).filter(
			([groupName]) => groupName !== 'UserInterfaces' && groupName !== 'General'
		)
	);
</script>

<SettingsPageWrapper
	title="Common Settings"
	description="Configure clinical, wellness, and general tenant features"
	icon="material-symbols:layers-outline"
	{disabled}
	onSubmit={handleSubmit}
	backLink={settingsRoute}
	{isSubmitting}
>
	<!-- Settings Groups -->
	<div class="space-y-4">
		{#each settingGroups as [groupName, groupItems]}
			{@const groupMeta = commonUISettings[groupName]}
			<SettingsSection
				title={groupMeta?.Name || groupName}
				description={groupMeta?.Description || `Settings under ${groupName}`}
				icon={groupMeta?.Path || 'mdi:folder-outline'}
				collapsible={true}
				defaultOpen={false}
			>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each Object.entries(groupItems) as [key, value]}
						{@const meta = getSettingMeta(groupName, key)}
						<SettingsToggleCard
							name={meta?.Name || key}
							description={meta?.Description || ''}
							icon={meta?.Path || 'mdi:cog-outline'}
							bind:checked={commonSetting[groupName][key].Enabled}
							disabled={disabled}
						/>
					{/each}
				</div>
			</SettingsSection>
		{/each}
	</div>

	<!-- Info Banner -->
	<div class="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
		<div class="flex items-start gap-3">
			<Icon icon="mdi:information-outline" class="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
			<div>
				<p class="text-sm text-blue-800">
					<strong>Note:</strong> Changes will only take effect after you save. Toggle the features you want to enable or disable for this tenant.
				</p>
			</div>
		</div>
	</div>
</SettingsPageWrapper>
