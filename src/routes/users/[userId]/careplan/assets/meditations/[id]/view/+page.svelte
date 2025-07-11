<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var meditationId = page.params.id;
	const assetType = 'Meditation';
	
	const assetRoute = `/users/${userId}/careplan/assets?assetType=${assetType}`;
	const editRoute = `/users/${userId}/careplan/assets/meditations/${meditationId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/meditations/${meditationId}/view`;
	const meditationRoute = `/users/${userId}/careplan/assets/meditations/create`;

	let { data }: { data: PageServerData } = $props();

	let meditation = $state(data.meditation);
	let assetCode = meditation.AssetCode;
	let name = meditation.Name;
	let description = meditation.Description !== null ? meditation.Description : 'Not specified';
	let meditationType = meditation.MeditationType;
	let recommendedDurationMin = meditation.RecommendedDurationMin;
	let tags_ = meditation.Tags;
	let tags = tags_.join(', ');
	let version = meditation.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
		},
		{
			name: 'Meditation',
			path: meditationRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
  <div class="form-headers">
    <h2 class="form-titles">View Meditation</h2>
    <a href={assetRoute} class="cancel-btn">
      <Icon icon="material-symbols:close-rounded" />
    </a>
  </div>

  <table class="w-full">
    <tbody>
      <tr class="tables-row">
        <td class="table-label">Asset Code</td>
        <td class="table-data">{assetCode}</td>
      </tr>
      <tr class="tables-row">
        <td class="table-label">Name</td>
        <td class="table-data">{name}</td>
      </tr>
      <tr class="tables-row">
        <td class="table-label">Description</td>
        <td class="table-data">{description}</td>
      </tr>
      <tr class="tables-row">
        <td class="table-label">Meditation Type</td>
        <td class="table-data">{meditationType}</td>
      </tr>
      <tr class="tables-row">
        <td class="table-label">Recommended Duration Min</td>
        <td class="table-data">{recommendedDurationMin}</td>
      </tr>
      <tr class="tables-row">
        <td class="table-label">Tags</td>
        <td class="table-data">
          {#if tags.length <= 0}
            <span>Tags not specified</span>
          {:else}
            <span>{tags}</span>
          {/if}
        </td>
      </tr>
      <tr class="tables-row">
        <td class="table-label">Version</td>
        <td class="table-data">{version}</td>
      </tr>
    </tbody>
  </table>

  <div class=" btn-container">
        <Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
        ></Button>
  </div>
</div>
