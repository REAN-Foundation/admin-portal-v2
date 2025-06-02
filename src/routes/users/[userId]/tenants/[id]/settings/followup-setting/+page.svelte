<script lang="ts">
	import { page } from '$app/state';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import Icon from '@iconify/svelte';

	let { data, form } = $props();
	let promise = $state();
	let errors: Record<string, string> = $state({});
	let typeName = $state(undefined),
		displayName = $state(undefined),
		snowmedCode = $state(undefined),
		loincCode = $state(undefined),
		normalRangeMin = $state(undefined),
		normalRangeMax = $state(undefined),
		unit = $state(undefined);

	const userId = page.params.userId;
	const id = page.params.id;
	const tenantRoute = `/users/${userId}/tenants/${id}/settings/followup-setting`;
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			// const labRecordCreateModel: LabRecordCreateModel = {
			// 	TypeName: typeName,
			// 	DisplayName: displayName,
			// 	SnowmedCode: snowmedCode,
			// 	LoincCode: loincCode,
			// 	NormalRangeMin: normalRangeMin,
			// 	NormalRangeMax: normalRangeMax,
			// 	Unit: unit
			// };

			// 	const validationResult = createOrUpdateSchema.safeParse(labRecordCreateModel);

			// 	if (!validationResult.success) {
			// 		errors = Object.fromEntries(
			// 			Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
			// 				key,
			// 				val?.[0] || 'This field is required'
			// 			])
			// 		);
			// 		return;
			// 	}

			// 	const res = await fetch(`/api/server/lab-record-types`, {
			// 		method: 'POST',
			// 		body: JSON.stringify(labRecordCreateModel),
			// 		headers: { 'content-type': 'application/json' }
			// 	});

			// 	const response = await res.json();

			// 	if (response.HttpCode === 201 || response.HttpCode === 200) {
			// 		toastMessage(response);
			// 		goto(`${labRecordTypesRoute}/${response?.Data?.LabRecordType?.id}/view`);
			// 		return;
			// 	}

			// 	if (response.Errors) {
			// 		errors = response?.Errors || {};
			// 	} else {
			// 		toastMessage(response);
			// }
		} catch (error) {
			toastMessage();
		}
	};

	let isEnabled = $state(false);
	let scheduleType = $state('file'); // or 'api'

	let fileColumnFormat = $state('');
	let selectedFileType = $state('');

	let extractionSchedule = $state('');
	let reminderSchedules = [
		{ id: 1, label: 'Previous Day', time: '7:00 pm' },
		{ id: 2, label: 'Start of Day', time: '' },
		{ id: 3, label: 'Custom', time: '' }
	];
</script>

<div class="px-6 py-8">
	<div class="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow">
		<form onsubmit={async (e) => (promise = handleSubmit(e))} class="divide-y divide-gray-200">
			<!-- Header -->
			<div class="flex items-center justify-between bg-gray-100 px-6 py-4">
				<h2 class="text-lg font-semibold">Appointment Follow-Up Setting</h2>
				<a href={tenantRoute} class="text-gray-500 transition hover:text-gray-700">
					<Icon icon="material-symbols:close-rounded" class="h-5 w-5" />
				</a>
			</div>

			<!-- Enable Toggle -->
			<div class="px-6 py-4">
				<label class="inline-flex items-center space-x-2 text-sm">
					<input
						type="checkbox"
						bind:checked={isEnabled}
						class="form-checkbox rounded text-blue-600"
					/>
					<span>Enabled</span>
				</label>
			</div>

			<!-- Schedule Type -->
			<div class="flex flex-col gap-4 px-6 py-4 md:flex-row md:justify-between">
				<label class="flex items-center space-x-2 text-sm">
					<input
						type="radio"
						value="file"
						bind:group={scheduleType}
						class="form-radio text-blue-600"
					/>
					<span>Upload Schedule Files</span>
				</label>

				<label class="flex items-center space-x-2 text-sm">
					<input
						type="radio"
						value="api"
						bind:group={scheduleType}
						class="form-radio text-blue-600"
					/>
					<span>Integrate Schedule API</span>
				</label>
			</div>

			<!-- Dynamic Section -->
			<div class="space-y-6 px-6 py-4">
				{#if scheduleType === 'file'}
					<!-- Upload Files -->
					<div>
						<label class="mb-1 block text-sm font-medium">
							File column format <span class="ml-2 text-xs text-gray-500">JSON</span>
						</label>
						<textarea
							bind:value={fileColumnFormat}
							rows="4"
							class="w-full rounded border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						></textarea>
					</div>
				{:else}
					<!-- API Integration -->
					<div class="space-y-4">
						<div>
							<label class="mb-1 block text-sm font-semibold">Authentication Endpoint</label>
							<ul class="list-disc space-y-1 pl-6 text-xs text-gray-600">
								<li>Base Url</li>
								<li>Request Type</li>
								<li>Path params</li>
								<li>Query params</li>
								<li>Request body</li>
								<li>Headers</li>
							</ul>
						</div>

						<div>
							<label class="mb-1 block text-sm font-semibold">Schedule Extraction Endpoint</label>
							<ul class="list-disc space-y-1 pl-6 text-xs text-gray-600">
								<li>Base Url</li>
								<li>Request Type</li>
								<li>Path params</li>
								<li>Query params</li>
								<li>Request body</li>
								<li>Headers</li>
							</ul>
						</div>
					</div>
				{/if}
			</div>

			<!-- File Type or Extraction Schedule -->
			<div class="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center">
				<label class="w-48 text-sm font-medium">
					{scheduleType === 'file' ? 'File Type' : 'Extraction Schedule'}
				</label>
				{#if scheduleType === 'file'}
					<select
						bind:value={selectedFileType}
						class="form-select w-64 rounded border-gray-300 text-sm focus:ring-blue-500"
					>
						<option value="" disabled selected>Select file type</option>
						<option value="csv">CSV</option>
						<option value="json">JSON</option>
						<option value="xlsx">Excel</option>
					</select>
				{:else}
					<select
						bind:value={extractionSchedule}
						class="form-select w-64 rounded border-gray-300 text-sm focus:ring-blue-500"
					>
						<option value="" disabled selected>Select schedule</option>
						<option value="hourly">Hourly</option>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
					</select>
				{/if}
			</div>

			<!-- Reminder Schedules -->
			<div class="px-6 py-4">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Reminder Schedules</h3>
					<button
						type="button"
						class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
					>
						Add Schedule
					</button>
				</div>
				{#each reminderSchedules as schedule, i}
					<div class="flex justify-between border-b py-2 text-sm">
						<div class="flex items-center space-x-2">
							<span class="text-gray-500">{i + 1}.</span>
							<span>{schedule.label}</span>
						</div>
						<span>{schedule.time}</span>
					</div>
				{/each}
			</div>

			<!-- Submit -->
			<div class="bg-gray-100 px-6 py-4 text-end">
				{#await promise}
					<button
						type="submit"
						class="cursor-not-allowed rounded bg-blue-400 px-4 py-2 text-sm text-white opacity-70"
						disabled
					>
						Submitting...
					</button>
				{:then}
					<button
						type="submit"
						class="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
					>
						Submit
					</button>
				{/await}
			</div>
		</form>
	</div>
</div>
