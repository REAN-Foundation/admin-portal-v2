<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';
	import type { CarePlanSchedulingUpdateModel } from '$lib/types/careplan.scheduling.types';
	import { createOrUpdatSchedulingeSchema } from '$lib/validation/careplan.scheduling.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/button/button.svelte';
	import { MAX_ITEMS_PER_PAGE } from '$lib/components/utils/helper';
	//////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	const careplanId = page.params.careplanId;
	const activityId = page.params.activityid;

	const editRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling/${activityId}/edit`;
	const viewRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling/${activityId}/view`;
	const schedulingRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling`;
	const careplansRoute = `/users/${userId}/careplan/careplans`;

	let items = $state([]);
	let assetTypes = data.assetTypes.Data.AssetTypes;
	let timeSlots = data.timeslot;

	let assetId = $state(data.careplanActivitiy.AssetId);

	let timeSlot = $state(data.careplanActivitiy.TimeSlot);
	let day = $state(data.careplanActivitiy.Day);
	let assetType = $state(data.careplanActivitiy.AssetType);

	function handleReset() {
		assetType = data.careplanActivitiy.AssetType;
		assetId = data.careplanActivitiy.AssetId;
		timeSlot = data.careplanActivitiy.TimeSlot;
		day = data.careplanActivitiy.Day;
		errors = {};
	}

	const breadCrumbs = [
		{
			name: 'Careplans',
			path: careplansRoute
		},
		{
			name: 'Scheduling',
			path: schedulingRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];
	const assetRouteMap = {
		'Action plan': 'action-plans',
		Animation: 'animations',
		Appointment: 'appointments',
		Article: 'articles',
		Assessment: 'assessments',
		Audio: 'audio',
		Biometrics: 'biometrics',
		Challenge: 'challenges',
		Checkup: 'checkups',
		Consultation: 'consultations',
		Exercise: 'exercises',
		Goal: 'goals',
		Infographics: 'infographics',
		Medication: 'medications',
		Meditation: 'meditations',
		Message: 'messages',
		Nutrition: 'nutritions',
		Physiotherapy: 'physiotherapy',
		Priority: 'priorities',
		Reflection: 'reflections',
		Reminder: 'reminders',
		Video: 'video',
		'Web link': 'web-links',
		'Web newsfeed': 'web-newsfeeds',
		'Word power': 'word-power'
	};

	let selectedAssetType = assetType;

	const onSelectAssetType = async (e) => {
		selectedAssetType = e.currentTarget.value;
		await searchAssets({
			sessionId: data.sessionId,
			selectedAssetType
		});
	};

	async function searchAssets(model) {
		console.log(model);
		const selectedAssetRoute = assetRouteMap[selectedAssetType];

		let url = `/api/server/careplan/assets/search?assetType=${selectedAssetRoute}&itemsPerPage=${MAX_ITEMS_PER_PAGE}`;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});
		const response = await res.json();

		items = response.Data.Items.map((obj) => {
			return { value: obj.id, label: obj.Name };
		});

		return items;
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const carePlanScheduleUpdateModel: CarePlanSchedulingUpdateModel = {
				AssetType: assetType,
				AssetId: assetId,
				ScheduleDay: day,
				TimeSlot: timeSlot
			};

			const validationResult = createOrUpdatSchedulingeSchema.safeParse(
				carePlanScheduleUpdateModel
			);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(
				`/api/server/careplan/scheduling/${activityId}?careplanId=${careplanId}`,
				{
					method: 'PUT',
					body: JSON.stringify(carePlanScheduleUpdateModel),
					headers: { 'content-type': 'application/json' }
				}
			);

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${schedulingRoute}/${response?.Data?.id}/view`);
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
	onMount(() => {
		searchAssets({
			sessionId: data.sessionId,
			selectedAssetType: assetType
		});
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Careplan Activity</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Asset Type <span class="important-field">*</span></td>
					<td class="table-data">
						<div class="relative">

						<select
							name="assetType"
							bind:value={assetType}
							class="select"
							onchange={onSelectAssetType}
							required
						>
							{#each assetTypes as val}
								<option value={val}>{val}</option>
							{/each}
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Asset <span class="important-field">*</span></td>
					<td class="table-data">
						<div class="relative">

						<select name="assetId" class="select" bind:value={assetId}>
							{#each items as val}
								<option value={val.value}>{val.label}</option>
							{/each}
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Time Slot <span class="important-field">*</span></td>
					<td class="table-data">
						<div class="relative">

						<select name="timeSlot" bind:value={timeSlot} class="select" required>
							{#each timeSlots as val}
								<option value={val}>{val}</option>
							{/each}
						</select>
						<div class="select-icon-container">
							<Icon icon="mdi:chevron-down" class="select-icon" />
						</div>
					</div>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Schedule Day <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="number"
							min="1"
							name="day"
							bind:value={day}
							placeholder="Enter day here..."
							class="input {errors?.ScheduleDay ? 'input-text-error' : ''}"
						/>
						{#if errors?.ScheduleDay}
							<p class="error-text">{errors?.ScheduleDay}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
