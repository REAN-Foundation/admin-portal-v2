<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { MeditationCreateModel } from '$lib/types/meditations.types.js';
	import { createOrUpdateSchema } from '$lib/validation/meditations.schema.js';
	import Button from '$lib/components/button/button.svelte';
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(undefined);
	let description = $state('');
	let meditationType = $state('Mindfulness');
	let recommendedDurationMin = $state<number>();
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Create Meditation';
	const userId = page.params.userId;
  const tenantId = data.sessionUser.tenantId;

	// Get asset type from URL params or default to 'Meditation'
	const assetType = 'Meditation';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const createRoute = `/users/${userId}/careplan/assets/meditations/create`;
	const meditationRoute = `/users/${userId}/careplan/assets/meditations`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
    { name: 'Meditation', path: createRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const meditationCreateModel: MeditationCreateModel = {
				Name: name,
				Description: description,
				MeditationType: meditationType,
				RecommendedDurationMin: recommendedDurationMin,
				Version: version,
				Tags: keywords,
        TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(meditationCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			console.log(meditationCreateModel)
			const res = await fetch(`/api/server/careplan/assets/meditations`, {
				method: 'POST',
				body: JSON.stringify(meditationCreateModel),
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
      <h2 class="form-titles">Create Meditation</h2>
      <a href={assetRoute} class="form-cancel-btn">
        <Icon icon="material-symbols:close-rounded" />
      </a>
    </div>

    <table class="w-full">
      <tbody>
        <tr class="tables-row">
          <td class="table-label">
            Name <span class="important-field">*</span>
          </td>
          <td class="table-data">
            <input
              type="text"
              class="input {errors?.name ? 'input-text-error' : ''}"
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
              class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
              bind:value={description}
              placeholder="Enter description here..."
            ></textarea>
            {#if errors?.Description}
              <p class="error-text">{errors?.Description}</p>
            {/if}
          </td>
        </tr>

        <tr class="tables-row">
          <td class="table-label">Meditation Type</td>
          <td class="table-data">
            <select class="input" bind:value={meditationType}>
              <option>Mindfulness</option>
              <option>Spiritual</option>
              <option>Focused</option>
              <option>Mantra</option>
              <option>Progressive relaxation</option>
              <option>Transcendental</option>
              <option>Visualization</option>
            </select>
            {#if errors?.MeditationType}
              <p class="error-text">{errors?.MeditationType}</p>
            {/if}
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
          <td class="table-label !py-3 align-top">Tags</td>
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
              class="input {errors?.Version ? 'input-text-error' : ''}"
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
            {#await promise}
                <Button type="submit" text="Submitting" variant="primary" disabled={true} />
            {:then data}
                <Button type="submit" text="Submit" variant="primary" />
            {/await}
    </div>

  </form>
</div>
