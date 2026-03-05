<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store.js';
	import type { ReminderTrigger } from '$lib/types/tenant.settings.types.js';
	import { FollowupSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import ReminderScheduleList from './reminder-schedule-list.svelte';
	import ReminderScheduleForm from './reminder-schedule-form.svelte';
	import FollowUpSettings from './follow-up-settings.svelte';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';
	import SettingsSection from '$lib/components/settings/settings-section.svelte';
	import SettingsFooter from '$lib/components/settings/settings-footer.svelte';

	///////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	let promise = $state();
	let errors: any = $state({});
	let showReminderModal = $state(false);
	let newReminder: ReminderTrigger = $state({
		Type: 'PreviousDay',
		OffsetValue: undefined,
		OffsetUnit: 'hours',
		TimeOfDay: ''
	});
	let editingIndex: number | null = null;
	let jsonError = $state('');

	let isFollowupEnabled = $state(data.isFollowupEnabled);

	$inspect('isFollowupEnabled', isFollowupEnabled);

	let edit = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');

	$inspect('edit', edit);

	const handleToggleEdit = () => {
		if (!isFollowupEnabled) {
			addToast({
				message: 'This setting is disabled. Please update it from the main settings.',
				type: 'warning',
				timeout: 3000
			});
			return;
		}
		edit = true;
		originalSnapshot = JSON.stringify($state.snapshot(followUpSettingUpdateModel));
		addToast({
			message: 'Edit mode enabled.',
			type: 'info',
			timeout: 3000
		});
	};

	const handleCancelEdit = () => {
		followUpSettingUpdateModel = JSON.parse(originalSnapshot);
		edit = false;
		errors = {};
		addToast({
			message: 'Edit mode disabled.',
			type: 'info',
			timeout: 3000
		});
	};

	// function validateJSON() {
	// 	try {
	// 		JSON.parse(followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat);
	// 		jsonError = '';
	// 	} catch (error) {
	// 		jsonError = 'Invalid JSON format';
	// 	}
	// }

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

	let followUpSettingUpdateModel = $state({
		Source: data.settings.Source,
		FileUploadSettings: {
			FileColumnFormat: data.settings?.FileUploadSettings?.FileColumnFormat
				? JSON.parse(data.settings?.FileUploadSettings?.FileColumnFormat)
				: null,
			FileType: data.settings.FileUploadSettings?.FileType,
			ReminderSchedule: data.settings.FileUploadSettings?.ReminderSchedule
		},
		ApiIntegrationSettings: {
			Auth: {
				Method: data.settings.ApiIntegrationSettings?.Auth?.Method,
				Url: data.settings.ApiIntegrationSettings?.Auth?.Url,
				Body: data.settings.ApiIntegrationSettings?.Auth?.Body || '',
				QueryParams: data.settings.ApiIntegrationSettings?.Auth?.QueryParams || {},
				Headers: data.settings.ApiIntegrationSettings?.Auth?.Headers || {},
				TokenPath: data.settings.ApiIntegrationSettings?.Auth?.TokenPath,
				ResponseType: data.settings.ApiIntegrationSettings?.Auth?.ResponseType,
				TokenInjection: {
					Location: data.settings.ApiIntegrationSettings?.Auth?.TokenInjection?.Location,
					Key: data.settings.ApiIntegrationSettings?.Auth?.TokenInjection?.Key,
					Prefix: data.settings.ApiIntegrationSettings?.Auth?.TokenInjection?.Prefix
				}
			},
			Fetch: {
				Method: data.settings.ApiIntegrationSettings?.Fetch?.Method,
				Url: data.settings.ApiIntegrationSettings?.Fetch?.Url,
				QueryParams: data.settings?.ApiIntegrationSettings?.Fetch?.QueryParams || {},
				Body: data.settings?.ApiIntegrationSettings?.Fetch?.Body || '',
				Headers: data.settings.ApiIntegrationSettings?.Fetch?.Headers || {},
				ResponseType: data.settings?.ApiIntegrationSettings?.Fetch?.ResponseType,
				ResponseField: data.settings?.ApiIntegrationSettings?.Fetch?.ResponseField
			},
			ReminderSchedule: data.settings?.ApiIntegrationSettings?.ReminderSchedule,
			ScheduleFrequency: data.settings?.ApiIntegrationSettings?.ScheduleFrequency
		}
	});

	let hasUnsavedChanges = $derived(
		edit && JSON.stringify($state.snapshot(followUpSettingUpdateModel)) !== originalSnapshot
	);

	beforeNavigate((navigation) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	$inspect('followUpSettingUpdateModel', followUpSettingUpdateModel);

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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			if (!edit) {
				addToast({
					message: 'Nothing to edit !',
					type: 'warning',
					timeout: 3000
				});
				return;
			}
			isSubmitting = true;
			errors = {};

			if (followUpSettingUpdateModel.Source === 'Api') {
				followUpSettingUpdateModel.FileUploadSettings = undefined;
			} else if (followUpSettingUpdateModel.Source === 'File') {
				followUpSettingUpdateModel.ApiIntegrationSettings = undefined;
			} else {
				followUpSettingUpdateModel.FileUploadSettings = undefined;
				followUpSettingUpdateModel.ApiIntegrationSettings = undefined;
			}

			const validationResult = FollowupSettingsSchema.safeParse(followUpSettingUpdateModel);
			console.log('This is validation result', validationResult);

			if (!validationResult.success) {
				for (const err of validationResult.error.errors) {
					setNestedError(errors, err.path as string[], err.message);
				}
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Followup`, {
				method: 'PUT',
				body: JSON.stringify(followUpSettingUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// goto(`/users/${userId}/tenants/${tenantId}/settings`);
				if (followUpSettingUpdateModel.Source === 'None') {
					followUpSettingUpdateModel.FileUploadSettings = {
						FileColumnFormat: data?.settings?.FileUploadSettings?.FileColumnFormat
							? JSON.parse(data.settings?.FileUploadSettings?.FileColumnFormat)
							: null,
						FileType: data.settings?.FileUploadSettings?.FileType,
						ReminderSchedule: data.settings?.FileUploadSettings?.ReminderSchedule
					};

					followUpSettingUpdateModel.ApiIntegrationSettings = {
						Auth: {
							Method: data.settings?.ApiIntegrationSettings?.Auth?.Method,
							Url: data.settings?.ApiIntegrationSettings?.Auth?.Url,
							Body: data.settings?.ApiIntegrationSettings?.Auth?.Body || '',
							QueryParams: data.settings?.ApiIntegrationSettings?.Auth?.QueryParams || {},
							Headers: data.settings?.ApiIntegrationSettings?.Auth?.Headers || {},
							TokenPath: data.settings?.ApiIntegrationSettings?.Auth?.TokenPath,
							ResponseType: data.settings?.ApiIntegrationSettings?.Auth?.ResponseType,
							TokenInjection: {
								Location: data.settings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Location,
								Key: data.settings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Key,
								Prefix: data.settings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Prefix
							}
						},
						Fetch: {
							Method: data.settings?.ApiIntegrationSettings?.Fetch?.Method,
							Url: data.settings?.ApiIntegrationSettings?.Fetch?.Url,
							QueryParams: data.settings?.ApiIntegrationSettings?.Fetch?.QueryParams || {},
							Body: data.settings?.ApiIntegrationSettings?.Fetch?.Body || '',
							Headers: data.settings?.ApiIntegrationSettings?.Fetch?.Headers || {},
							ResponseType: data.settings?.ApiIntegrationSettings?.Fetch?.ResponseType,
							ResponseField: data.settings?.ApiIntegrationSettings?.Fetch?.ResponseField
						},
						ReminderSchedule: data.settings?.ApiIntegrationSettings?.ReminderSchedule,
						ScheduleFrequency: data.settings?.ApiIntegrationSettings?.ScheduleFrequency
					};
				}

				if (followUpSettingUpdateModel.Source === 'File') {
					followUpSettingUpdateModel.ApiIntegrationSettings = {
						Auth: {
							Method: data.settings?.ApiIntegrationSettings?.Auth?.Method,
							Url: data.settings?.ApiIntegrationSettings?.Auth?.Url,
							Body: data.settings?.ApiIntegrationSettings?.Auth?.Body || '',
							QueryParams: data.settings?.ApiIntegrationSettings?.Auth?.QueryParams || {},
							Headers: data.settings?.ApiIntegrationSettings?.Auth?.Headers || {},
							TokenPath: data.settings?.ApiIntegrationSettings?.Auth?.TokenPath,
							ResponseType: data.settings?.ApiIntegrationSettings?.Auth?.ResponseType,
							TokenInjection: {
								Location: data.settings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Location,
								Key: data.settings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Key,
								Prefix: data.settings?.ApiIntegrationSettings?.Auth?.TokenInjection?.Prefix
							}
						},
						Fetch: {
							Method: data.settings?.ApiIntegrationSettings?.Fetch?.Method,
							Url: data.settings?.ApiIntegrationSettings?.Fetch?.Url,
							QueryParams: data.settings?.ApiIntegrationSettings?.Fetch?.QueryParams || {},
							Body: data.settings?.ApiIntegrationSettings?.Fetch?.Body || '',
							Headers: data.settings?.ApiIntegrationSettings?.Fetch?.Headers || {},
							ResponseType: data.settings?.ApiIntegrationSettings?.Fetch?.ResponseType,
							ResponseField: data.settings?.ApiIntegrationSettings?.Fetch?.ResponseField
						},
						ReminderSchedule: data.settings?.ApiIntegrationSettings?.ReminderSchedule,
						ScheduleFrequency: data.settings?.ApiIntegrationSettings?.ScheduleFrequency
					};
				}

				if (followUpSettingUpdateModel.Source === 'Api') {
					followUpSettingUpdateModel.FileUploadSettings = {
						FileColumnFormat: data?.settings?.FileUploadSettings?.FileColumnFormat
							? JSON.parse(data.settings?.FileUploadSettings?.FileColumnFormat)
							: null,
						FileType: data.settings?.FileUploadSettings?.FileType,
						ReminderSchedule: data.settings?.FileUploadSettings?.ReminderSchedule
					};
				}
				edit = false;
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.log('This is error', error);
			toastMessage();
		} finally {
			isSubmitting = false;
		}
	};

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
				followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule[editingIndex] = {
					...newReminder
				};
			} else {
				followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule[editingIndex] = {
					...newReminder
				};
			}
			editingIndex = null;
		} else {
			if (followUpSettingUpdateModel.Source === 'Api') {
				followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule.push({
					...newReminder
				});
			} else {
				followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule.push({
					...newReminder
				});
			}
		}

		newReminder = {
			Type: 'PreviousDay',
			OffsetValue: undefined,
			OffsetUnit: 'hours',
			TimeOfDay: ''
		};

		showReminderModal = false;
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<SettingsPageHeader
				title="Follow-up Settings"
				description="Configure follow-up data source and reminder schedules."
				isEditing={edit}
				featureEnabled={isFollowupEnabled}
				{hasUnsavedChanges}
				closeHref={settingsRoute}
				onToggleEdit={handleToggleEdit}
				onCancelEdit={handleCancelEdit}
			/>
			<div class="flex flex-col space-y-4 px-5 py-4">
				<SettingsSection title="Data Source" description="Select the follow-up data source.">
					<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
						<label for="source" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
							Source
						</label>
						<div class="w-full md:w-[70%]">
							<select
								bind:value={followUpSettingUpdateModel.Source}
								class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
								disabled={!edit || !isFollowupEnabled}
							>
								<option value="None" selected>None</option>
								<option value="File">Files</option>
								<option value="Api">API</option>
							</select>
							{#if errors?.Source}
								<p class="text-error">{errors?.Source}</p>
							{/if}
						</div>
					</div>
				</SettingsSection>

				{#if followUpSettingUpdateModel.Source === 'File'}
					<SettingsSection title="File Upload Configuration" description="Configure file-based follow-up settings.">
						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-start">
							<label for="format" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Column Format <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<textarea
									cols="30"
									rows="6"
									bind:value={followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat}
									placeholder="Column format in JSON format"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									oninput={validateJSON}
									disabled={!edit}
								></textarea>
								{#if jsonError || errors?.FileUploadSettings?.FileColumnFormat}
									<p class="text-error">
										{jsonError || errors?.FileUploadSettings?.FileColumnFormat}
									</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="fileType" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								File Type <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={followUpSettingUpdateModel.FileUploadSettings.FileType}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								>
									<option value="" disabled selected>Select file type</option>
									<option value="csv">CSV</option>
									<option value="json">JSON</option>
									<option value="xlsx">Excel</option>
									<option value="xml">XML</option>
									<option value="txt">Text</option>
									<option value="pdf">PDF</option>
								</select>
								{#if errors?.FileUploadSettings?.FileType}
									<p class="text-error">{errors.FileUploadSettings.FileType}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="Schedule" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Reminder Schedules <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<button
									onclick={(event) => {
										event.preventDefault();
										showReminderModal = edit;
									}}
									disabled={!edit}
									class="table-btn variant-filled-secondary gap-1 text-[var(--color-info)]"
								>
									Add Schedule
								</button>
								{#if errors?.FileUploadSettings?.ReminderSchedule}
									<p class="text-error">{errors?.FileUploadSettings?.ReminderSchedule}</p>
								{/if}
							</div>
						</div>

						<ReminderScheduleList
							bind:reminderSchedule={
								followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule
							}
							{deleteSchedule}
							{editSchedule}
							{edit}
						/>
					</SettingsSection>
				{/if}

				{#if followUpSettingUpdateModel.Source === 'Api'}
					<SettingsSection title="Authentication Endpoint" collapsible={true} defaultOpen={false}>
						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="method" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								API Config Method
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Method}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								>
									<option value="" disabled selected>Select Method</option>
									<option value="GET">GET</option>
									<option value="POST">POST</option>
									<option value="PUT">PUT</option>
									<option value="DELETE">DELETE</option>
									<option value="PATCH">PATCH</option>
								</select>
								{#if errors?.ApiIntegrationSettings?.Auth?.Method}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Method}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="baseUrl" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								API Base URL
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Url}
									placeholder="Base URL"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.Url}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Url}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="requestBody" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Request Body
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Body}
									placeholder="Request Body"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.Body}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Body}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-start">
							<label for="queryParams" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Request Query Params
							</label>
							<div class="w-full md:w-[70%]">
								<FollowUpSettings
									bind:model={
										followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams
									}
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.QueryParams}
									<p class="text-error">
										{errors?.ApiIntegrationSettings?.Auth?.QueryParams}
									</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-start">
							<label for="headers" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Auth Query Headers
							</label>
							<div class="w-full md:w-[70%]">
								<FollowUpSettings
									bind:model={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers}
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.Headers}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Headers}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="tokenPath" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Token Path
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenPath}
									placeholder="Token path (e.g. data.token)"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.TokenPath}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.TokenPath}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="Responsetype" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Response Type
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.Auth.ResponseType
									}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								>
									<option value="" disabled selected>Select Response type</option>
									<option value="json">JSON</option>
									<option value="text">Text</option>
									<option value="form">Form</option>
									<option value="xml">XML</option>
								</select>
								{#if errors?.ApiIntegrationSettings?.Auth?.ResponseType}
									<p class="text-error">
										{errors?.ApiIntegrationSettings?.Auth?.ResponseType}
									</p>
								{/if}
							</div>
						</div>
					</SettingsSection>

					<SettingsSection title="API Fetch Configuration" collapsible={true} defaultOpen={false}>
						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="method" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								API Config Method <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Method}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								>
									<option value="" disabled selected>Select Fecth Method</option>
									<option value="GET">GET</option>
									<option value="POST">POST</option>
									<option value="PUT">PUT</option>
									<option value="DELETE">DELETE</option>
									<option value="PATCH">PATCH</option>
								</select>
								{#if errors?.ApiIntegrationSettings?.Fetch?.Method}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Method}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="url" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								URL <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Url}
									placeholder="Base URL"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Fetch?.Url}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Url}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-start">
							<label for="queryParams" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Request Query Params
							</label>
							<div class="w-full md:w-[70%]">
								<FollowUpSettings
									bind:model={
										followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams
									}
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Fetch?.QueryParams}
									<p class="text-error">
										{errors?.ApiIntegrationSettings?.Fetch?.QueryParams}
									</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="body" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Request Body
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Body}
									placeholder="Request Body"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Fetch?.Body}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Body}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-start">
							<label for="headers" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Query Headers
							</label>
							<div class="w-full md:w-[70%]">
								<FollowUpSettings
									bind:model={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers}
									disabled={!edit}
								/>
								{#if errors?.ApiIntegrationSettings?.Fetch?.Headers}
									<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Headers}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="requestType" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Response Type
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.ResponseType
									}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									disabled={!edit}
								>
									<option value="" disabled selected>Select Response type</option>
									<option value="json">JSON</option>
									<option value="text">Text</option>
									<option value="form">Form</option>
									<option value="xml">XML</option>
								</select>
								{#if errors?.ApiIntegrationSettings?.Fetch?.ResponseType}
									<p class="text-error">
										{errors?.ApiIntegrationSettings?.Fetch?.ResponseType}
									</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="responseField" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Response Field
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.ResponseField
									}
									disabled={!edit}
									placeholder="response field"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
								/>
								{#if errors?.ApiIntegrationSettings?.Fetch?.ResponseField}
									<p class="text-error">
										{errors.ApiIntegrationSettings?.Fetch?.ResponseField}
									</p>
								{/if}
							</div>
						</div>
					</SettingsSection>

					<SettingsSection title="Token Injection" collapsible={true} defaultOpen={false}>
						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="tokenLocation" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Location
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection
											.Location
									}
									disabled={!edit}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
								>
									<option value="" disabled={!edit} selected>Select Location</option>
									<option value="header">Header</option>
									<option value="query">Query</option>
									<option value="body">Body</option>
								</select>
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="tokenKey" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Key
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Key
									}
									disabled={!edit}
									placeholder="Token key"
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.TokenInjection?.Key}
									<p class="text-error">
										{errors.ApiIntegrationSettings?.Auth?.TokenInjection?.Key}
									</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="tokenPrefix" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Prefix
							</label>
							<div class="w-full md:w-[70%]">
								<input
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Prefix
									}
									disabled={!edit}
									placeholder="Token prefix "
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
								/>
								{#if errors?.ApiIntegrationSettings?.Auth?.TokenInjection?.Prefix}
									<p class="text-error">
										{errors.ApiIntegrationSettings?.Auth?.TokenInjection?.Prefix}
									</p>
								{/if}
							</div>
						</div>
					</SettingsSection>

					<SettingsSection title="Schedule & Reminders">
						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="source" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Schedule Frequency <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<select
									bind:value={
										followUpSettingUpdateModel.ApiIntegrationSettings.ScheduleFrequency
									}
									disabled={!edit}
									class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
								>
									<option value="" disabled selected>Select Schedule Frequency</option>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
								</select>
								{#if errors?.ApiIntegrationSettings?.ScheduleFrequency}
									<p class="text-error">{errors.ApiIntegrationSettings?.ScheduleFrequency}</p>
								{/if}
							</div>
						</div>

						<div class="my-4 flex flex-col gap-2 md:flex-row md:items-center">
							<label for="schedule" class="mx-1 w-full font-medium text-[var(--color-info)] md:w-[30%]">
								Reminder Schedules <span class="text-red-700">*</span>
							</label>
							<div class="w-full md:w-[70%]">
								<button
									onclick={(event) => {
										event.preventDefault();
										showReminderModal = edit;
									}}
									class="table-btn variant-filled-secondary gap-1 text-[var(--color-info)]"
								>
									Add Schedule
								</button>
								{#if errors?.ApiIntegrationSettings?.ReminderSchedule}
									<p class="text-error">{errors.ApiIntegrationSettings.ReminderSchedule}</p>
								{/if}
							</div>
						</div>

						<ReminderScheduleList
							bind:reminderSchedule={
								followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule
							}
							{deleteSchedule}
							{editSchedule}
							{edit}
						/>
					</SettingsSection>
				{/if}
			</div>

			<SettingsFooter isEditing={edit} {isSubmitting} onCancel={handleCancelEdit} />
		</form>
	</div>
</div>

{#if showReminderModal}
	<ReminderScheduleForm bind:showReminderModal bind:newReminder {addSchedule} />
{/if}
