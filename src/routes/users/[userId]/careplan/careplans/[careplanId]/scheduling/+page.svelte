<script lang="ts">
	import Careplanscheduleform from './careplan-schedule-form.svelte';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import type { PageServerData } from './$types';
	import Icon from '@iconify/svelte';
	import type { CarePlanSchedulingCreateModel } from '$lib/types/careplan.scheduling.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { onMount } from 'svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let openDeleteModal = $state(false);
	let careplanActivities = $state(data.careplanActivities);
	let carePlanData = $state(data.careplan.Data);
	let carePlanCode = $state(data.careplan.Data.Code);
	let carePlanName = $state(data.careplan.Data.Name);
	let carePlanType = $state(data.careplan.Data.Type);
	let types = $state(data.assetTypes.Data.AssetTypes);
	let timeSlotValues = $state(data.timeslot);
	let assetId = $state(undefined),
		assetType = $state(undefined),
		day = $state(undefined),
		timeSlot = $state(undefined);
	let isDeleting = $state(false);
	let idToBeDeleted = $state(null);

	const userId = page.params.userId;
	const careplanId = page.params.careplanId;

	const careplansRoute = `/users/${userId}/careplan/careplans`;
	const schedulingRoute = `/users/${userId}/careplan/careplans/${careplanId}/scheduling`;

	const breadCrumbs = $derived(() => [
		{ name: 'Careplans', path: careplansRoute },
		{ name: 'Scheduling', path: schedulingRoute }
	]);

	let items = $state([]);
	// let items = $state(data.actionplanAssets.Items);
	$inspect('items', items);
	let show = $state(false); // FIXED: should be a $state
	let selectedAssetType = $state('Action plan');

	function hideForm() {
		show = false;
	}

	const sanitizeActivities = (activities) => {
		return activities.map((a) => {
			if (a.Day == null) a.Day = 1;
			return a;
		});
	};

	const classifyActivitiesByDay = (activities) => {
		const daysSet = new Set(activities.map((x) => x.Day));
		return [...daysSet].map((d) => ({
			Day: d,
			Activities: activities.filter((x) => x.Day === d)
		}));
	};

	const classifyByWeek = (classifiedByDay) => {
		const classified = [];
		for (const c of classifiedByDay) {
			const week = Math.ceil(c.Day / 7);
			let existingWeek = classified.find((x) => x.Week === week);
			if (existingWeek) {
				existingWeek.Days.push(c);
			} else {
				classified.push({ Week: week, Days: [c] });
			}
		}
		return classified;
	};

	let sanitized = $derived(() => sanitizeActivities(careplanActivities));

	let classifiedByDay = $derived(() => classifyActivitiesByDay(sanitized()));

	let classifiedByWeek = $derived(() => classifyByWeek(classifiedByDay()));

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

	const onSelectAssetType = async (e) => {
		selectedAssetType = e.currentTarget.value;
		await searchAssets({
			sessionId: data.sessionId,
			selectedAssetType
		});
	};

	async function searchAssets(model) {
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
		console.log('items: ', items);
		return items;
	}


	const handleCareplanScheduleDelete = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	const handleDeleteClick = async (id) => {
		console.log('Inside handleHealthSystemDelete', id);
		const response = await fetch(`/api/server/careplan/scheduling/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('deleted Response', res);
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}

		const reterivedCarePlanActivities = await fetch(
			`/api/server/careplan/searchActivity?careplanId=${careplanId}`,
			{
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			}
		);
		const retrivedRes = await reterivedCarePlanActivities.json();
		careplanActivities = retrivedRes.Data.Items;
		console.log(retrivedRes, 'These are the activities');
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
			const careplanSchedulCreateModel: CarePlanSchedulingCreateModel = {
				AssetType: assetType,
				AssetId: assetId,
				ScheduleDay: day,
				TimeSlot: timeSlot
			};

			console.log('careplanSchedulCreateModel', careplanSchedulCreateModel);
			const res = await fetch(`/api/server/careplan/scheduling?careplanId=${careplanId}`, {
				method: 'POST',
				body: JSON.stringify(careplanSchedulCreateModel),
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();

			console.log('response schedule', response);
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${schedulingRoute}/${response?.Data?.id}/view`);
				show = false;
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
		selectedAssetType
	});
});
</script>

<!-- Breadcrumbs -->

<BreadCrumbs crumbs={breadCrumbs()} />

<!-- Careplan Info -->
<div class=" mx-4 mt-2 mb-2 flex flex-col items-start gap-2 p-2">
	<div class="flex items-center gap-4">
		<label class="label text" for="careplan">Careplan</label>
		<span class="text">{carePlanName}</span>
	</div>
	<div class="flex items-center gap-4">
		<label class="label text" for="code">Code</label>
		<span class="text">{carePlanCode}</span>
	</div>
	<div class="flex items-center gap-4">
		<label class="label text" for="category">Category</label>
		<span class="text">{carePlanType}</span>
	</div>
</div>

<!-- Schedule Form -->
{#if show}
	<div class="px-6 py-4">
		<div class="mx-auto">
			<div class="health-system-table-container">
				<form onsubmit={(event) => (promise = handleSubmit(event))}>
					<table class="table-c">
						<thead>
							<tr>
								<th>Schedule New Activity</th>
								<th class="text-end">
									<button type="button" onclick={hideForm} class="">
										<Icon icon="material-symbols:close-rounded" class="text-xl" />
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>AssetType <span class="text-red-700">*</span></td>
								<td>
									<select
										name="assetType"
										class="health-system-input {form?.errors?.assetType ? 'input-text-error' : ''}"
										onchange={onSelectAssetType}
										bind:value={assetType}
									>
										{#each types as val}
											<option value={val}>{val}</option>
										{/each}
									</select>
									{#if errors?.Name}
										<p class="text-error-500 text-xs">{errors?.Name}</p>
									{/if}
								</td>
							</tr>
							<tr>
								<td class="align-top">Asset</td>
								<td>
									<select
										name="assetId"
										class="health-system-input {form?.errors?.assetId ? 'input-text-error' : ''}"
										bind:value={assetId}
									>
										{#each items as val}
											<option value={val.value}>{val.label}</option>
										{/each}
									</select>
								</td>
							</tr>
							<tr>
								<td class="!py-3 align-top">Scheduled Day</td>
								<td>
									<input
										type="number"
										name="day"
										bind:value={day}
										placeholder="Enter day here...."
										class="health-system-input {form?.errors?.day ? 'input-text-error' : ''}"
									/>
									{#if errors?.Day}
										<p class="text-error">{errors?.Day}</p>
									{/if}
								</td>
							</tr>
							<tr>
								<td>Slot Of The Day</td>
								<td>
									<select name="timeSlot" class="input w-full" bind:value={timeSlot}>
										{#each timeSlotValues as val}
											<option value={val}>{val}</option>
										{/each}
									</select>
									{#if errors?.TimeSlot}
										<p class="text-error-500 text-xs">{errors?.TimeSlot}</p>
									{/if}
								</td>
							</tr>
						</tbody>
					</table>
					<div class="button-container">
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
{:else}
	<div class="mx-4 ml-auto flex w-fit flex-wrap justify-end">
		<button
			onclick={() => (show = true)}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			Schedule New Activity
		</button>
	</div>
{/if}

<Careplanscheduleform
	{userId}
	{careplanId}
	classifiedByDay={classifiedByDay()}
	classifiedByWeek={classifiedByWeek()}
	{handleCareplanScheduleDelete}
/>
<Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete careplan activity"
	onConfirm={handleDeleteClick}
	id={idToBeDeleted}
/>
