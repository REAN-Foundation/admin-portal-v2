<script lang="ts">
	import { page } from '$app/state';
	import FollowUpSettings from '$lib/components/follow-up-settings.svelte';
	import ReminderScheduleForm from '$lib/components/reminder-schedule-form.svelte';
	import ReminderScheduleList from '$lib/components/reminder-schedule-list.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { ReminderTrigger } from '$lib/types/tenant.settings.types.js';
	import { FollowupSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import Icon from '@iconify/svelte';

	///////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let promise = $state();
	let errors = $state({});


	const userId = page.params.userId;

	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants/${tenantId}/settings/followup-setting`;
	let reminderSchedules: ReminderTrigger[] = $state([]);
	let followUpSettingUpdateModel = $state({
		Source: data.settings.Source,
		// FileUploadSettings:{},
		FileUploadSettings: {
			// FileUploadConfig: {
			FileColumnFormat: data.settings.FileUploadSettings?.FileColumnFormat,
			FileType: data.settings.FileUploadSettings?.FileType,
			ReminderSchedule: data.settings.FileUploadSettings?.ReminderSchedule
			// }
		},
		ApiIntegrationSettings: {
			Auth: {
				Method: data.settings.ApiIntegrationSettings?.Auth?.Method,
				Url: data.settings.ApiIntegrationSettings?.Auth?.Url,
				Body: data.settings.ApiIntegrationSettings?.Auth?.Body,
				QueryParams: data.settings.ApiIntegrationSettings?.Auth?.QueryParams || {},
				Headers: data.settings.ApiIntegrationSettings?.Auth?.Headers || {},
				TokenPath: data.settings.ApiIntegrationSettings?.Auth?.TokenPath,
				ResponseType: data.settings.ApiIntegrationSettings?.Auth?.ResponseType,
				TokenInjection: {
					Location: data.settings.ApiIntegrationSettings?.Auth?.TokenInjection.Location,
					Key: data.settings.ApiIntegrationSettings?.Auth?.TokenInjection.Key,
					Prefix: data.settings.ApiIntegrationSettings?.Auth?.TokenInjection.Prefix
				}
			},
			Fetch: {
				Method: data.settings.ApiIntegrationSettings?.Fetch.Method,
				Url: data.settings.ApiIntegrationSettings?.Fetch.Url,
				QueryParams: data.settings.ApiIntegrationSettings?.Fetch?.QueryParams || {},
				Body: data.settings.ApiIntegrationSettings?.Fetch.Body,
				Headers: data.settings.ApiIntegrationSettings?.Fetch?.Headers || {},
				ResponseType: data.settings.ApiIntegrationSettings?.Fetch.ResponseType,
				ResponseField: data.settings.ApiIntegrationSettings?.Fetch.ResponseField
			},
			ReminderSchedule: data.settings.ApiIntegrationSettings?.ReminderSchedule,
			ScheduleFrequency: data.settings.ApiIntegrationSettings?.ScheduleFrequency
		}
	});

	function setNestedError(obj: any, path: (string | number)[], value: string) {
		let current = obj;
		for (let i = 0; i < path.length - 1; i++) {
			const key = path[i];
			if (typeof key === 'number') {
				// If key is an array index, ensure the array exists
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
			errors = {};

			if (followUpSettingUpdateModel.Source === 'Api') {
				// followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule = reminderSchedules;
				followUpSettingUpdateModel.FileUploadSettings = undefined;
			}
			if (followUpSettingUpdateModel.Source === 'File') {
				// followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule = reminderSchedules;
				followUpSettingUpdateModel.ApiIntegrationSettings = undefined;
			}

			console.log('FollowUp Setting UpdateModel:', followUpSettingUpdateModel);
			const validationResult = FollowupSettingsSchema.safeParse(followUpSettingUpdateModel);
			console.log('Validation Result:', validationResult);
			// const validationResult = FollowupSettingsSchema.safeParse(followUpSettingUpdateModel);

			if (!validationResult.success) {
				// console.log('Raw Zod Errors:', validationResult.error.errors);

				
				for (const err of validationResult.error.errors) {
					setNestedError(errors, err.path as string[], err.message);
				}

				// console.log('Parsed Errors:', errors);
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
				// goto(`${labRecordTypesRoute}/${response?.Data?.LabRecordType?.id}/view`);
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

	let disabled = $state(true);
	let edit = $derived(disabled);

	let showReminderModal = $state(false);

	let newReminder: ReminderTrigger = $state({
		Type: 'PreviousDay',
		OffsetValue: undefined,
		OffsetUnit: 'hours',
		TimeOfDay: ''
	});

	let editingIndex: number | null = null;

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
		console.log('New Reminder:', newReminder);

		// Safety: Ensure ReminderSchedule array is initialized
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
			// update existing schedule
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
			// add new one
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

		// Reset
		newReminder = {
			Type: 'PreviousDay',
			OffsetValue: undefined,
			OffsetUnit: 'hours',
			TimeOfDay: ''
		};

		showReminderModal = false;
	};

	let openTab: string | null = $state(null);

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}
	let jsonInput = $derived(followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat);
	let jsonError = $state('');

	function validateJSON() {
		try {
			JSON.parse(followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat);
			jsonError = '';
		} catch (error) {
			jsonError = 'Invalid JSON format';
		}
	}
</script>

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<button
			class="table-btn variant-filled-secondary gap-1"
			onclick={() => {
				disabled = !disabled;
				edit = disabled;
			}}
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</button>
	</div>
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th class="w-[30%]">Follow-Up Setting</th>
							<th class="w-[70%] text-end">
								<a href={tenantRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td
								><label for="source" class="flex items-center space-x-2">
									<span class="text-sm">Source</span>
								</label></td
							>
							<td>
								<select
									bind:value={followUpSettingUpdateModel.Source}
									class="w-full rounded border p-2 text-sm"
								>
									<option value="None" selected>None</option>
									<option value="File">Files</option>
									<option value="Api">API</option>
								</select>
								{#if errors?.Source}
									<p class="text-error">{errors?.Source}</p>
								{/if}
							</td>
						</tr>
						{#if followUpSettingUpdateModel.Source === 'File' || followUpSettingUpdateModel.Source === 'Api'}
							{#if followUpSettingUpdateModel.Source === 'File'}
								<tr>
									<td>
										<label for="format" class="text-sm">File Column Format</label>
									</td>
									<td>
										<textarea
											cols="30"
											bind:value={followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat}
											placeholder="File column format in JSON format"
											class="w-full rounded border p-2 text-sm"
											oninput={validateJSON}
										></textarea>

										{#if jsonError}
											<p class="text-error">{jsonError}</p>
										{/if}
										<!-- {#if errors?.FileUploadSettings.FileColumnFormat}
											<p class="text-error">{FileUploadSettings.FileColumnFormat}</p>
										{/if} -->
									</td>
								</tr>

								<tr>
									<td>
										<label for="fileType" class=""
											>File Type <span class="text-red-700">*</span></label
										>
									</td>
									<td>
										<select
											bind:value={followUpSettingUpdateModel.FileUploadSettings.FileType}
											class="w-full rounded border p-2 text-sm"
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
										<label for="schedule">
											Reminder Schedules <span class="text-red-700">*</span></label
										>
									</td>
									<td>
										<button
											onclick={(event) => {
												event.preventDefault();
												showReminderModal = true;
											}}
											class="table-btn variant-filled-secondary gap-1"
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
								/>
							{/if}

							{#if followUpSettingUpdateModel.Source === 'Api'}
								<tr class="bg-gray-100">
									<td class="">
										<label for="source" class="text-sm font-semibold">Authentication Endpoint</label
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
												<Icon
													icon="icon-park-outline:down"
													width="16"
													height="16"
													class="h-5 w-5"
												/>
											</span>
										</button>
									</td>
								</tr>

								{#if openTab === 'auth'}
									<tr>
										<td>
											<!-- <div class="space-y-2">
									<div class="flex flex-row"> -->
											<label for="method"
												>API Config Method <span class="text-red-700">*</span></label
											>
											<!-- </div> -->
										</td>

										<td>
											<select
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Method}
												class="w-full rounded border p-2 text-sm"
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
											<label for="baseUrl">API Base URL <span class="text-red-700">*</span></label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Url}
												placeholder="Base URL"
												class="w-full rounded border p-2 text-sm"
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.Url}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Url}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<!-- <div class="flex flex-row"> -->
											<label for="requestBody"> Request Body </label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Body}
												placeholder="Request Body"
												class="w-full rounded border p-2 text-sm"
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.Body}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Body}</p>
											{/if}
										</td>
										<!-- </div> -->
									</tr>
									<tr>
										<td>
											<label for="queryParams">Request Query Params</label>
										</td>
										<td>
											<FollowUpSettings
												bind:model={
													followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams
												}
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.QueryParams}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.QueryParams}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<label for="headers">Auth Query Headers</label>
										</td>
										<td>
											<FollowUpSettings
												bind:model={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Headers}
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.Headers}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.Headers}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<label for="tokenPath">Token Path <span class="text-red-700">*</span></label>
										</td>
										<td>
											<input
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenPath
												}
												placeholder="Token path (e.g. data.token)"
												class="w-full rounded border p-2 text-sm"
											/>
											{#if errors?.ApiIntegrationSettings?.Auth?.TokenPath}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.TokenPath}</p>
											{/if}
										</td>
									</tr>

									<tr>
										<td>
											<label for="Responsetype">
												Response Type <span class="text-red-700">*</span></label
											>
										</td>
										<td>
											<select
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Auth.ResponseType
												}
												class="w-full rounded border p-2 text-sm"
											>
												<option value="" disabled selected>Select Response type</option>
												<option value="json">JSON</option>
												<option value="text">Text</option>
												<option value="form">Form</option>
												<option value="xml">XML</option>
											</select>
											{#if errors?.ApiIntegrationSettings?.Auth?.ResponseType}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Auth?.ResponseType}</p>
											{/if}
										</td>
									</tr>
								{/if}

								<tr class="cursor-pointer bg-gray-100">
									<td>
										<label for="fetchconfig" class="text-sm font-semibold"
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
												<Icon
													icon="icon-park-outline:down"
													width="16"
													height="16"
													class="h-5 w-5"
												/>
											</span>
										</button>
									</td>
								</tr>

								{#if openTab === 'fetch'}
									<tr>
										<td>
											<label for="method"
												>API Config Method <span class="text-red-700">*</span></label
											>
										</td>
										<td>
											<select
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Method}
												class="w-full rounded border p-2 text-sm"
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
											<label for="url"> URL <span class="text-red-700">*</span></label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Url}
												placeholder="Base URL"
												class="w-full rounded border p-2 text-sm"
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.Url}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Url}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="queryParams">Request Query Params</label>
										</td>
										<td>
											<FollowUpSettings
												bind:model={
													followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams
												}
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.QueryParams}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.QueryParams}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="body"> Request Body</label>
										</td>
										<td>
											<input
												bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Body}
												placeholder="Request Body"
												class="w-full rounded border p-2 text-sm"
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.Body}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Body}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="headers">Query Headers </label>
										</td>
										<td>
											<FollowUpSettings
												bind:model={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers}
											/>
											{#if errors?.ApiIntegrationSettings?.Fetch?.Headers}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.Headers}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="requestType"> Response Type</label>
										</td>
										<td>
											<select
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.ResponseType
												}
												class="w-full rounded border p-2 text-sm"
											>
												<option value="" disabled selected>Select Response type</option>
												<option value="json">JSON</option>
												<option value="text">Text</option>
												<option value="form">Form</option>
												<option value="xml">XML</option>
											</select>
											{#if errors?.ApiIntegrationSettings?.Fetch?.ResponseType}
												<p class="text-error">{errors?.ApiIntegrationSettings?.Fetch?.ResponseType}</p>
											{/if}
										</td>
									</tr>
									<tr>
										<td>
											<label for="responseField"> Response Field</label>
										</td>
										<td>
											<input
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.ResponseField
												}
												placeholder="response field"
												class="w-full rounded border p-2 text-sm"
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
										<label for="Token" class="font-semibold"> Token Injection</label>
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
												<Icon
													icon="icon-park-outline:down"
													width="16"
													height="16"
													class="h-5 w-5"
												/>
											</span>
										</button>
									</td>
								</tr>
								{#if openTab === 'token'}
									<tr>
										<td>
											<label for="tokenLocation">Location <span class="text-red-700">*</span></label
											>
										</td>
										<td>
											<select
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection
														.Location
												}
												class="w-full rounded border p-2 text-sm"
											>
												<option value="" disabled selected>Select Location</option>
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
											<label for="tokenKey"> Key <span class="text-red-700">*</span></label>
										</td>
										<td>
											<input
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Key
												}
												placeholder="Token key"
												class="w-full rounded border p-2 text-sm"
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
											<label for="tokenPrefix"> Prefix </label>
										</td>
										<td>
											<input
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection
														.Prefix
												}
												placeholder="Token prefix "
												class="w-full rounded border p-2 text-sm"
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
										<label for="source"
											>Schedule Frequency <span class="text-red-700">*</span></label
										>
									</td>
									<td>
										<div class="space-y-2">
											<select
												bind:value={
													followUpSettingUpdateModel.ApiIntegrationSettings.ScheduleFrequency
												}
												class="w-full rounded border p-2 text-sm"
											>
												<option value="" disabled selected>Select Schedule Frequency</option>
												<option value="daily">Daily</option>
												<option value="weekly">Weekly</option>
												<option value="monthly">Monthly</option>
											</select>
											{#if errors?.ApiIntegrationSettings?.ScheduleFrequency}
												<p class="text-error">{errors.ApiIntegrationSettings.ScheduleFrequency}</p>
											{/if}
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<label for="schedule">
											Reminder Schedules <span class="text-red-700">*</span>
										</label>
									</td>
									<td>
										<button
											onclick={(event) => {
												event.preventDefault();
												showReminderModal = true;
											}}
											class="table-btn variant-filled-secondary gap-1"
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
								/>
							{/if}
						{/if}
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-filled-secondary gap-1" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-filled-secondary gap-1"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
{#if showReminderModal}
	<ReminderScheduleForm bind:showReminderModal bind:newReminder {addSchedule} />
{/if}
