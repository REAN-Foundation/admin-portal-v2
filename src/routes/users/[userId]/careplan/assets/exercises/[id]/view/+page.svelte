<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	var exerciseId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/exercises/${exerciseId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/exercises/${exerciseId}/view`;
	const exerciseRoute = `/users/${userId}/careplan/assets/exercises`;

	let { data }: { data: PageServerData } = $props();

	let exercise = $state(data.exercise);
	let assetCode = exercise.AssetCode;
	let name = exercise.Name;
	let description = exercise.Description !== null ? exercise.Description : 'Not specified';
	let exerciseType = exercise.ExerciseType;
	let intensityLevel = exercise.IntensityLevel;
	let recommendedDurationMin = exercise.RecommendedDurationMin;
	let tags_ = exercise.Tags;
	let tags = tags_.join(', ');
	let version = exercise.Version;

	const breadCrumbs = [
		{
			name: 'Assets',
			path: assetRoute
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
		<Heading text="View Exercise" />
		<a href={assetRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>

	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Asset Code" />
				<td class="table-data">{assetCode}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{name}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Exercise Type" />
				<td class="table-data">{exerciseType}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Intensity Level" />
				<td class="table-data">{intensityLevel}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Recommended Duration Min" />
				<td class="table-data">{recommendedDurationMin}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Tags" />
				<td class="table-data">
					{#if tags.length <= 0}
						<span>Tags not specified</span>
					{:else}
						<span>{tags}</span>
					{/if}
				</td>
			</tr>
			<tr class="tables-row">
				<Label text="Version" />
				<td class="table-data">{version}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="mdi:edit"
			iconSize="md"
			size="md"
		/>
	</div>
</div>
