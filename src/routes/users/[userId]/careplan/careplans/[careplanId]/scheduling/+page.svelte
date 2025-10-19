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
	import { createOrUpdatSchedulingeSchema } from '$lib/validation/careplan.scheduling.schema';
	import Button from '$lib/components/button/button.svelte';
	import { MAX_ITEMS_PER_PAGE } from '$lib/components/utils/helper';

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
		timeSlot = $state(undefined),
		sequence = $state(undefined);
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
	$inspect('items', items);
	let show = $state(false);
	let selectedAssetType = $state('Action plan');

	function hideForm() {
		show = false;
	}

	const sanitizeActivities = (activities) => {
		return activities.map((a) => {
			let day = Number(a.Day);
			if (isNaN(day) || day <= 0) day = 1;
			return { ...a, Day: day };
		});
	};

	const classifyActivitiesByDay = (activities) => {
		const days = Array.from(new Set(activities.map((x) => x.Day))).sort(
			(a: number, b: number) => a - b
		); // Sort days ascending

		return days.map((d) => ({
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
		let url = `/api/server/careplan/assets/search?assetType=${selectedAssetRoute}&itemsPerPage=${MAX_ITEMS_PER_PAGE}`;
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});
		const response = await res.json();

		let mappedItems = response.Data.Items.map((obj) => {
			return { value: obj.id, label: obj.Name };
		});

		// Move selected asset to the front if it exists
		if (assetId) {
			const idx = mappedItems.findIndex(item => item.value === assetId);
			if (idx > 0) {
				const [selected] = mappedItems.splice(idx, 1);
				mappedItems.unshift(selected);
			}
		}

		items = mappedItems;
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

			// Validate asset existence
			const selectedAsset = items.find(item => item.value === assetId);
			if (!selectedAsset) {
				errors = { ...errors, AssetId: "Asset not selected" };
				return;
			}

			const careplanSchedulCreateModel: CarePlanSchedulingCreateModel = {
				AssetType: assetType,
				AssetId: assetId,
				ScheduleDay: day,
				TimeSlot: timeSlot,
				Sequence: sequence && sequence !== '' ? Number(sequence) : undefined
			};
			const validationResult = createOrUpdatSchedulingeSchema.safeParse(careplanSchedulCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
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
	<div class="p-6">
		<form onsubmit={(event) => (promise = handleSubmit(event))}>
			<div class="form-headers">
				<h2 class="form-titles">Schedule New Activity</h2>
				<button type="button" onclick={hideForm} class="form-cancel-btn">
					<Icon icon="material-symbols:close-rounded" />
				</button>
			</div>

			<table class="w-full">
				<tbody>
					<tr class="tables-row">
						<td class="table-label">Asset Type <span class="important-field">*</span></td>
						<td class="table-data">
							<div class="relative">

							<select
								name="assetType"
								class="select {errors?.assetType ? 'input-text-error' : ''}"
								onchange={onSelectAssetType}
								bind:value={assetType}
							>
								{#each types as val}
									<option value={val}>{val}</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
							{#if errors?.AssetType}
								<p class="error-text">{errors?.AssetType}</p>
							{/if}
						</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label align-top">Asset <span class="important-field">*</span></td>
						<td class="table-data">
							{#if items.length === 0}
								<div class="flex items-center gap-2 mt-2">
		
									<Button
										text="Add Asset"
										variant="secondary"
										onclick={() => goto(`/users/${userId}/careplan/assets/${assetRouteMap[assetType]}/create`)}
									/>
									<span class="text-warning">No assets found for this type.</span>
								</div>
							{:else}
							<div class="relative">

								<select
									name="assetId"
									class="select {errors?.assetId ? 'input-text-error' : ''}"
									bind:value={assetId}
								>
									{#each items as val}
										<option value={val.value}>{val.label}</option>
									{/each}
								</select>
								<div class="select-icon-container">
									<Icon icon="mdi:chevron-down" class="select-icon" />
								</div>
							</div>
								{#if errors?.AssetId}
									<p class="error-text">{errors?.AssetId}</p>
								{/if}
							{/if}
						</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Schedule Day <span class="important-field">*</span></td>
						<td class="table-data">
							<input
								type="number"
								name="day"
								min="1"
								bind:value={day}
								placeholder="Enter day here..."
								class="input {errors?.day ? 'input-text-error' : ''}"
							/>
							{#if errors?.ScheduleDay}
								<p class="error-text">{errors?.ScheduleDay}</p>
							{/if}
						</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Slot Of The Day <span class="important-field">*</span></td>
						<td class="table-data">
							<div class="relative">
							<select
								name="timeSlot"
								class="select {errors?.TimeSlot ? 'input-text-error' : ''}"
								bind:value={timeSlot}
							>
								{#each timeSlotValues as val}
									<option value={val}>{val}</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
							{#if errors?.TimeSlot}
								<p class="error-text">{errors?.TimeSlot}</p>
							{/if}
						</td>
					</tr>

					<tr class="tables-row">
						<td class="table-label">Sequence</td>
						<td class="table-data">
							<input
								type="number"
								name="sequence"
								min="1"
								bind:value={sequence}
								placeholder="Enter sequence number..."
								class="input {errors?.Sequence ? 'input-text-error' : ''}"
							/>
							{#if errors?.Sequence}
								<p class="error-text">{errors?.Sequence}</p>
							{/if}
						</td>
					</tr>

				</tbody>
			</table>

			<div class="btn-container">
				{#await promise}
					<Button type="submit" text="Submitting" variant="primary" disabled={true} />
				{:then data}
					<Button type="submit" text="Submit" variant="primary" />
				{/await}
			</div>
		</form>
	</div>
{:else}
	<div class="mx-4 ml-auto flex w-fit flex-wrap justify-end">
		<Button text="Schedule New Activity" variant="primary" onclick={() => (show = true)} />
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
