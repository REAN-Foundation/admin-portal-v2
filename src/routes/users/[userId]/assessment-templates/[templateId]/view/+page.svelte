<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { scoringApplicableCondition } from '$lib/store/general.store';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	// import { TreeBranch, TreeLeaf, TreeView } from 'svelte-tree-view-component';
	import type { PageServerData } from './$types';
	import TreeView from '$lib/components/tree-view.svelte';

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

	// console.log('assessmentNodes', assessmentNodes);

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
	const assessmentNodeView = (nodeId) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'View', path: viewRoute }
	];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<a
			href={nodeRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			Add Assessment Node</a
		>
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>

	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
				<thead>
					<tr>
						<th>View Assessment</th>
						<th class="text-end">
							<a href={assessmentsRoutes} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Title</td>
						<td>{title}</td>
					</tr>
					<tr>
						<td>Description</td>
						<td>{description}</td>
					</tr>
					<tr>
						<td>Display code</td>
						<td>{displayCode}</td>
					</tr>
					<tr>
						<td>Type</td>
						<td>{type}</td>
					</tr>
					<tr>
						<td>Provider</td>
						<td>{provider}</td>
					</tr>
					<tr>
						<td>Provider Assessment Code</td>
						<td>{providerAssessmentCode}</td>
					</tr>
					<tr>
						<td>Serve List Node Children At Once</td>
						<td>{serveListNodeChildrenAtOnce}</td>
					</tr>
					<tr>
						<td>Scoring Applicable</td>
						<td>{scoringApplicable}</td>
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
						<td class="align-top">Nodes</td>
						<td>
							{#if assessmentNodes.length <= 1}
								<div>Nodes are not available</div>
							{:else}
								<TreeView {assessmentNodes} {assessmentNodeView} />
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
