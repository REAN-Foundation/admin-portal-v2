<script lang="ts">
	import { page } from '$app/state';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store.js';
	import type { ReminderTrigger } from '$lib/types/tenant.settings.types.js';
	import { FollowupSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import ReminderScheduleList from './reminder-schedule-list.svelte';
	import ReminderScheduleForm from './reminder-schedule-form.svelte';
	import FollowUpSettings from './follow-up-settings.svelte';

	///////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;

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
	let openTab: string | null = $state(null);
	let jsonError = $state('');

	let isFollowupEnabled = $state(data.isFollowupEnabled);

	$inspect('isFollowupEnabled', isFollowupEnabled);

	let edit = $state(false);
	$inspect('edit', edit);

	const handleEditClick = async () => {
		if (!isFollowupEnabled) {
			addToast({
				message: 'This setting is disabled. Please update it from the main settings.',
				type: 'info',
				timeout: 3000
			});
			return;
		}

		if (!edit) {
			addToast({
				message: 'Edit mode enabled.',
				type: 'info',
				timeout: 3000
			});
			edit = true;
		} else {
			addToast({
				message: 'Edit mode disabled.',
				type: 'info',
				timeout: 3000
			});
			edit = false;
		}
	};

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}

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
					type: 'info',
					timeout: 3000
				});
				return;
			}
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

