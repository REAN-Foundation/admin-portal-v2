<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

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


<div class="px-6 py-4">
	<div class="flex flex-wrap gap-2 py-2">
		<a href={editRoute} class="table-btn variant-filled-secondary ml-auto">
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>
	<div class="mx-auto">
		<div class="table-container">
			<table class="table-c">
				<thead>
					<tr>
						<th class=" w-60">View Knowledge Nugget</th>
						<th class="text-end">
							<a href={knowledgeNuggetsRoute} class="cancel-btn ">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name</td>
						<td>{topicName}</td>
					</tr>
					<tr>
						<td>Brief Information</td>
						<td>{briefInformation ? briefInformation : 'Not specified'}</td>
					</tr>
					<tr>
						<td>Detailed Information</td>
						<td>{detailedInformation ? detailedInformation : 'Not specified'}</td>
					</tr>
					<tr>
						<td>Additional Resource</td>
						<td>
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
					<tr>
						<td>Tags</td>
						<td>
							{#if tags.length <= 0}
								Tags not specified
							{:else}
								{tags}
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
