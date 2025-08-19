<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import SearchDropdown from '$lib/components/search-dropdown.svelte';
	import type { EnrollmentCreateModel } from '$lib/types/enrollment.types';
	import { createSchema } from '$lib/validation/enrollment.schema';

    //////////////////////////////////////////////////////////////////////////////

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let selectedCareplanId = $state('');
	let selectedCareplanName = $state('');
	let selectedCareplanCode = $state('');
	let selectedPatientUserId = $state('');
	let selectedPatientName = $state('');
	let selectedPatientPhone = $state('');
	let selectedChannel = $state('WhatsApp');
	let numberOfDays: number = $state();
	let startHour: number = $state();
	let startMinutes: number = $state();
	let intervalMinutes: number = $state();
	let startFromTomorrow = $state(false);

	const userId = page.params.userId;
	const enrollmentsRoute = `/users/${userId}/careplan/enrollments`;
	const createRoute = `/users/${userId}/careplan/enrollments/create`;

	const breadCrumbs = [
		{ name: 'Enrollments', path: enrollmentsRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleCareplanSelect = (careplan: any) => {
		if (careplan) {
			selectedCareplanId = careplan.id;
			selectedCareplanName = careplan.Name; 
			selectedCareplanCode = careplan.Code;
		} else {
			selectedCareplanId = '';
			selectedCareplanName = '';
		}
	};

	const handlePatientSelect = (patient: any) => {
		if (patient) {
			selectedPatientUserId = patient.UserId;
			// selectedPatientName = patient.Name;
			selectedPatientPhone = patient.Phone;
			console.log('selectedPatientPhone', selectedPatientPhone);
		} else {
			selectedPatientUserId = '';
			selectedPatientName = '';
			selectedPatientPhone = '';
		}
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			// Validation
			if (!selectedCareplanId) {
				errors.careplan = 'Please select a careplan.';
				return;
			}

			if (!selectedPatientUserId) {
				errors.patient = 'Please select a patient.';
				return;
			}

			const enrollmentData: EnrollmentCreateModel = {
				PatientUserId: selectedPatientUserId,
				PlanName: selectedCareplanName,
				PlanCode: selectedCareplanCode,
				Channel: selectedChannel,
				NumberOfDays: numberOfDays,
				StartHour: startHour,
				StartMinutes: startMinutes,
				IntervalMinutes: intervalMinutes,
				StartFromTomorrow: startFromTomorrow
			};

				const validationResult = createSchema.safeParse(enrollmentData);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch('/api/server/careplan/enrollments/create', {
				method: 'POST',
				body: JSON.stringify(enrollmentData),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(enrollmentsRoute);
				return;
			}

			if (response.Errors) {
				errors = response.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Enrollment creation failed:', error);
			toastMessage();
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Enrollment</h2>
			<a href={enrollmentsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Careplan Name <span class="important-field">*</span></td>
					<td class="table-data">
						<SearchDropdown
							placeholder="Search careplans..."
							searchUrl="/api/server/careplan/search"
							searchField="code"
							displayField="Name"
							valueField="id"
							bind:selectedValue={selectedCareplanId}
							bind:selectedDisplay={selectedCareplanName}
							onSelect={handleCareplanSelect}
						/>
						{#if errors?.careplan}
							<p class="error-text">{errors.careplan}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">User <span class="important-field">*</span></td>
					<td class="table-data">
						<SearchDropdown
							placeholder="Search patients by phone..."
							searchUrl="/api/server/patients/search"
							searchField="phone"
							displayField="Phone"
							valueField="id"
							bind:selectedValue={selectedPatientUserId}
							bind:selectedDisplay={selectedPatientPhone}
							onSelect={handlePatientSelect}
						/>
						{#if errors?.patient}
							<p class="error-text">{errors.patient}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Channel <span class="important-field">*</span></td>
					<td class="table-data">
						<div class="relative">
							<select
								bind:value={selectedChannel}
								class="select"
							>
								<option value="">Select Channel</option>
								<option value="WhatsApp">WhatsApp</option>
								<option value="Telegram">Telegram</option>
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
					</td>
				</tr>

				<!-- Scheduling Section -->
				<tr class="tables-row">
					<td class="table-label">Number of Days </td>
					<td class="table-data">
						<input
							type="number"
							bind:value={numberOfDays}
							min="1"
							max="84"
							class="input"
							placeholder="Enter number of days..."
						/>
						{#if errors?.NumberOfDays}
							<p class="error-text">{errors.NumberOfDays}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Start Time</td>
					<td class="table-data">
						<div class="flex gap-2 items-center">
							<input
								type="number"
								bind:value={startHour}
								min="0"
								max="23"
								class="input w-20 {errors?.startHour ? 'input-text-error' : ''}"
								placeholder="Enter the start hour..."
							/>
							<span class="text-gray-500">:</span>
							<input
								type="number"
								bind:value={startMinutes}
								min="0"
								max="59"
								class="input w-20 {errors?.startMinutes ? 'input-text-error' : ''}"
								placeholder="Enter the start min..."
							/>
						</div>
						{#if errors?.StartHour || errors?.StartMinutes}
							<p class="error-text">{errors?.StartHour || errors?.StartMinutes}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Interval (Minutes)</td>
					<td class="table-data">
						<input
							type="number"
							bind:value={intervalMinutes}
							min="0"
							max="1440"
							class="input {errors?.intervalMinutes ? 'input-text-error' : ''}"
							placeholder="Enter time between tasks..."
						/>
						{#if errors?.IntervalMinutes}
							<p class="error-text">{errors.IntervalMinutes}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Start From Tomorrow</td>
					<td class="table-data">
						<div class="flex items-center">
							<input
								type="checkbox"
								id="startFromTomorrow"
								bind:checked={startFromTomorrow}
								class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.startFromTomorrow ? 'input-text-error' : ''}"
							/>
						</div>
						{#if errors?.StartFromTomorrow}
							<p class="error-text">{errors.StartFromTomorrow}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<Button type="submit" text="Enrolling..." variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Enroll" variant="primary" />
			{/await}
		</div>
	</form>
</div> 