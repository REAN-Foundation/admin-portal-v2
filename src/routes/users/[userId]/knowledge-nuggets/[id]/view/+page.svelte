<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let id = data.knowledgeNugget.id;
	let topicName = data.knowledgeNugget.TopicName;
	let briefInformation =
		data.knowledgeNugget.BriefInformation !== null
			? data.knowledgeNugget.BriefInformation
			: 'Not specified';
	let detailedInformation =
		data.knowledgeNugget.DetailedInformation !== null
			? data.knowledgeNugget.DetailedInformation
			: 'Not specified';
	let additionalResources_ = data.knowledgeNugget.AdditionalResources;
	let additionalResources = additionalResources_.join(', ');
	let tags_ = data.knowledgeNugget.Tags;
	let tags = tags_.join(', ');

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/knowledge-nuggets/${id}/edit`;
	const viewRoute = `/users/${userId}/knowledge-nuggets/${id}/view`;
	const knowledgeNuggetsRoute = `/users/${userId}/knowledge-nuggets`;

	const breadCrumbs = [
		{ name: 'Knowledge Nuggets', path: knowledgeNuggetsRoute },
		{ name: 'View', path: viewRoute }
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Knowledge Nugget</h2>
		<a href={knowledgeNuggetsRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">{topicName}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Brief Information</td>
				<td class="table-data">{briefInformation ? briefInformation : 'Not specified'}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Detailed Information</td>
				<td class="table-data">{detailedInformation ? detailedInformation : 'Not specified'}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Additional Resource</td>
				<td class="table-data">
					{#if additionalResources.length <= 0}
						Not specified
					{:else}
						<ul>
							{#each additionalResources.split(',') as a}
								<li>{a}</li>
							{/each}
						</ul>
					{/if}
				</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Tags</td>
				<td class="table-data">
					{#if tags.length <= 0}
						Tags not specified
					{:else}
						{tags}
					{/if}
				</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md" />
	</div>
</div>
