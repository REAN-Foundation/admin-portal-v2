<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types'
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/meditations.schema';
	import type { MeditationUpdateModel } from '$lib/types/meditations.types';
	import Button from '$lib/components/button/button.svelte';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.meditation.Name);
	let description = $state(data.meditation.Description);
	let meditationType = $state(data.meditation.MeditationType);
	let recommendedDurationMin = $state<number>(data.meditation.RecommendedDurationMin);
	let version = $state(data.meditation.Version);
	let keywords: string[] = $state(data.meditation.Tags);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	var meditationId = page.params.id;
  const tenantId = data.tenantId;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/meditations/${meditationId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/meditations/${meditationId}/view`;
	const meditationRoute = `/users/${userId}/careplan/assets/meditations`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset =  () => {
		 name = data?.meditation?.Name;
		 meditationId = page.params.id;
		 description = data?.meditation?.Description;
		 meditationType = data?.meditation?.MeditationType,
		 recommendedDurationMin = data?.meditation.RecommendedDurationMin,
		 version = data?.meditation?.Version;
		 keywords = data?.meditation?.Tags;
		 errors = {};
		}

		const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const meditationUpdateModel: MeditationUpdateModel = {
				Name: name,
				Description: description,
				MeditationType: meditationType,
				RecommendedDurationMin: recommendedDurationMin,
				Version: version,
				Tags: keywords,
        TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(meditationUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/meditations/${meditationId}`, {
				method: 'PUT',
				body: JSON.stringify(meditationUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				console.log("Full response:", response);
				await goto(`${meditationRoute}/${response?.Data?.id}/view`); 
			} else if (response.Errors) {
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

<div class="p-6">
  <form onsubmit={async (event) => (promise = handleSubmit(event))}>
    <div class="form-headers">
      <h2 class="form-titles">Edit Meditation</h2>
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
              name="biometricsName"
              placeholder="Enter name here..."
              bind:value={name}
            />
            {#if errors?.Name}
              <p class="error-text">{errors?.Name}</p>
            {/if}
          </td>
        </tr>

        <tr class="tables-row">
          <td class="table-label align-top">Description</td>
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
          <td class="table-label">Meditation Type</td>
          <td class="table-data">
            <select class="input" bind:value={meditationType}>
              <option disabled value>Select meditation type</option>
              <option>Mindfulness</option>
              <option>Spiritual</option>
              <option>Focused</option>
              <option>Mantra</option>
              <option>Progressive relaxation</option>
              <option>Transcendental</option>
              <option>Visualization</option>
            </select>
          </td>
        </tr>

        <tr class="tables-row">
          <td class="table-label">Recommended Duration Min</td>
          <td class="table-data">
            <input
              type="text"
              bind:value={recommendedDurationMin}
              placeholder="Enter recommended duration min..."
              class="input {errors?.RecommendedDurationMin ? 'input-text-error' : ''}"
            />
            {#if errors?.RecommendedDurationMin}
              <p class="error-text">{errors?.RecommendedDurationMin}</p>
            {/if}
          </td>
        </tr>

        <tr class="tables-row">
          <td class="table-label align-top">Tags</td>
          <td class="table-data">
            <InputChips
              bind:keywords
              name="keywords"
              id="keywords"
              keywordsChanged={onUpdateKeywords}
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
