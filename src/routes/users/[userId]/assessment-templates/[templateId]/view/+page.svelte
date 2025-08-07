<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { scoringApplicableCondition } from '$lib/store/general.store';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';
	import TreeView from '$lib/components/tree-view.svelte';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let assessmentNodes = $state(data.assessmentNodes);
	let assessmentTemplate = $state(data.assessmentTemplate);
	let title = assessmentTemplate.Title;
	let description =
		assessmentTemplate.Description !== null && assessmentTemplate.Description !== ''
			? assessmentTemplate.Description
			: 'Not specified';
	let displayCode = assessmentTemplate.DisplayCode;
	let type = assessmentTemplate.Type;
	let providerAssessmentCode =
		assessmentTemplate.ProviderAssessmentCode !== null &&
		assessmentTemplate.ProviderAssessmentCode !== ''
			? assessmentTemplate.ProviderAssessmentCode
			: 'Not specified';
	let serveListNodeChildrenAtOnce = assessmentTemplate.ServeListNodeChildrenAtOnce;
	let scoringApplicable = assessmentTemplate.ScoringApplicable;
	let provider =
		assessmentTemplate.Provider !== null && assessmentTemplate.Provider !== ''
			? assessmentTemplate.Provider
			: 'Not specified';
	let tags_ = data.assessmentTemplate.Tags;
	let tags = tags_.join(', ');

	$effect(() => {
		assessmentNodes = assessmentNodes.sort((a, b) => {
			return a.Sequence - b.Sequence;
		});
	});

	onMount(() => {
		scoringApplicableCondition.set(assessmentTemplate.ScoringApplicable);
		console.log('scoringApplicableCondition', $scoringApplicableCondition);
	});

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const editRoute = `/users/${userId}/assessment-templates/${templateId}/edit`;
	const viewRoute = `/users/${userId}/assessment-templates/${templateId}/view`;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;
	const nodeRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/create`;
	const pathsRoute = `/users/${userId}/assessment-templates/${templateId}/paths`;
	const assessmentNodeView = (nodeId) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'View', path: viewRoute }
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Template</h2>
		<a href={assessmentsRoutes} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<td class="table-label">Title</td>
				<td class="table-data">{title}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Display code</td>
				<td class="table-data">{displayCode}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Type</td>
				<td class="table-data">{type}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Provider</td>
				<td class="table-data">{provider}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Provider Assessment Code</td>
				<td class="table-data">{providerAssessmentCode}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Serve List Node Children At Once</td>
				<td class="table-data">{serveListNodeChildrenAtOnce}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Scoring Applicable</td>
				<td class="table-data">{scoringApplicable}</td>
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
				<td class="table-label align-top">Nodes</td>
				<td class="table-data">
					{#if assessmentNodes.length <= 1}
						<div>Nodes are not available</div>
					{:else}
						<TreeView {assessmentNodes} {assessmentNodeView} />
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
	<div class="btn-container">
		<Button href={nodeRoute} text="Add node" variant="primary" />
		<Button href={pathsRoute} text="Paths" variant="secondary" iconBefore="mdi:map-marker-path" iconSize="md" />
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md" />
	</div>
</div>
