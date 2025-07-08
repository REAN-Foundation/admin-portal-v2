<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Button from '$lib/components/button/button.svelte';

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

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Symptom</h2>
		<a href={symptomRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Symptom</td>
				<td class="table-data">{symptom}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Language</td>
				<td class="table-data">{language}</td>
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
				<td class="table-label align-top">Image</td>
				<td class="table-data">
					{#if imageUrl == undefined || imageUrl == null}
						Not specified
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
	<div class="btn-container">
		<Button
			size="md"
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
		/>
	</div>
</div>
