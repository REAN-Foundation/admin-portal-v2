<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { UserInterfacesSchema, FollowupSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { fade, scale } from 'svelte/transition';
	import type { ReminderTrigger } from '$lib/types/tenant.settings.types';

	/////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let commonSettings = $state(data.commonSettings);
	let errors: Record<string, string> = $state({});
	let followupErrors: any = $state({});

	let disabled = $state(true);
	let promise = $state();
	let followupPromise = $state();

	const userId = page.params.userId;
	const tenantId = page.params.id;

	// Modal state
	let activeModal: string | null = $state(null);
	let modalEditMode = $state(false);

	// Follow-up settings state
	let followupOpenTab: string | null = $state(null);
	let showReminderModal = $state(false);
	let editingIndex: number | null = null;
	let jsonError = $state('');

	let newReminder: ReminderTrigger = $state({
		Type: 'PreviousDay',
		OffsetValue: undefined,
		OffsetUnit: 'hours',
		TimeOfDay: ''
	});

	// Initialize follow-up settings model
	let followUpSettingUpdateModel = $state({
		Source: data.followupSettings?.Source || 'None',
		FileUploadSettings: {
			FileColumnFormat: data.followupSettings?.FileUploadSettings?.FileColumnFormat
				? JSON.stringify(JSON.parse(data.followupSettings?.FileUploadSettings?.FileColumnFormat), null, 2)
				: '',
			FileType: data.followupSettings?.FileUploadSettings?.FileType || '',
			ReminderSchedule: data.followupSettings?.FileUploadSettings?.ReminderSchedule || []
		},
		ApiIntegrationSettings: {
			Auth: {
				Method: data.followupSettings?.ApiIntegrationSettings?.Auth?.Method || '',
				Url: data.followupSettings?.ApiIntegrationSettings?.Auth?.Url || '',
				Body: data.followupSettings?.ApiIntegrationSettings?.Auth?.Body || '',
				QueryParams: data.followupSettings?.ApiIntegrationSettings?.Auth?.QueryParams || {},
				Headers: data.followupSettings?.ApiIntegrationSettings?.Auth?.Headers || {},
				TokenPath: data.followupSettings?.ApiIntegrationSettings?.Auth?.TokenPath || '',
				ResponseType: data.followupSettings?.ApiIntegrationSettings?.Auth?.ResponseType || '',
				TokenInjection: {
					Location: data.followupSettings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Location || '',
					Key: data.followupSettings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Key || '',
					Prefix: data.followupSettings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Prefix || ''
				}
			},
			Fetch: {
				Method: data.followupSettings?.ApiIntegrationSettings?.Fetch?.Method || '',
				Url: data.followupSettings?.ApiIntegrationSettings?.Fetch?.Url || '',
				QueryParams: data.followupSettings?.ApiIntegrationSettings?.Fetch?.QueryParams || {},
				Body: data.followupSettings?.ApiIntegrationSettings?.Fetch?.Body || '',
				Headers: data.followupSettings?.ApiIntegrationSettings?.Fetch?.Headers || {},
				ResponseType: data.followupSettings?.ApiIntegrationSettings?.Fetch?.ResponseType || '',
				ResponseField: data.followupSettings?.ApiIntegrationSettings?.Fetch?.ResponseField || ''
			},
			ReminderSchedule: data.followupSettings?.ApiIntegrationSettings?.ReminderSchedule || [],
			ScheduleFrequency: data.followupSettings?.ApiIntegrationSettings?.ScheduleFrequency || ''
		}
	});

	// Key-value pair state for query params and headers
	let newAuthQueryKey = $state('');
	let newAuthQueryValue = $state('');
	let newAuthHeaderKey = $state('');
	let newAuthHeaderValue = $state('');
	let newFetchQueryKey = $state('');
	let newFetchQueryValue = $state('');
	let newFetchHeaderKey = $state('');
	let newFetchHeaderValue = $state('');

	// Integration items configuration
	const integrationItems = [
		{
			key: 'ChatBot',
			name: 'Chatbot',
			icon: 'tabler:message-chatbot',
			description: 'AI-powered chatbot for automated patient interaction.',
			color: 'blue',
			configurable: true,
			configPath: 'chatbot-setting'
		},
		{
			key: 'Followup',
			name: 'Follow-up',
			icon: 'carbon:task-tools',
			description: 'Automated follow-up and reminder system.',
			color: 'green',
			configurable: true,
			configPath: 'followup-setting'
		},
		{
			key: 'Forms',
			name: 'Forms',
			icon: 'mdi:form-select',
			description: 'Digital forms for data collection and surveys.',
			color: 'purple',
			configurable: true,
			configPath: 'forms-setting'
		},
		{
			key: 'PatientApp',
			name: 'Patient App',
			icon: 'fluent:phone-tablet-20-regular',
			description: 'Mobile application for patient self-service and health management.',
			color: 'orange',
			configurable: false,
			alwaysDisabled: true
		},
		{
			key: 'PatientPortal',
			name: 'Patient Portal',
			icon: 'mdi:account-circle-outline',
			description: 'Web-based portal for patient access to health records.',
			color: 'teal',
			configurable: false,
			alwaysDisabled: true
		}
	];

	// Modal functions
	function openConfigModal(key: string) {
		activeModal = key;
		modalEditMode = false;
	}

	function closeConfigModal() {
		activeModal = null;
		modalEditMode = false;
	}

	function toggleModalEditMode() {
		modalEditMode = !modalEditMode;
		if (modalEditMode) {
			addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
		} else {
			addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
		}
	}

	// Get integration item by key
	function getIntegrationItem(key: string) {
		return integrationItems.find(item => item.key === key);
	}

	// Follow-up settings functions
	function toggleFollowupTab(tab: string) {
		followupOpenTab = followupOpenTab === tab ? null : tab;
	}

	function validateJSON() {
		try {
			if (followUpSettingUpdateModel.FileUploadSettings?.FileColumnFormat) {
				JSON.parse(followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat);
			}
			jsonError = '';
		} catch (error) {
			jsonError = 'Invalid JSON format';
		}
	}

	function setNestedError(obj: any, path: (string | number)[], value: string) {
		let current = obj;
		for (let i = 0; i < path.length - 1; i++) {
			const key = path[i];
			if (typeof key === 'number') {
				if (!Array.isArray(current)) current = [];
				if (!current[key]) current[key] = {};
			} else {
				if (!(key in current)) current[key] = {};
			}
			current = current[key];
		}
		current[path[path.length - 1]] = value;
	}

	const deleteSchedule = (index: number) => {
		if (followUpSettingUpdateModel.Source === 'Api') {
			followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule.splice(index, 1);
		} else if (followUpSettingUpdateModel.Source === 'File') {
			followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule.splice(index, 1);
		}
	};

	const editSchedule = (index: number) => {
		editingIndex = index;
		const scheduleToEdit =
			followUpSettingUpdateModel.Source === 'Api'
				? followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule[index]
				: followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule[index];
		newReminder = { ...scheduleToEdit };
		showReminderModal = true;
	};

	const addSchedule = () => {
		if (followUpSettingUpdateModel.Source === 'Api') {
			if (!Array.isArray(followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule)) {
				followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule = [];
			}
		} else {
			if (!Array.isArray(followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule)) {
				followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule = [];
			}
		}

		if (editingIndex !== null) {
			if (followUpSettingUpdateModel.Source === 'Api') {
				followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule[editingIndex] = { ...newReminder };
			} else {
				followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule[editingIndex] = { ...newReminder };
			}
			editingIndex = null;
		} else {
			if (followUpSettingUpdateModel.Source === 'Api') {
				followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule.push({ ...newReminder });
			} else {
				followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule.push({ ...newReminder });
			}
		}

		newReminder = { Type: 'PreviousDay', OffsetValue: undefined, OffsetUnit: 'hours', TimeOfDay: '' };
		showReminderModal = false;
	};

	// Key-value pair functions
	function addAuthQueryParam() {
		if (newAuthQueryKey.trim() && newAuthQueryValue.trim()) {
			followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams = {
				...followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams,
				[newAuthQueryKey.trim()]: newAuthQueryValue.trim()
			};
			newAuthQueryKey = '';
			newAuthQueryValue = '';
		}
	}

	function removeAuthQueryParam(key: string) {
		const updated = { ...followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams };
		delete updated[key];
		followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams = updated;
	}

	function addAuthHeader() {
		if (newAuthHeaderKey.trim() && newAuthHeaderValue.trim()) {
			followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers = {
				...followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers,
				[newAuthHeaderKey.trim()]: newAuthHeaderValue.trim()
			};
			newAuthHeaderKey = '';
			newAuthHeaderValue = '';
		}
	}

	function removeAuthHeader(key: string) {
		const updated = { ...followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers };
		delete updated[key];
		followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers = updated;
	}

	function addFetchQueryParam() {
		if (newFetchQueryKey.trim() && newFetchQueryValue.trim()) {
			followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams = {
				...followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams,
				[newFetchQueryKey.trim()]: newFetchQueryValue.trim()
			};
			newFetchQueryKey = '';
			newFetchQueryValue = '';
		}
	}

	function removeFetchQueryParam(key: string) {
		const updated = { ...followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams };
		delete updated[key];
		followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams = updated;
	}

	function addFetchHeader() {
		if (newFetchHeaderKey.trim() && newFetchHeaderValue.trim()) {
			followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers = {
				...followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers,
				[newFetchHeaderKey.trim()]: newFetchHeaderValue.trim()
			};
			newFetchHeaderKey = '';
			newFetchHeaderValue = '';
		}
	}

	function removeFetchHeader(key: string) {
		const updated = { ...followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers };
		delete updated[key];
		followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers = updated;
	}

	// Submit follow-up settings
	const handleFollowupSubmit = async () => {
		try {
			if (!modalEditMode) {
				addToast({ message: 'Nothing to edit!', type: 'info', timeout: 3000 });
				return;
			}
			followupErrors = {};

			// Prepare data for submission
			let submitData = { ...followUpSettingUpdateModel };

			if (submitData.Source === 'Api') {
				submitData.FileUploadSettings = undefined;
			} else if (submitData.Source === 'File') {
				submitData.ApiIntegrationSettings = undefined;
			} else {
				submitData.FileUploadSettings = undefined;
				submitData.ApiIntegrationSettings = undefined;
			}

			const validationResult = FollowupSettingsSchema.safeParse(submitData);

			if (!validationResult.success) {
				for (const err of validationResult.error.errors) {
					setNestedError(followupErrors, err.path as string[], err.message);
				}
				addToast({ message: 'Please fix the validation errors.', type: 'error', timeout: 3000 });
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Followup`, {
				method: 'PUT',
				body: JSON.stringify(submitData),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				modalEditMode = false;
				return;
			}

			if (response.Errors) {
				followupErrors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.log('Error saving follow-up settings:', error);
			toastMessage();
		}
	};

	const handleEditClick = async () => {
		disabled = !disabled;
		if (!disabled) {
			addToast({
				message: 'Edit mode enabled.',
				type: 'info',
				timeout: 3000
			});
		} else {
			addToast({
				message: 'Edit mode disabled.',
				type: 'info',
				timeout: 3000
			});
		}
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		try {
			if (disabled) {
				addToast({
					message: 'Nothing to edit!',
					type: 'warning',
					timeout: 3000
				});
				return;
			}

			errors = {};

			const validationResult = UserInterfacesSchema.safeParse(commonSettings.UserInterfaces);

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
				body: JSON.stringify(commonSettings),
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
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
			toastMessage();
		}
	};

	function getColorClasses(color: string, isEnabled: boolean) {
		if (!isEnabled) {
			return {
				bg: 'bg-gray-100',
				text: 'text-gray-400',
				border: 'border-gray-200'
			};
		}
		const colors = {
			blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
			green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
			purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
			orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
			teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' }
		};
		return colors[color] || colors.blue;
	}
</script>

<div class="settings-page">
	<!-- Page Header -->
	<div class="rounded-lg border border-[var(--color-outline)] bg-[var(--color-secondary)] overflow-hidden">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<!-- Header Section -->
			<div class="flex items-center justify-between px-6 py-5 bg-[var(--color-primary)] border-b border-[var(--color-outline)]">
				<div>
					<h1 class="text-xl font-semibold text-[var(--color-info)] flex items-center gap-2">
						<Icon icon="mdi:view-dashboard-outline" class="h-6 w-6" />
						Integrations
					</h1>
					<p class="text-sm text-[var(--color-info)] opacity-70 mt-1">
						Enable or disable tenant modules and integrations
					</p>
				</div>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1 flex items-center"
						onclick={handleEditClick}
					>
						<Icon icon={disabled ? 'material-symbols:edit-outline' : 'material-symbols:close'} class="h-5 w-5" />
						<span class="hidden sm:inline">{disabled ? 'Edit' : 'Cancel'}</span>
					</button>
				</div>
			</div>

			<!-- Integrations Grid -->
			<div class="p-6">
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each integrationItems as item}
						{@const isEnabled = commonSettings.UserInterfaces?.[item.key] ?? false}
						{@const colorClasses = getColorClasses(item.color, isEnabled)}
						<div
							class="integration-card relative rounded-xl border-2 p-5 transition-all duration-200
								{isEnabled ? colorClasses.border : 'border-gray-200'}
								{!disabled && !item.alwaysDisabled ? 'hover:shadow-md cursor-pointer' : ''}
								{item.alwaysDisabled ? 'opacity-60' : ''}"
						>
							<!-- Card Header -->
							<div class="flex items-start justify-between gap-3 mb-3">
								<div class="flex items-center gap-3">
									<div class="flex h-12 w-12 items-center justify-center rounded-xl {colorClasses.bg}">
										<Icon icon={item.icon} class="h-6 w-6 {colorClasses.text}" />
									</div>
									<div>
										<h3 class="font-semibold text-[var(--color-info)]">{item.name}</h3>
										{#if item.alwaysDisabled}
											<span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
												Coming Soon
											</span>
										{/if}
									</div>
								</div>

								<!-- Toggle Switch -->
								<label class="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										class="sr-only peer"
										disabled={disabled || item.alwaysDisabled}
										bind:checked={commonSettings.UserInterfaces[item.key]}
									/>
									<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
								</label>
							</div>

							<!-- Description -->
							<p class="text-sm text-[var(--color-info)] opacity-70 mb-4">
								{item.description}
							</p>

							<!-- Card Footer -->
							{#if item.configurable && isEnabled}
								<button
									type="button"
									onclick={() => openConfigModal(item.key)}
									class="inline-flex items-center gap-1 text-sm font-medium {colorClasses.text} hover:underline"
								>
									<Icon icon="mdi:cog-outline" class="h-4 w-4" />
									Configure
									<Icon icon="mdi:arrow-right" class="h-4 w-4" />
								</button>
							{:else if item.configurable && !isEnabled}
								<span class="text-sm text-gray-400">
									Enable to configure
								</span>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Info Banner -->
				<div class="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
					<div class="flex items-start gap-3">
						<Icon icon="mdi:information-outline" class="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
						<div>
							<p class="text-sm text-blue-800">
								<strong>Note:</strong> Enabling an integration will activate its features for this tenant.
								Click on "Configure" to customize the settings for each integration.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Submit Section -->
			<div class="px-6 py-4 bg-[var(--color-primary)] border-t border-[var(--color-outline)]">
				<div class="flex items-center justify-between">
					<p class="text-sm text-[var(--color-info)] opacity-70">
						{#if !disabled}
							<Icon icon="mdi:pencil" class="inline h-4 w-4 mr-1" />
							You are in edit mode. Make changes and submit to save.
						{:else}
							<Icon icon="mdi:lock-outline" class="inline h-4 w-4 mr-1" />
							Click "Edit" to modify integrations.
						{/if}
					</p>
					<div class="flex gap-2">
						{#await promise}
							<Button type="submit" variant="primary" size="md" text="Saving..." disabled={true} />
						{:then}
							<Button type="submit" variant="primary" size="md" text="Save Changes" disabled={disabled} />
						{/await}
					</div>
				</div>
			</div>
		</form>
	</div>

	<!-- Quick Links Section -->
	<!-- <div class="mt-6 rounded-lg border border-[var(--color-outline)] bg-[var(--color-secondary)] overflow-hidden">
		<div class="px-6 py-4 bg-[var(--color-primary)] border-b border-[var(--color-outline)]">
			<h2 class="font-semibold text-[var(--color-info)] flex items-center gap-2">
				<Icon icon="mdi:link-variant" class="h-5 w-5" />
				Quick Settings Access
			</h2>
		</div>
		<div class="p-4">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				<a
					href={`/users/${userId}/tenants/${tenantId}/settings/common-setting`}
					class="quick-link flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--color-outline)] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
				>
					<Icon icon="material-symbols:layers-outline" class="h-6 w-6 text-[var(--color-info)]" />
					<span class="text-sm font-medium text-[var(--color-info)]">Common</span>
				</a>
				<a
					href={`/users/${userId}/tenants/${tenantId}/settings/consent-setting`}
					class="quick-link flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--color-outline)] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
				>
					<Icon icon="material-symbols:verified-user-outline" class="h-6 w-6 text-[var(--color-info)]" />
					<span class="text-sm font-medium text-[var(--color-info)]">Consent</span>
				</a>
				<a
					href={`/users/${userId}/tenants/${tenantId}/settings/custom-settings`}
					class="quick-link flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--color-outline)] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
				>
					<Icon icon="material-symbols:settings-outline" class="h-6 w-6 text-[var(--color-info)]" />
					<span class="text-sm font-medium text-[var(--color-info)]">Custom</span>
				</a>
				<a
					href={`/users/${userId}/tenants/${tenantId}/settings/clickup-setting`}
					class="quick-link flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--color-outline)] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
				>
					<Icon icon="simple-icons:clickup" class="h-6 w-6 text-[var(--color-info)]" />
					<span class="text-sm font-medium text-[var(--color-info)]">ClickUp</span>
				</a>
			</div>
		</div>
	</div> -->
</div>

<!-- Configuration Modal -->
{#if activeModal}
	{@const item = getIntegrationItem(activeModal)}
	{@const colorClasses = getColorClasses(item?.color || 'blue', true)}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/40"
			onclick={closeConfigModal}
			onkeydown={(e) => (e.key === 'Escape') && closeConfigModal()}
			role="button"
			tabindex="0"
			transition:fade={{ duration: 200 }}
		></div>

		<!-- Modal Content -->
		<div
			class="config-modal relative bg-[var(--color-secondary)] rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline)] bg-[var(--color-primary)]">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl {colorClasses.bg}">
						<Icon icon={item?.icon || 'mdi:cog'} class="h-5 w-5 {colorClasses.text}" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-[var(--color-info)]">{item?.name} Settings</h2>
						<p class="text-sm text-[var(--color-info)] opacity-70">Edit configuration details</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1 flex items-center"
						onclick={toggleModalEditMode}
					>
						<Icon icon={modalEditMode ? 'material-symbols:close' : 'material-symbols:edit-outline'} class="h-4 w-4" />
						<span class="hidden sm:inline">{modalEditMode ? 'Cancel' : 'Edit'}</span>
					</button>
					<button
						type="button"
						class="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
						onclick={closeConfigModal}
					>
						<Icon icon="mdi:close" class="h-5 w-5" />
					</button>
				</div>
			</div>

			<!-- Modal Body -->
			<div class="modal-body p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
				{#if activeModal === 'ChatBot'}
					<!-- Chatbot Settings Content -->
					<div class="space-y-6">
						<!-- General Section -->
						<div class="config-section">
							<button
								type="button"
								class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
								onclick={(e) => e.currentTarget.parentElement?.classList.toggle('expanded')}
							>
								<div class="flex items-center gap-2">
									<Icon icon="mdi:information-outline" class="h-5 w-5 text-blue-600" />
									<span class="font-medium text-[var(--color-info)]">General</span>
								</div>
								<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
							</button>
							<div class="collapsible-content mt-3 space-y-4">
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Bot Name</label>
										<input type="text" class="input-field w-full" placeholder="Enter bot name" disabled={!modalEditMode} value={data.chatbotSettings?.Name || ''} />
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Default Language</label>
										<select class="select w-full" disabled={!modalEditMode}>
											<option value="English" selected>English</option>
											<option value="Spanish">Spanish</option>
											<option value="French">French</option>
										</select>
									</div>
								</div>
								<div>
									<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Description</label>
									<textarea class="input-field w-full" rows="2" placeholder="Enter description" disabled={!modalEditMode}>{data.chatbotSettings?.Description || ''}</textarea>
								</div>
							</div>
						</div>

						<!-- Features Section -->
						<div class="config-section expanded">
							<button
								type="button"
								class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
								onclick={(e) => e.currentTarget.parentElement?.classList.toggle('expanded')}
							>
								<div class="flex items-center gap-2">
									<Icon icon="mdi:toggle-switch-outline" class="h-5 w-5 text-blue-600" />
									<span class="font-medium text-[var(--color-info)]">Features</span>
								</div>
								<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
							</button>
							<div class="collapsible-content mt-3 space-y-3">
								{#each [
									{ key: 'Consent', name: 'Consent', icon: 'mdi:shield-check-outline', desc: 'Require user consent' },
									{ key: 'WelcomeMessage', name: 'Welcome Message', icon: 'mdi:hand-wave-outline', desc: 'Show welcome message' },
									{ key: 'Feedback', name: 'Feedback', icon: 'mdi:comment-outline', desc: 'Collect user feedback' },
									{ key: 'Personalization', name: 'Personalization', icon: 'mdi:account-cog-outline', desc: 'Personalize responses' }
								] as feature}
									<div class="flex items-center justify-between p-3 rounded-lg border border-[var(--color-outline)] bg-[var(--color-primary)]">
										<div class="flex items-center gap-3">
											<Icon icon={feature.icon} class="h-5 w-5 text-blue-600" />
											<div>
												<p class="font-medium text-[var(--color-info)]">{feature.name}</p>
												<p class="text-xs text-[var(--color-info)] opacity-60">{feature.desc}</p>
											</div>
										</div>
										<label class="relative inline-flex items-center cursor-pointer">
											<input type="checkbox" class="sr-only peer" disabled={!modalEditMode} checked={data.chatbotSettings?.[feature.key] ?? false} />
											<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
										</label>
									</div>
								{/each}
							</div>
						</div>

						<!-- Advanced Link -->
						<div class="pt-4 border-t border-[var(--color-outline)]">
							<a
								href={`/users/${userId}/tenants/${tenantId}/settings/chatbot-setting`}
								class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
							>
								<Icon icon="mdi:open-in-new" class="h-4 w-4" />
								Open Advanced Settings
							</a>
						</div>
					</div>

				{:else if activeModal === 'Followup'}
					<!-- Follow-up Settings Content - Complete Form -->
					<div class="space-y-4">
						<!-- Source Section -->
						<div class="config-section expanded">
							<button
								type="button"
								class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
								onclick={(e) => e.currentTarget.parentElement?.classList.toggle('expanded')}
							>
								<div class="flex items-center gap-2">
									<Icon icon="mdi:database-outline" class="h-5 w-5 text-green-600" />
									<span class="font-medium text-[var(--color-info)]">Data Source</span>
								</div>
								<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
							</button>
							<div class="collapsible-content mt-3 space-y-4">
								<div>
									<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Follow-up Data Source <span class="text-red-500">*</span></label>
									<select
										class="select w-full"
										bind:value={followUpSettingUpdateModel.Source}
										disabled={!modalEditMode}
									>
										<option value="None">None</option>
										<option value="File">File Upload</option>
										<option value="Api">API Integration</option>
									</select>
									<p class="text-xs text-[var(--color-info)] opacity-60 mt-1">Select how follow-up data will be provided</p>
									{#if followupErrors?.Source}
										<p class="text-red-500 text-xs mt-1">{followupErrors.Source}</p>
									{/if}
								</div>
							</div>
						</div>

						<!-- File Upload Settings -->
						{#if followUpSettingUpdateModel.Source === 'File'}
							<div class="config-section expanded">
								<button
									type="button"
									class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
									onclick={(e) => e.currentTarget.parentElement?.classList.toggle('expanded')}
								>
									<div class="flex items-center gap-2">
										<Icon icon="mdi:file-upload-outline" class="h-5 w-5 text-green-600" />
										<span class="font-medium text-[var(--color-info)]">File Upload Settings</span>
									</div>
									<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
								</button>
								<div class="collapsible-content mt-3 space-y-4">
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Column Format (JSON) <span class="text-red-500">*</span></label>
										<textarea
											class="input-field w-full font-mono text-sm"
											rows="4"
											bind:value={followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat}
											oninput={validateJSON}
											disabled={!modalEditMode}
											placeholder={'{"column1": "type1", "column2": "type2"}'}
										></textarea>
										{#if jsonError || followupErrors?.FileUploadSettings?.FileColumnFormat}
											<p class="text-red-500 text-xs mt-1">{jsonError || followupErrors?.FileUploadSettings?.FileColumnFormat}</p>
										{/if}
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">File Type <span class="text-red-500">*</span></label>
										<select
											class="select w-full"
											bind:value={followUpSettingUpdateModel.FileUploadSettings.FileType}
											disabled={!modalEditMode}
										>
											<option value="" disabled>Select file type</option>
											<option value="csv">CSV</option>
											<option value="json">JSON</option>
											<option value="xlsx">Excel</option>
											<option value="xml">XML</option>
										</select>
										{#if followupErrors?.FileUploadSettings?.FileType}
											<p class="text-red-500 text-xs mt-1">{followupErrors.FileUploadSettings.FileType}</p>
										{/if}
									</div>
									<div>
										<div class="flex items-center justify-between mb-2">
											<label class="block text-sm font-medium text-[var(--color-info)]">Reminder Schedules <span class="text-red-500">*</span></label>
											<button
												type="button"
												class="table-btn variant-filled-secondary gap-1 text-xs"
												onclick={() => showReminderModal = modalEditMode}
												disabled={!modalEditMode}
											>
												<Icon icon="mdi:plus" class="h-4 w-4" />
												Add Schedule
											</button>
										</div>
										{#if followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule?.length > 0}
											<div class="space-y-2">
												{#each followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule as schedule, i}
													<div class="flex items-center justify-between p-2 rounded border border-[var(--color-outline)] bg-[var(--color-primary)]">
														<div class="text-sm text-[var(--color-info)]">
															<span class="font-medium">{schedule.Type}</span>
															{#if schedule.TimeOfDay}
																<span class="opacity-70"> - {schedule.TimeOfDay}</span>
															{:else if schedule.OffsetValue}
																<span class="opacity-70"> - {schedule.OffsetValue} {schedule.OffsetUnit} before</span>
															{/if}
														</div>
														<div class="flex gap-1">
															<button type="button" class="p-1 hover:bg-gray-100 rounded" onclick={() => editSchedule(i)} disabled={!modalEditMode}>
																<Icon icon="mdi:pencil-outline" class="h-4 w-4 text-blue-600" />
															</button>
															<button type="button" class="p-1 hover:bg-gray-100 rounded" onclick={() => deleteSchedule(i)} disabled={!modalEditMode}>
																<Icon icon="mdi:delete-outline" class="h-4 w-4 text-red-600" />
															</button>
														</div>
													</div>
												{/each}
											</div>
										{:else}
											<p class="text-sm text-[var(--color-info)] opacity-60">No schedules configured</p>
										{/if}
										{#if followupErrors?.FileUploadSettings?.ReminderSchedule}
											<p class="text-red-500 text-xs mt-1">{followupErrors.FileUploadSettings.ReminderSchedule}</p>
										{/if}
									</div>
								</div>
							</div>
						{/if}

						<!-- API Integration Settings -->
						{#if followUpSettingUpdateModel.Source === 'Api'}
							<!-- Authentication Endpoint -->
							<div class="config-section" class:expanded={followupOpenTab === 'auth'}>
								<button
									type="button"
									class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
									onclick={() => toggleFollowupTab('auth')}
								>
									<div class="flex items-center gap-2">
										<Icon icon="mdi:key-outline" class="h-5 w-5 text-green-600" />
										<span class="font-medium text-[var(--color-info)]">Authentication Endpoint</span>
									</div>
									<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
								</button>
								<div class="collapsible-content mt-3 space-y-3">
									<div class="grid grid-cols-2 gap-3">
										<div>
											<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Method</label>
											<select class="select w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Method} disabled={!modalEditMode}>
												<option value="">Select Method</option>
												<option value="GET">GET</option>
												<option value="POST">POST</option>
												<option value="PUT">PUT</option>
											</select>
										</div>
										<div>
											<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Response Type</label>
											<select class="select w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.ResponseType} disabled={!modalEditMode}>
												<option value="">Select Type</option>
												<option value="json">JSON</option>
												<option value="text">Text</option>
												<option value="xml">XML</option>
											</select>
										</div>
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">URL</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Url} disabled={!modalEditMode} placeholder="https://api.example.com/auth" />
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Request Body</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Body} disabled={!modalEditMode} placeholder="Request body" />
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Token Path</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenPath} disabled={!modalEditMode} placeholder="data.token" />
									</div>
									<!-- Query Params -->
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Query Parameters</label>
										<div class="flex gap-2 mb-2">
											<input type="text" class="input-field flex-1" bind:value={newAuthQueryKey} disabled={!modalEditMode} placeholder="Key" />
											<input type="text" class="input-field flex-1" bind:value={newAuthQueryValue} disabled={!modalEditMode} placeholder="Value" />
											<button type="button" class="table-btn variant-filled-secondary" onclick={addAuthQueryParam} disabled={!modalEditMode}>Add</button>
										</div>
										{#each Object.entries(followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams || {}) as [key, value]}
											<div class="flex items-center justify-between p-1.5 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] mb-1 text-sm">
												<span class="text-[var(--color-info)]">{key}: {value}</span>
												<button type="button" class="p-0.5 hover:bg-gray-100 rounded" onclick={() => removeAuthQueryParam(key)} disabled={!modalEditMode}>
													<Icon icon="mdi:close" class="h-4 w-4 text-red-600" />
												</button>
											</div>
										{/each}
									</div>
									<!-- Headers -->
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Headers</label>
										<div class="flex gap-2 mb-2">
											<input type="text" class="input-field flex-1" bind:value={newAuthHeaderKey} disabled={!modalEditMode} placeholder="Key" />
											<input type="text" class="input-field flex-1" bind:value={newAuthHeaderValue} disabled={!modalEditMode} placeholder="Value" />
											<button type="button" class="table-btn variant-filled-secondary" onclick={addAuthHeader} disabled={!modalEditMode}>Add</button>
										</div>
										{#each Object.entries(followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers || {}) as [key, value]}
											<div class="flex items-center justify-between p-1.5 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] mb-1 text-sm">
												<span class="text-[var(--color-info)]">{key}: {value}</span>
												<button type="button" class="p-0.5 hover:bg-gray-100 rounded" onclick={() => removeAuthHeader(key)} disabled={!modalEditMode}>
													<Icon icon="mdi:close" class="h-4 w-4 text-red-600" />
												</button>
											</div>
										{/each}
									</div>
								</div>
							</div>

							<!-- Token Injection -->
							<div class="config-section" class:expanded={followupOpenTab === 'token'}>
								<button
									type="button"
									class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
									onclick={() => toggleFollowupTab('token')}
								>
									<div class="flex items-center gap-2">
										<Icon icon="mdi:code-brackets" class="h-5 w-5 text-green-600" />
										<span class="font-medium text-[var(--color-info)]">Token Injection</span>
									</div>
									<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
								</button>
								<div class="collapsible-content mt-3 space-y-3">
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Location</label>
										<select class="select w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Location} disabled={!modalEditMode}>
											<option value="">Select Location</option>
											<option value="header">Header</option>
											<option value="query">Query</option>
											<option value="body">Body</option>
										</select>
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Key</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Key} disabled={!modalEditMode} placeholder="Authorization" />
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Prefix</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Prefix} disabled={!modalEditMode} placeholder="Bearer " />
									</div>
								</div>
							</div>

							<!-- Fetch Configuration -->
							<div class="config-section" class:expanded={followupOpenTab === 'fetch'}>
								<button
									type="button"
									class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
									onclick={() => toggleFollowupTab('fetch')}
								>
									<div class="flex items-center gap-2">
										<Icon icon="mdi:cloud-download-outline" class="h-5 w-5 text-green-600" />
										<span class="font-medium text-[var(--color-info)]">Fetch Configuration</span>
									</div>
									<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
								</button>
								<div class="collapsible-content mt-3 space-y-3">
									<div class="grid grid-cols-2 gap-3">
										<div>
											<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Method <span class="text-red-500">*</span></label>
											<select class="select w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Method} disabled={!modalEditMode}>
												<option value="">Select Method</option>
												<option value="GET">GET</option>
												<option value="POST">POST</option>
												<option value="PUT">PUT</option>
											</select>
										</div>
										<div>
											<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Response Type</label>
											<select class="select w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.ResponseType} disabled={!modalEditMode}>
												<option value="">Select Type</option>
												<option value="json">JSON</option>
												<option value="text">Text</option>
												<option value="xml">XML</option>
											</select>
										</div>
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">URL <span class="text-red-500">*</span></label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Url} disabled={!modalEditMode} placeholder="https://api.example.com/data" />
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Request Body</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Body} disabled={!modalEditMode} placeholder="Request body" />
									</div>
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Response Field</label>
										<input type="text" class="input-field w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.ResponseField} disabled={!modalEditMode} placeholder="data.items" />
									</div>
									<!-- Query Params -->
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Query Parameters</label>
										<div class="flex gap-2 mb-2">
											<input type="text" class="input-field flex-1" bind:value={newFetchQueryKey} disabled={!modalEditMode} placeholder="Key" />
											<input type="text" class="input-field flex-1" bind:value={newFetchQueryValue} disabled={!modalEditMode} placeholder="Value" />
											<button type="button" class="table-btn variant-filled-secondary" onclick={addFetchQueryParam} disabled={!modalEditMode}>Add</button>
										</div>
										{#each Object.entries(followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams || {}) as [key, value]}
											<div class="flex items-center justify-between p-1.5 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] mb-1 text-sm">
												<span class="text-[var(--color-info)]">{key}: {value}</span>
												<button type="button" class="p-0.5 hover:bg-gray-100 rounded" onclick={() => removeFetchQueryParam(key)} disabled={!modalEditMode}>
													<Icon icon="mdi:close" class="h-4 w-4 text-red-600" />
												</button>
											</div>
										{/each}
									</div>
									<!-- Headers -->
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Headers</label>
										<div class="flex gap-2 mb-2">
											<input type="text" class="input-field flex-1" bind:value={newFetchHeaderKey} disabled={!modalEditMode} placeholder="Key" />
											<input type="text" class="input-field flex-1" bind:value={newFetchHeaderValue} disabled={!modalEditMode} placeholder="Value" />
											<button type="button" class="table-btn variant-filled-secondary" onclick={addFetchHeader} disabled={!modalEditMode}>Add</button>
										</div>
										{#each Object.entries(followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers || {}) as [key, value]}
											<div class="flex items-center justify-between p-1.5 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] mb-1 text-sm">
												<span class="text-[var(--color-info)]">{key}: {value}</span>
												<button type="button" class="p-0.5 hover:bg-gray-100 rounded" onclick={() => removeFetchHeader(key)} disabled={!modalEditMode}>
													<Icon icon="mdi:close" class="h-4 w-4 text-red-600" />
												</button>
											</div>
										{/each}
									</div>
								</div>
							</div>

							<!-- Schedule & Reminders -->
							<div class="config-section expanded">
								<button
									type="button"
									class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
									onclick={(e) => e.currentTarget.parentElement?.classList.toggle('expanded')}
								>
									<div class="flex items-center gap-2">
										<Icon icon="mdi:bell-ring-outline" class="h-5 w-5 text-green-600" />
										<span class="font-medium text-[var(--color-info)]">Schedule & Reminders</span>
									</div>
									<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
								</button>
								<div class="collapsible-content mt-3 space-y-4">
									<div>
										<label class="block text-sm font-medium text-[var(--color-info)] mb-1">Schedule Frequency <span class="text-red-500">*</span></label>
										<select class="select w-full" bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.ScheduleFrequency} disabled={!modalEditMode}>
											<option value="">Select Frequency</option>
											<option value="daily">Daily</option>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
										</select>
										{#if followupErrors?.ApiIntegrationSettings?.ScheduleFrequency}
											<p class="text-red-500 text-xs mt-1">{followupErrors.ApiIntegrationSettings.ScheduleFrequency}</p>
										{/if}
									</div>
									<div>
										<div class="flex items-center justify-between mb-2">
											<label class="block text-sm font-medium text-[var(--color-info)]">Reminder Schedules <span class="text-red-500">*</span></label>
											<button
												type="button"
												class="table-btn variant-filled-secondary gap-1 text-xs"
												onclick={() => showReminderModal = modalEditMode}
												disabled={!modalEditMode}
											>
												<Icon icon="mdi:plus" class="h-4 w-4" />
												Add Schedule
											</button>
										</div>
										{#if followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule?.length > 0}
											<div class="space-y-2">
												{#each followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule as schedule, i}
													<div class="flex items-center justify-between p-2 rounded border border-[var(--color-outline)] bg-[var(--color-primary)]">
														<div class="text-sm text-[var(--color-info)]">
															<span class="font-medium">{schedule.Type}</span>
															{#if schedule.TimeOfDay}
																<span class="opacity-70"> - {schedule.TimeOfDay}</span>
															{:else if schedule.OffsetValue}
																<span class="opacity-70"> - {schedule.OffsetValue} {schedule.OffsetUnit} before</span>
															{/if}
														</div>
														<div class="flex gap-1">
															<button type="button" class="p-1 hover:bg-gray-100 rounded" onclick={() => editSchedule(i)} disabled={!modalEditMode}>
																<Icon icon="mdi:pencil-outline" class="h-4 w-4 text-blue-600" />
															</button>
															<button type="button" class="p-1 hover:bg-gray-100 rounded" onclick={() => deleteSchedule(i)} disabled={!modalEditMode}>
																<Icon icon="mdi:delete-outline" class="h-4 w-4 text-red-600" />
															</button>
														</div>
													</div>
												{/each}
											</div>
										{:else}
											<p class="text-sm text-[var(--color-info)] opacity-60">No schedules configured</p>
										{/if}
										{#if followupErrors?.ApiIntegrationSettings?.ReminderSchedule}
											<p class="text-red-500 text-xs mt-1">{followupErrors.ApiIntegrationSettings.ReminderSchedule}</p>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					</div>

				{:else if activeModal === 'Forms'}
					<!-- Forms Settings Content -->
					<div class="space-y-6">
						<!-- Forms Configuration Section -->
						<div class="config-section expanded">
							<button
								type="button"
								class="collapsible-header w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-primary)] border border-[var(--color-outline)]"
								onclick={(e) => e.currentTarget.parentElement?.classList.toggle('expanded')}
							>
								<div class="flex items-center gap-2">
									<Icon icon="mdi:form-select" class="h-5 w-5 text-purple-600" />
									<span class="font-medium text-[var(--color-info)]">Form Settings</span>
								</div>
								<Icon icon="mdi:chevron-down" class="h-5 w-5 text-gray-500 chevron-icon" />
							</button>
							<div class="collapsible-content mt-3 space-y-4">
								<div class="flex items-center justify-between p-3 rounded-lg border border-[var(--color-outline)] bg-[var(--color-primary)]">
									<div class="flex items-center gap-3">
										<Icon icon="mdi:cellphone" class="h-5 w-5 text-purple-600" />
										<div>
											<p class="font-medium text-[var(--color-info)]">Field App</p>
											<p class="text-xs text-[var(--color-info)] opacity-60">Enable field application forms</p>
										</div>
									</div>
									<label class="relative inline-flex items-center cursor-pointer">
										<input type="checkbox" class="sr-only peer" disabled={!modalEditMode} />
										<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
									</label>
								</div>
							</div>
						</div>

						<!-- Advanced Link -->
						<div class="pt-4 border-t border-[var(--color-outline)]">
							<a
								href={`/users/${userId}/tenants/${tenantId}/settings/forms-setting`}
								class="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:underline"
							>
								<Icon icon="mdi:open-in-new" class="h-4 w-4" />
								Open Advanced Settings
							</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-between px-6 py-4 border-t border-[var(--color-outline)] bg-[var(--color-primary)]">
				<p class="text-sm text-[var(--color-info)] opacity-70">
					{#if modalEditMode}
						<Icon icon="mdi:pencil" class="inline h-4 w-4 mr-1" />
						You are in edit mode
					{:else}
						<Icon icon="mdi:lock-outline" class="inline h-4 w-4 mr-1" />
						Click "Edit" to modify
					{/if}
				</p>
				<div class="flex gap-2">
					<Button type="button" variant="secondary" size="md" text="Cancel" onclick={closeConfigModal} />
					{#if activeModal === 'Followup'}
						{#await followupPromise}
							<Button type="button" variant="primary" size="md" text="Saving..." disabled={true} />
						{:then}
							<Button type="button" variant="primary" size="md" text="Save Changes" disabled={!modalEditMode} onclick={() => followupPromise = handleFollowupSubmit()} />
						{/await}
					{:else}
						<Button type="button" variant="primary" size="md" text="Save Changes" disabled={!modalEditMode} />
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Reminder Schedule Modal -->
{#if showReminderModal}
	<div class="fixed inset-0 z-[60] flex items-center justify-center" transition:fade={{ duration: 150 }}>
		<div class="absolute inset-0 bg-black/50" onclick={() => showReminderModal = false} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && (showReminderModal = false)}></div>
		<div class="relative bg-[var(--color-secondary)] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" transition:scale={{ duration: 150, start: 0.95 }}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-[var(--color-outline)] bg-[var(--color-primary)]">
				<h3 class="text-lg font-semibold text-[var(--color-info)]">
					{editingIndex !== null ? 'Edit' : 'Add'} Reminder Schedule
				</h3>
				<button type="button" class="p-1.5 hover:bg-gray-100 rounded-lg" onclick={() => showReminderModal = false}>
					<Icon icon="mdi:close" class="h-5 w-5 text-gray-500" />
				</button>
			</div>
			<div class="p-5 space-y-4">
				<div>
					<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Type <span class="text-red-500">*</span></label>
					<select class="select w-full" bind:value={newReminder.Type}>
						<option value="PreviousDay">Previous Day</option>
						<option value="SameDayMorning">Same Day Morning</option>
						<option value="StartOfDay">Start Of Day</option>
						<option value="XHoursBefore">X Hours Before</option>
						<option value="XMinutesBefore">X Minutes Before</option>
						<option value="CustomTimeBefore">Custom Time Before</option>
						<option value="AfterAppointment">After Appointment</option>
						<option value="EndOfDay">End Of Day</option>
						<option value="NoReminder">No Reminder</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Offset Value</label>
					<input type="number" class="input-field w-full" bind:value={newReminder.OffsetValue} placeholder="Enter offset value" min="0" max="24" />
				</div>
				<div>
					<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Offset Unit</label>
					<select class="select w-full" bind:value={newReminder.OffsetUnit}>
						<option value="minutes">Minutes</option>
						<option value="hours">Hours</option>
						<option value="days">Days</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-[var(--color-info)] mb-1.5">Time of Day</label>
					<input type="time" class="input-field w-full" bind:value={newReminder.TimeOfDay} />
				</div>
			</div>
			<div class="flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-outline)] bg-[var(--color-primary)]">
				<Button type="button" variant="secondary" size="md" text="Cancel" onclick={() => showReminderModal = false} />
				<Button type="button" variant="primary" size="md" text={editingIndex !== null ? 'Update' : 'Add'} onclick={addSchedule} />
			</div>
		</div>
	</div>
{/if}

<style>
	.settings-page {
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.integration-card {
		background: var(--color-secondary);
	}

	.quick-link:hover {
		transform: translateY(-2px);
	}

	/* Modal Styles */
	.config-modal {
		animation: modalSlideIn 0.2s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Collapsible Sections */
	.config-section .collapsible-content {
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
		opacity: 0;
	}

	.config-section.expanded .collapsible-content {
		max-height: 1000px;
		opacity: 1;
	}

	.config-section .chevron-icon {
		transition: transform 0.2s ease;
	}

	.config-section.expanded .chevron-icon {
		transform: rotate(180deg);
	}

	.collapsible-header:hover {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.modal-body::-webkit-scrollbar {
		width: 6px;
	}

	.modal-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.modal-body::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}
</style>
