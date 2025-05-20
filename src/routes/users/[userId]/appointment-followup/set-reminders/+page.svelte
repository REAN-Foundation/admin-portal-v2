
<script lang="ts">
// import { enhance } from '$app/forms';
// import flatpickr from "flatpickr";
// import "flatpickr/dist/flatpickr.css";
import { onMount } from "svelte";
import { page } from '$app/stores';
// import toast from 'svelte-french-toast';
import type { ActionData, PageServerData } from './$types';
import { goto, invalidate } from '$app/navigation';
import { date, promise } from 'zod';
import { derived } from 'svelte/store';
import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { toastMessage } from "$lib/components/toast/toast.store";
	import { fileUploadSchema } from "$lib/validation/file.upload.schema";

//////////////////////////////////////////////////////////////////////

let data = $props();
let errors: Record<string, string> = $state({});
const isGMU = data.sessionUser?.tenantCode?.includes('GMU');
const userId = $page.params.userId;
const setReminderRoute = `/users/${userId}/appointment-followup/set-reminders`;
const breadCrumbs = [{ name:'Set Reminders', path: setReminderRoute }];

//   onMount(() => {
//   flatpickr("#datePicker", {
// 	mode: "multiple",
// 	minDate: "today",
// 	dateFormat: "Y-m-d",
// 	onChange: (selectedDatesArray) => 
// 	{
//         selectedDates = selectedDatesArray.map(date => {
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
//           const day = String(date.getDate()).padStart(2, '0');
//           return `${year}-${month}-${day}`;
//         });
//       }
//     });
//   });

	// const handleSubmit = async (event: Event) => {
	// 	try {
	// 		event.preventDefault();
	// 		errors = {};

	// 		const Model: HospitalCreateModel = {
	// 			Name: hospitalName,
	// 			HealthSystemId: selectedHealthSystemId,
	// 			Tags: keywords
	// 		};

	// 		const validationResult = createOrUpdateSchema.safeParse(hospitalCreateModel);

	// 		if (!validationResult.success) {
	// 			errors = Object.fromEntries(
	// 				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
	// 					key,
	// 					val?.[0] || 'This field is required'
	// 				])
	// 			);
	// 			return;
	// 		}

	// 		const res = await fetch(`/api/server/follow-up/file-upload`, {
	// 			method: 'POST',
	// 			body: JSON.stringify(fileUploadSchema),
	// 			headers: { 'content-type': 'application/json' }
	// 		});

	// 		const response = await res.json();

	// 		if (response.HttpCode === 201 || response.HttpCode === 200) {
	// 			toastMessage(response);
	// 			// goto(`${hospitalsRoute}/${response?.Data?.Hospital?.id}/view`);
	// 			return;
	// 		}

	// 		// if (response.Errors) {
	// 		// 	errors = response?.Errors || {};
	// 		// } else {
	// 		// 	toastMessage(response);
	// 		// }
	// 	} catch (error) {
	// 		toastMessage();
	// 	}
	// };

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Add Hospital</th>
							<th class="text-end">
								<a href={hospitalsRoute} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.hospitalName ? 'input-text-error' : ''}"
									name="hospitalName"
									placeholder="Enter name here..."
									bind:value={hospitalName}
									required
								/>
								{#if form?.errors?.hospitalName}
									<p class="text-error">{form?.errors?.hospitalName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Health System <span class="text-red-600">*</span></td>
							<td>
								<select required name="healthSystemId" class="health-system-input !pr-4" bind:value={selectedHealthSystemId}>
									{#each healthSystems as healthSystem}
										{#if healthSystemId !== healthSystem.id}
											<option value={healthSystem.id}>{healthSystem.Name}</option>
										{/if}
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="!py-4">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input
									type="hidden"
									name="keywordsStr"
									id="keywordsStr"
									class="health-system-input"
									bind:value={keywordsStr}
								/>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" /> -->
							</td>
						</tr>
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