<div class="px-5 py-4 ">
	<div class="mx-auto my-6 border border-[var(--color-outline)] ">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6">
				<h1 class=" text-xl text-[var(--color-info)]">Follow-up Settings</h1>
				<div class="flex items-center gap-2 text-end">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" />
						<!-- <span>{edit ? 'Save' : 'Edit'}</span> -->
					</button>
					<a
						href={tenantRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
					>
						<Icon icon="material-symbols:close-rounded" class=" h-5" />
					</a>
				</div>
			</div>
			<div class="flex flex-col space-y-4">
				<table class="table-c">
					<thead>
					</thead>
					<tbody>
						<tr>
							<td
								><label for="source" class="flex items-center space-x-2 text-[var(--color-info)]">
									<span class="text-sm ">Source</span>
								</label></td
							>

							{#if isFollowupEnabled && edit}
								<td>
									<select
										bind:value={followUpSettingUpdateModel.Source}
										class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									>
										<option value="None" selected>None</option>
										<option value="File">Files</option>
										<option value="Api">API</option>
									</select>
									{#if errors?.Source}
										<p class="text-error">{errors?.Source}</p>
									{/if}
								</td>
							{:else}
								<td>
									<select
										bind:value={followUpSettingUpdateModel.Source}
										class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
										disabled={!edit}
									>
										<option value="None" selected>None</option>
										<option value="File">Files</option>
										<option value="Api">API</option>
									</select>
									{#if errors?.Source}
										<p class="text-error">{errors?.Source}</p>
									{/if}
								</td>
							{/if}
						</tr>
						{#if followUpSettingUpdateModel.Source === 'File' || followUpSettingUpdateModel.Source === 'Api'}
							{#if followUpSettingUpdateModel.Source === 'File'}
								<tr>
									<td>
										<label for="format" class="text-sm text-[var(--color-info)]"
											>Column Format
											<span class="text-red-700">*</span>
										</label>
									</td>
									<td>
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
										<!-- {#if errors?.FileUploadSettings.FileColumnFormat}
												<p class="text-error">{FileUploadSettings.FileColumnFormat}</p>
											{/if} -->
									</td>
								</tr>

								<tr>
									<td>
										<label for="fileType" class="text-[var(--color-info)]"
											>File Type <span class="text-red-700">*</span></label
										>
									</td>
									<td>
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
										<!-- {#if errors?.FileUploadSettings}
												<p class="text-error">{errors?.FileUploadSettings}</p>
											{/if} -->
										{#if errors?.FileUploadSettings?.FileType}
											<p class="text-error">{errors.FileUploadSettings.FileType}</p>
										{/if}
									</td>
								</tr>
								<tr>
									<td>
										<label for="Schedule" class="text-[var(--color-info)]">
											Reminder Schedules <span class="text-red-700">*</span></label
										>
									</td>
									<td>
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
									</td>
								</tr>

								<ReminderScheduleList
									bind:reminderSchedule={
										followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule
									}
									{deleteSchedule}
									{editSchedule}
									{edit}
								/>
							{/if}

							{#if followUpSettingUpdateModel.Source === 'Api'}
								<tr class="bg-gray-100">
									<td class="">
										<label for="source" class="text-sm font-semibold text-[var(--color-info)]"
											>Authentication Endpoint</label
										>
									</td>
									<td>
										<button
											class="flex w-full items-center justify-between"
											type="button"
											onclick={() => toggleTab('auth')}
										>
											<span
												class="ml-auto transition-transform duration-300"
												class:rotate-180={openTab === 'auth'}
											>
												<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
											</span>
										</button>
									</td>
								</tr>

								{#if openTab === 'auth'}
									<tr>
										<td>
											<!-- <div class="space-y-2">
										<div class="flex flex-row"> -->
											<label for="method" class="text-[var(--color-info)]"> API Config Method </label>
											<!-- </div> -->
										</td>

										<td>
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
										</td>
									</tr>
									<tr>
										<td>
										<label for="baseUrl" class="text-[var(--color-info)]">API Base URL </label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Url}
												placeholder="Base URL"
												class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.Url}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Url}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<!-- <div class="flex flex-row"> -->
											<label for="requestBody" class="text-[var(--color-info)]"> Request Body </label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Body}
												placeholder="Request Body"
												class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.Body}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Body}</p>
											{/if}
										</td>
										<!-- </div> -->
									</tr>
									<tr>
										<td>
											<label for="queryParams" class="text-[var(--color-info)]"
												>Request Query Params</label
											>
										</td>
										<td>
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
										</td>
									</tr>

									<tr>
										<td>
											<label for="headers" class="text-[var(--color-info)]">Auth Query Headers</label>
										</td>
										<td>
											<FollowUpSettings
												bind:model={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers}
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.Headers}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Headers}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<label for="tokenPath" class="text-[var(--color-info)]">Token Path </label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenPath}
												placeholder="Token path (e.g. data.token)"
												class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.TokenPath}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.TokenPath}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<label for="Responsetype" class="text-[var(--color-info)]">
												Response Type
											</label>
										</td>
										<td>
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
										</td>
									</tr>
								{/if}

								<tr class="cursor-pointer bg-gray-100">
									<td>
										<label for="fetchconfig" class="text-sm font-semibold text-[var(--color-info)]"
											>API Fetch Configuration</label
										>
									</td>
									<td>
										<button
											class="flex w-full items-center justify-between"
											type="button"
											onclick={() => toggleTab('fetch')}
										>
											<span
												class="ml-auto transition-transform duration-300"
												class:rotate-180={openTab === 'fetch'}
											>
												<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
											</span>
										</button>
									</td>
								</tr>

								{#if openTab === 'fetch'}
									<tr>
										<td>
											<label for="method text-[var(--color-info)]" class="text-[var(--color-info)]"
												>API Config Method <span class="text-red-700">*</span></label
											>
										</td>
										<td>
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
										</td>
									</tr>
									<tr>
										<td>
											<label for="url" class="text-[var(--color-info)]">
												URL <span class="text-red-700">*</span></label
											>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Url}
												placeholder="Base URL"
												class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.Url}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Url}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="queryParams" class="text-[var(--color-info)]"
												>Request Query Params</label
											>
										</td>
										<td>
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
										</td>
									</tr>
									<tr>
										<td>
											<label for="body" class="text-[var(--color-info)]"> Request Body</label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Body}
												placeholder="Request Body"
												class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.Body}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Body}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="headers" class="text-[var(--color-info)]">Query Headers </label>
										</td>
										<td>
											<FollowUpSettings
												bind:model={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers}
												disabled={!edit}
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.Headers}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Headers}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="requestType" class="text-[var(--color-info)]"> Response Type</label>
										</td>
										<td>
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
										</td>
									</tr>
									<tr>
										<td>
											<label for="responseField" class="text-[var(--color-info)]">
												Response Field</label
											>
										</td>
										<td>
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
										</td>
									</tr>
								{/if}

								<tr class="cursor-pointer bg-gray-100">
									<td class=" py-5">
										<label for="Token" class="font-semibold text-[var(--color-info)]">
											Token Injection</label
										>
									</td>
									<td>
										<button
											class="flex w-full items-center justify-between"
											type="button"
											onclick={() => toggleTab('token')}
										>
											<span
												class="ml-auto transition-transform duration-300"
												class:rotate-180={openTab === 'token'}
											>
												<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
											</span>
										</button>
									</td>
								</tr>
								{#if openTab === 'token'}
									<tr>
										<td>
											<label for="tokenLocation" class="text-[var(--color-info)]"
												>Location <span class="text-red-700"></span></label
											>
										</td>
										<td>
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
											<!-- {#if errors?.ApiIntegrationSettings?.Auth.TokenInjection.Location}
													<p class="text-error">
														{errors.ApiIntegrationSettings.Auth.TokenInjection.Location}
													</p>
												{/if} -->
										</td>
									</tr>
									<tr>
										<td>
											<label for="tokenKey" class="text-[var(--color-info)]">
												Key <span class="text-red-700"></span></label
											>
										</td>
										<td>
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
										</td>
									</tr>
									<tr>
										<td>
											<label for="tokenPrefix" class="text-[var(--color-info)]"> Prefix </label>
										</td>
										<td>
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
										</td>
									</tr>
								{/if}

								<tr>
									<td>
										<label for="source" class="text-[var(--color-info)]"
											>Schedule Frequency <span class="text-red-700">*</span></label
										>
									</td>
									<td>
										<div class="space-y-2">
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
									</td>
								</tr>
								<tr>
									<td>
										<label for="schedule" class="text-[var(--color-info)]">
											Reminder Schedules <span class="text-red-700">*</span>
										</label>
									</td>
									<td>
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
									</td>
								</tr>

								<ReminderScheduleList
									bind:reminderSchedule={
										followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule
									}
									{deleteSchedule}
									{editSchedule}
									{edit}
								/>
							{/if}
						{/if}
					</tbody>
				</table>
			</div>
			<hr class="border-t border-[0.5px] border-[var(--color-outline)]" />
			<div class="button-container my-4">
				{#await promise}
					<Button type="submit" variant="primary" size="md" text="Submitting..." disabled={true} />
				{:then data}
					<Button type="submit" variant="primary" size="md" text="Submit" />
				{/await}
			</div>
		</form>
	</div>
</div>

{#if showReminderModal}
	<ReminderScheduleForm bind:showReminderModal bind:newReminder {addSchedule} />
{/if}
