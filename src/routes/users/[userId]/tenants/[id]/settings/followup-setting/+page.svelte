<script lang="ts">
	import { page } from '$app/state';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { ReminderTrigger } from '$lib/types/tenant.settings.types.js';
	import { FollowupSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import Icon from '@iconify/svelte';
	import { preventDefault } from 'svelte/legacy';
	import { fade, fly } from 'svelte/transition';

	let { data, form } = $props();
	let promise = $state();
	let errors: Record<string, string> = $state({});
	// $inspect(errors, 'errors');

	const userId = page.params.userId;

	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants/${tenantId}/settings/followup-setting`;
	let reminderSchedules: ReminderTrigger[] = $state([]);
	let followUpSettingUpdateModel = $state({
		Source: 'Api',
		// FileUploadSettings:{},
		FileUploadSettings: {
			// FileUploadConfig: {
			FileColumnFormat: '',
			FileType: '',
			ReminderSchedule: []
			// }
		},
		ApiIntegrationSettings: {
			Auth: {
				Method: '',
				Url: '',
				Body: '',
				QueryParams: {},
				Headers: {},
				TokenPath: '',
				ResponseType: '', // 'json', 'text', 'form', 'xml'
				TokenInjection: {
					Location: '',
					Key: '',
					Prefix: ''
				}
			},
			Fetch: {
				Method: '',
				Url: '',
				QueryParams: {},
				Body: '',
				Headers: {},
				ResponseType: '', // 'json', 'text', 'form', 'xml'
				ResponseField: ''
			},
			ReminderSchedule: [],
			ScheduleFrequency: ''
		}

		// Source: followUpSettingUpdateModel.Source,
		// FileUploadSettings: {
		// 	FileColumnFormat: fileColumnFormat,
		// 	FileType: selectedFileType,
		// 	ReminderSchedules: reminderSchedules
		// },
		// ApiIntegrationSettings: {
		// 	Auth: {
		// 		Method: authMethod,
		// 		Url: authUrl,
		// 		Body: authBody,
		// 		QueryParams: authQueryParams,
		// 		Headers: authHeaders,
		// 		TokenPath: authTokenPath,
		// 		ResponseType: authResponseType,
		// 		TokenInjection: {
		// 			Location: authTokenLocation,
		// 			Key: authTokenKey,
		// 			Prefix: authTokenPrefix
		// 		}
		// 	},
		// 	Fetch: {
		// 		Method: apiFetchMethod,
		// 		Url: apiFetchUrl,
		// 		QueryParams: apiFetchQueryParams,
		// 		Body: apiFetchBody,
		// 		Headers: authHeaders,
		// 		ResponseType: apiFetchResponseType,
		// 		ResponseField: responseField
		// 	},
		// 	ReminderSchedule: reminderSchedules,
		// 	ScheduleFrequency: scheduleFrequency
	});
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			console.log('FollowUpSettingUpdateModel:', followUpSettingUpdateModel);

			const validationResult = FollowupSettingsSchema.safeParse(followUpSettingUpdateModel);
			console.log('Validation Result:', validationResult);

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

	let newParamKey = $state('');
	let newParamValue = $state('');

	// Ensure QueryParams is initialized as an object
	if (!followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams) {
		followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams = {};
	}

	function addQueryParam() {
		if (newParamKey && newParamValue) {
			// clone existing object to trigger reactivity
			followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams = {
				...followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams,
				[newParamKey]: newParamValue
			};

			// reset inputs
			newParamKey = '';
			newParamValue = '';
		}
	}
	function removeQueryParam(key: string) {
		const current = { ...followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams };
		delete current[key];
		followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams = current;
	}

	let inputMap = {
	'Auth.QueryParams': { key: '', value: '' },
	'Auth.Headers': { key: '', value: '' },
	'Fetch.QueryParams': { key: '', value: '' },
	'Fetch.Headers': { key: '', value: '' }
};

function ensurePath(path: string) {
	const parts = path.split('.');
	let obj = followUpSettingUpdateModel.ApiIntegrationSettings;
	for (let i = 0; i < parts.length - 1; i++) {
		obj = obj[parts[i]] ||= {};
	}
	obj[parts[parts.length - 1]] ||= {};
}

function addKeyValue(path: string) {
	ensurePath(path);
	const { key, value } = inputMap[path];
	if (key && value) {
		const parts = path.split('.');
		let obj = followUpSettingUpdateModel.ApiIntegrationSettings;
		for (let i = 0; i < parts.length - 1; i++) {
			obj = obj[parts[i]];
		}
		const final = parts[parts.length - 1];

		obj[final] = {
			...obj[final],
			[key]: value
		};

		inputMap[path] = { key: '', value: '' };
	}
}

function removeKeyValue(path: string, key: string) {
	const parts = path.split('.');
	let obj = followUpSettingUpdateModel.ApiIntegrationSettings;
	for (let i = 0; i < parts.length - 1; i++) {
		obj = obj[parts[i]];
	}
	const final = parts[parts.length - 1];
	const copy = { ...obj[final] };
	delete copy[key];
	obj[final] = copy;
}

function getObject(path: string) {
	const parts = path.split('.');
	let obj = followUpSettingUpdateModel.ApiIntegrationSettings;
	for (const part of parts) {
		if (!obj) return null;
		obj = obj[part];
	}
	return obj;
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
							<th class="w-[30%]">Appointment Follow-Up Setting</th>
							<th class="w-[70%] text-end">
								<a href={tenantRoute} class="health-system-btn variant-soft-secondary">
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
									<option value="File">Upload Schedule Files</option>
									<option value="Api">Integrate Schedule API</option>
								</select>
								{#if errors?.Source}
									<p class="text-error">{errors?.Source}</p>
								{/if}
							</td>
						</tr>
						{#if followUpSettingUpdateModel.Source === 'File'}
							<tr>
								<td>
									<label for="format" class="text-sm font-medium"
										>File column format <span class="text-red-700">*</span></label
									>
								</td>
								<td>
									<input
										bind:value={followUpSettingUpdateModel.FileUploadSettings.FileColumnFormat}
										placeholder="Base URL"
										class="w-full rounded border p-2 text-sm"
									/>
									{#if errors?.FileColumnFormat}
										<p class="text-error">{errors?.FileColumnFormat}</p>
									{/if}
								</td>
							</tr>
							<!-- <tr>
								<td colspan="2">
									<div class="space-y-4">
										<div class=" flex">
											<label for="format" class="text-sm font-medium"
												>File column format <span class="text-red-700">*</span></label
											>
											<span class="mx-auto text-xs text-gray-500">JSON</span>
										</div>
										<textarea
											bind:value={
												followUpSettingUpdateModel.FileUploadSettings.FileUploadConfig
													.FileColumnFormat
											}
											rows="4"
											class="w-full resize-none rounded border p-2 text-sm"
										></textarea>
									</div>
								</td>
							</tr> -->
						{/if}

						{#if followUpSettingUpdateModel.Source === 'Api'}
							<tr>
								<td colspan="2">
									<label for="source" class="text-sm font-semibold">Authentication Endpoint</label>
								</td>
							</tr>
							<tr>
								<td>
									<!-- <div class="space-y-2">
									<div class="flex flex-row"> -->
									<label for="method">API Config Method <span class="text-red-700">*</span></label>
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
									{#if errors?.ApiIntegrationSettings}
										<p class="text-error">{errors?.ApiIntegrationSettings}</p>
									{/if}
								</td>
							</tr><tr>
								<td>
									<label for="baseUrl">API Base URL <span class="text-red-700">*</span></label>
								</td>
								<td>
									<input
										bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.Url}
										placeholder="Base URL"
										class="w-full rounded border p-2 text-sm"
									/>
									{#if errors?.Url}
										<p class="text-error">{errors?.Url}</p>
									{/if}
								</td>
							</tr>
							<!-- </div> -->
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
									{#if errors?.Body}
										<p class="text-error">{errors?.Body}</p>
									{/if}
								</td>
								<!-- </div> -->
							</tr>
							<tr>
								<td>
									<label for="queryParams">Request Query Params</label>
								</td>
								<td>
									<!-- Add button -->

									<!-- Inputs -->
									<div class="mb-2 flex gap-2">
										<input
											placeholder="Key"
											class="w-1/2 rounded border p-2 text-sm"
											bind:value={newParamKey}
										/>
										<input
											placeholder="Value"
											class="w-1/2 rounded border p-2 text-sm"
											bind:value={newParamValue}
										/>
									</div>

									<!-- List of added key-value pairs -->
									{#if followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams}
										{#each Object.entries(followUpSettingUpdateModel.ApiIntegrationSettings.Auth.QueryParams) as [key, value]}
											<div
												class="mb-1 flex items-center justify-between rounded border bg-gray-50 px-2 py-1 text-sm"
											>
												<span class="truncate">{key}: {value}</span>
												<button
													class="text-xs text-red-500 hover:underline"
													onclick={(event) => {
														event.preventDefault();
														removeQueryParam(key);
													}}
												>
													Remove
												</button>
											</div>
										{/each}
									{/if}
									<button
										class="mb-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
										onclick={addQueryParam}
									>
										Add Param
									</button>
								</td>
							</tr>
						
							<tr>
								<td>
									<label>Auth Query Params</label>
								</td>
								<td>
									<button
										type="button"
										onclick={() => addKeyValue('Auth.QueryParams')}
										class="mb-2 rounded bg-blue-500 px-3 py-1 text-white text-sm hover:bg-blue-600"
									>
										Add Param
									</button>
							
									<div class="flex gap-2 mb-2">
										<input
											placeholder="Key"
											class="w-1/2 rounded border p-2 text-sm"
											bind:value={inputMap['Auth.QueryParams'].key}
										/>
										<input
											placeholder="Value"
											class="w-1/2 rounded border p-2 text-sm"
											bind:value={inputMap['Auth.QueryParams'].value}
										/>
									</div>
							
									{#each Object.entries(getObject('Auth.QueryParams') || {}) as [key, value]}
										<div class="flex justify-between items-center text-sm mb-1 border rounded px-2 py-1 bg-gray-50">
											<span>{key}: {value}</span>
											<button
												type="button"
												class="text-xs text-red-500 hover:underline"
												onclick={() => removeKeyValue('Auth.QueryParams', key)}
											>
												Remove
											</button>
										</div>
									{/each}
								</td>
							</tr>
							
							<tr>
								<td>
									<label for="tokenPath">Token Path</label>
								</td>
								<td>
									<input
										bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenPath}
										placeholder="Token path (e.g. data.token)"
										class="w-full rounded border p-2 text-sm"
									/>
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
										bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Auth.ResponseType}
										class="w-full rounded border p-2 text-sm"
									>
										<option value="" disabled selected>Select Response type</option>
										<option value="json">JSON</option>
										<option value="text">Text</option>
										<option value="form">Form</option>
										<option value="xml">XML</option>
									</select>
								</td>
							</tr>

							<tr class=" ">
								<td colspan="2" class=" py-5">
									<label for="Token" class="font-semibold"> Token Injection</label>
								</td>
							</tr>
							<tr>
								<td>
									<label for="tokenLocation">Location <span class="text-red-700">*</span></label>
								</td>
								<td>
									<select
										bind:value={
											followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Location
										}
										class="w-full rounded border p-2 text-sm"
									>
										<option value="" disabled selected>Select Location</option>
										<option value="header">Header</option>
										<option value="query">Query</option>
										<option value="body">Body</option>
									</select>
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
								</td>
							</tr><tr>
								<td>
									<label for="tokenPrefix"> Prefix </label>
								</td>
								<td>
									<input
										bind:value={
											followUpSettingUpdateModel.ApiIntegrationSettings.Auth.TokenInjection.Prefix
										}
										placeholder="Token prefix "
										class="w-full rounded border p-2 text-sm"
									/>
								</td>
							</tr>
							<tr>
								<td colspan="2">
									<label for="fetchconfig" class="text-sm font-semibold"
										>API Fetch Configuration</label
									>
								</td>
							</tr>
							<tr>
								<td>
									<label for="method">API Config Method <span class="text-red-700">*</span></label>
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
								</td>
							</tr>
							<tr>
								<td>
									<label for="queryParams">Request Query Params</label>
								</td>
								<td>
									<input
										bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.QueryParams}
										placeholder="Query Params (e.g. ?key=value)"
										class="w-full rounded border p-2 text-sm"
									/>
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
								</td>
							</tr>
							<tr>
								<td>
									<label for="headers">Query Headers </label>
								</td>
								<td>
									<input
										bind:value={followUpSettingUpdateModel.ApiIntegrationSettings.Fetch.Headers}
										placeholder="Headers (e.g. Authorization: Bearer token)"
										class="w-full rounded border p-2 text-sm"
									/>
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
								</td>
							</tr>

							<tr>
								<td>
									<label for="source" class="text-sm font-semibold"
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
									</div>
								</td>
							</tr>
						{/if}
						{#if followUpSettingUpdateModel.Source === 'File' || followUpSettingUpdateModel.Source === 'Api'}
							<tr>
								<td>
									{#if followUpSettingUpdateModel.Source === 'File'}
										<div class="space-y-1">
											<label for="fileType" class="text-sm font-medium"
												>File Type <span class="text-red-700">*</span></label
											>
										</div>
									{:else if followUpSettingUpdateModel.Source === 'Api'}
										<div class="space-y-1">
											<label for="schedule" class="text-sm font-medium"
												>Extraction Schedule <span class="text-red-700">*</span></label
											>
										</div>
									{/if}
								</td>
								<td>
									{#if followUpSettingUpdateModel.Source === 'File'}
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
									{:else if followUpSettingUpdateModel.Source === 'Api'}
										<!-- Integrate Schedule API UI -->
										<select
											bind:value={
												followUpSettingUpdateModel.ApiIntegrationSettings.ScheduleFrequency
											}
											class="w-full rounded border p-2 text-sm"
										>
											<option value="" disabled selected>Select schedule</option>
											<option value="daily">Daily</option>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
										</select>
									{/if}
								</td>
							</tr>
						{/if}

						{#if followUpSettingUpdateModel.Source === 'Api'}
							<tr>
								<td><h3 class="text-sm font-medium">Reminder Schedules</h3></td>
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
								</td>
							</tr>

							{#each followUpSettingUpdateModel.ApiIntegrationSettings.ReminderSchedule as schedule, i}
								<tr>
									<td>
										<div class="flex border-b pb-1 text-sm last:border-none">
											<span class="px-2">{i + 1}</span>
											<span class="justify-left">{schedule.Type}</span>
										</div>
									</td>
									<td class="flex items-center justify-between gap-2 text-sm">
										{#if schedule.TimeOfDay}
											{schedule.TimeOfDay}
										{:else if schedule.OffsetValue}
											{schedule.OffsetValue} {schedule.OffsetUnit} before
										{:else}
											—
										{/if}

										<!-- Buttons -->
										<div class="flex gap-2">
											<button
												class="text-xs text-blue-600 underline"
												onclick={(event) => {
													event.preventDefault();
													editSchedule(i);
												}}
											>
												Edit
											</button>
											<button
												class="text-xs text-red-600 underline"
												onclick={(event) => {
													event.preventDefault();
													deleteSchedule(i);
												}}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
						{#if followUpSettingUpdateModel.Source === 'File'}
							<tr>
								<td><h3 class="text-sm font-medium">Reminder Schedules</h3></td>
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
								</td>
							</tr>

							{#each followUpSettingUpdateModel.FileUploadSettings.ReminderSchedule as schedule, i}
								<tr>
									<td>
										<div class="flex border-b pb-1 text-sm last:border-none">
											<span class="px-2">{i + 1}</span>
											<span class="justify-left">{schedule.Type}</span>
										</div>
									</td>
									<td class="flex items-center justify-between gap-2 text-sm">
										{#if schedule.TimeOfDay}
											{schedule.TimeOfDay}
										{:else if schedule.OffsetValue}
											{schedule.OffsetValue} {schedule.OffsetUnit} before
										{:else}
											—
										{/if}

										<!-- Buttons -->
										<div class="flex gap-2">
											<button
												class="text-xs text-blue-600 underline"
												onclick={(event) => {
													event.preventDefault();
													editSchedule(i);
												}}
											>
												Edit
											</button>
											<button
												class="text-xs text-red-600 underline"
												onclick={(event) => {
													event.preventDefault();
													deleteSchedule(i);
												}}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
{#if showReminderModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" transition:fade>
		<!-- Modal Box -->
		<div class="relative w-[100%] max-w-md rounded-xl bg-white p-6 shadow-lg">
			<div class="health-system-table-container">
				<table class="health-system-table">
					<thead>
						<tr>
							<th class="w-[30%]">Add Reminder Schedule </th>
							<th class="w-[70%] text-end">
								<button class="cancel-btn" onclick={() => (showReminderModal = false)}>
									<Icon icon="material-symbols:close-rounded" class="text-2xl" />
								</button>
							</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td>
								<label for="type" class="mb-1 block font-medium"
									>Type <span class="text-red-700">*</span></label
								>
							</td>
							<td>
								<select bind:value={newReminder.Type} class="w-full rounded border p-2">
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
							</td>
						</tr>
						<tr>
							<td>
								<label for="offset" class="mb-1 block font-medium">Offset Value</label>
							</td>
							<td>
								<input
									type="number"
									bind:value={newReminder.OffsetValue}
									placeholder="Enter offset value"
									class="w-full rounded border p-2"
								/>
							</td>
						</tr>
						<tr>
							<td>
								<label for="unit" class="mb-1 block font-medium">Offset Unit</label>
							</td>
							<td>
								<select bind:value={newReminder.OffsetUnit} class="w-full rounded border p-2">
									<option value="minutes">Minutes</option>
									<option value="hours">Hours</option>
									<option value="days">Days</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>
								<label for="time" class="mb-1 block font-medium">Time of Day</label>
							</td>
							<td>
								<input
									type="time"
									bind:value={newReminder.TimeOfDay}
									class="w-full rounded border p-2"
								/>
							</td>
						</tr>
					</tbody>
				</table>

				<div class=" flex justify-end gap-3 p-3">
					<button
						class="cancel-btn rounded px-4 py-2 text-sm hover:bg-gray-300"
						onclick={() => (showReminderModal = false)}
					>
						Cancel
					</button>
					<button class="table-btn variant-filled-secondary gap-1 rounded" onclick={addSchedule}>
						Add
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
