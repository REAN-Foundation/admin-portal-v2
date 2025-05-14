<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';

	import InputChips from '$lib/components/input-chips.svelte';
	import type { AppointmentUpdateModel } from '$lib/types/appointment';
	import { createOrUpdateSchema } from '$lib/validation/appointment.schema';

	//////////////////////////////////////////////////////////////////////
	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.appointment.id;
	let assetCode = data.appointment.AssetCode;
	let name = $state(data.appointment.Name);
	let description = $state(data.appointment.Description);
	let appointmentType = $state(data.appointment.AppointmentType);
	let tags = $state(data.appointment.Tags);
	let version = $state(data.appointment.Version);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');
	let keywords: string[] = $state(data.appointment.Tags);

	const userId = page.params.userId;
	const appointmentId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/appointments/${appointmentId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/appointments/${appointmentId}/view`;
	const appointmentRoute = `/users/${userId}/careplan/assets/appointments`;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Appointment',
			path: appointmentRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];

	const handleReset = () => {
		name = data?.appointment?.Name;
		description = data?.appointment?.Description;
		appointmentType = data?.appointment?.AppointmentType;
		tags = data?.appointment?.Tags;
		version = data?.appointment?.Version;
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const appointmentUpdateModel: AppointmentUpdateModel = {
				Name: name,
				Description: description,
				AppointmentType: appointmentType,
				Tags: keywords,
				Version: version
			};

			const validationResult = createOrUpdateSchema.safeParse(appointmentUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/appointments/${id}`, {
				method: 'PUT',
				body: JSON.stringify(appointmentUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${appointmentRoute}/${response?.Data?.id}/view`);
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
	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Appointment</th>
							<th class="text-end">
								<a href={viewRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Asset Code</td>
							<td>{assetCode}</td>
						</tr>
						<tr>
							<td>Name *</td>
							<td>
								<input
									type="text"
									class="table-input-field {form?.errors?.Name ? 'input-text-error' : ''}"
									name="name"
									placeholder="Enter name here..."
									bind:value={name}
								/>
								{#if errors?.Name}
									<p class="text-error-500 text-xs">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
							<td>
								<textarea
									name="description"
									class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
									bind:value={description}
									placeholder="Enter description here..."
								></textarea>
							</td>
						</tr>
						<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
							<td>Appointment Type</td>
							<td>
								<select
									name="appointmentType"
									bind:value={appointmentType}
									class="select select-primary w-full"
								>
									<option>Doctor</option>
									<option>Lab</option>
									<option>Physiotherapy</option>
									<option>Other</option>
								</select>
							</td>
						</tr>
						<tr>
							<td class="!py-3">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
							</td>
						</tr>
						<tr>
							<td>Version</td>
							<td>
								<input
									type="text"
									class="table-input-field {form?.errors?.Version ? 'input-text-error' : ''}"
									name="version"
									placeholder="V 1.0"
									bind:value={version}
								/>
								{#if errors?.Version}
									<p class="text-error-500 text-xs">{errors?.Version}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button type="button" onclick={handleReset} class="table-btn variant-soft-secondary"
						>Reset</button
					>
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
</div>
