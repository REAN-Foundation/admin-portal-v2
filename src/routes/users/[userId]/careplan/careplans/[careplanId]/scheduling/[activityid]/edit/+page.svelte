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

		let url = `/api/server/careplan/assets/search?assetType=${selectedAssetRoute}`;
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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Careplan Activity </th>
							<th class="text-end">
								<a href={viewRoute} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="!py-3">Asset Type<span class=" text-red-600">*</span></td>
							<td>
								<select
									name="assetType"
									bind:value={assetType}
									class="health-system-input"
									onchange={onSelectAssetType}
									required
								>
									{#each assetTypes as val}
										<option value={val}>{val}</option>
									{/each}
								</select>
							</td>
						</tr>

						<tr>
							<td>Asset <span class=" text-red-600">*</span></td>
							<td>
								<select name="assetId" class=" health-system-input" bind:value={assetId}>
									{#each items as val}
										<option value={val.value}>{val.label}</option>
									{/each}
								</select>
								<!-- <input type="text" hidden bind:value={assetId} /> -->
							</td>
						</tr>
						<tr>
							<td class="!py-3">Time Slot<span class=" text-red-600">*</span></td>
							<td>
								<select
									name="timeSlot"
									bind:value={timeSlot}
									class="dark:bg-surface-700 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:text-black"
									required
								>
									{#each timeSlots as val}
										<option value={val}>{val}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td>Schedule Day<span class=" text-red-600">*</span></td>
							<td>
								<input
									type="number"
									class="health-system-input {form?.errors?.day ? 'input-text-error' : ''}"
									name="day"
									min="1"
									placeholder="Enter day here..."
									bind:value={day}
								/>
								{#if errors?.Day}
									<p class="text-error-500 text-xs">{errors?.Day}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
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
