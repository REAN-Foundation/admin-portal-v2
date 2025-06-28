<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	console.log("data=====================>", data);
	let symptom = data.symptom.Symptom;
	let description = data.symptom.Description !== null ? data.symptom.Description : 'Not specified';
	let tags = data.symptom.Tags;

	let language = data.symptom.Language;
	let imageUrl = data.symptom.ImageResourceUrl;
	console.log("Imageurl", imageUrl)
	console.log("data=====================>", symptom);

	if (tags.length < 1) {
		tags = tags.join(', ');
	}

	const userId = page.params.userId;
	const symptomId = page.params.id;
	const editRoute = `/users/${userId}/symptoms/${symptomId}/edit`;
	const viewRoute = `/users/${userId}/symptoms/${symptomId}/view`;
	const symptomRoute = `/users/${userId}/symptoms`;

	const breadCrumbs = [
		{
			name: 'Symptoms',
			path: symptomRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Symptom</th>
						<th class="text-end">
							<a href={symptomRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Symptom</td>
						<td>{symptom}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
					<tr>
						<td>Language</td>
						<td>{language}</td>
					</tr>
					<tr>
						<td>Tags</td>
						<td>
							{#if tags.length <= 0}
								<span class="span">Tags not specified</span>
							{:else}
								<span class="span">{tags}</span>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="align-top">Image</td>
						<td>
							{#if imageUrl == undefined || imageUrl == null}
								Not specified
							{:else}

								<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
								<!-- <img src={imageUrl} alt="Symptom Image" class="flex h-24 w-24 rounded-lg" /> -->
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
