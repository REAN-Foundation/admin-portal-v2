<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types'
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { ConsultationUpdateModel } from '$lib/types/consultation.types';
	import { createOrUpdateSchema } from '$lib/validation/consultation.schema';
	import Button from '$lib/components/button/button.svelte';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.consultation.Name);
	let description = $state(data.consultation.Description || undefined);
	let consultationType = $state(data.consultation.ConsultationType);
	let version = $state(data.consultation.Version);
	let keywords: string[] = $state(data.consultation.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	var consultationId = page.params.id;
	const tenantId = data.tenantId;

	const assetType = page.url.searchParams.get('assetType') || 'Consultation';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const createRoute = `/users/${userId}/careplan/assets/consultations/create`;
	const editRoute = `/users/${userId}/careplan/assets/consultations/${consultationId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/consultations/${consultationId}/view`;
	const consultationRoute = `/users/${userId}/careplan/assets/consultations`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Consultation', path: createRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset =  () => {
		 name = data?.consultation?.Name;
		 consultationId = page.params.id;
		 description = data?.consultation?.Description;
		 version = data?.consultation?.Version;
		 consultationType = data?.consultation.ConsultationType;
		 keywords = data?.consultation?.Tags;
		 errors = {};
		}

		const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const consultationUpdateModel: ConsultationUpdateModel = {
				Name: name,
				Description: description,
				Version: version,
				ConsultationType: consultationType,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(consultationUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/consultations/${consultationId}`, {
				method: 'PUT',
				body: JSON.stringify(consultationUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log("Redirecting to:", response?.Data?.id); 
				console.log("Full response:", response);
				await goto(`${consultationRoute}/${response?.Data?.id}/view`); 
			} else if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	$effect(() => {
            keywordsStr = keywords?.join(', ');
        });

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Consultation</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
							name="name"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Consultation Type</td>
					<td class="table-data">
						<select class="input" bind:value={consultationType}>
							<option disabled value>Select Consultation type</option>
							<option>Tele-consultation</option>
							<option>Visit-consultation</option>
							<option>Other</option>
						</select>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							class="input {form?.errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="V 1.0"
							bind:value={version}
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
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

