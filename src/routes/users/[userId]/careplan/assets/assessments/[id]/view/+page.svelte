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
	var assessmentId = page.params.id;
	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/view`;
	const assessmentRoute = `/users/${userId}/careplan/assets/assessments`;

	let { data }: { data: PageServerData } = $props();

	let assessment = $state(data.assessment);
	let assetCode = assessment.AssetCode;
	let name = assessment.Name;
	let description = assessment.Description !== null ? assessment.Description : 'Not specified';
	let template = assessment.Template;
	let templateCode = assessment?.ReferenceTemplateCode ?? null;
	let tags_ = assessment.Tags;
	let tags = tags_.join(', ');
	let version = assessment.Version;

	const assessmentTemplates = data.assessmentTemplates || [];

	const assessmentTemplate = templateCode
		? assessmentTemplates.filter((template) => template.DisplayCode === templateCode)
		: [];

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
		<Heading text="View Assessment" />
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
				<Label text="Template" />
				<td class="table-data">{template}</td>
			</tr>
			<tr class="tables-row">
				<Label text="Template Code" />
				<td class="table-data">
					{assessmentTemplate.length > 0
						? assessmentTemplate[0].DisplayCode
						: templateCode || 'Not specified'}
				</td>
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
