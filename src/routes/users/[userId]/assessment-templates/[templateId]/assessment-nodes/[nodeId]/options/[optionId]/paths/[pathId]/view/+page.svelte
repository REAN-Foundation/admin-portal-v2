<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	const optionId = page.params.optionId;
	const pathId = page.params.pathId;

	let pathData = $state(data.pathData);
	let options = data.optionData.Text || 'N/A';
	let messageBeforeQuestion = pathData.MessageBeforeQuestion || 'No message set';
	let isExitPath = pathData.IsExitPath;
	let nextNode = pathData.NextNode || 'N/A';
	let nextNodeDisplayCode = pathData.NextNodeDisplayCode || 'N/A';

	const assessmentPath = `/users/${userId}/assessment-templates`;
	const templatePath = `/users/${userId}/assessment-templates/${templateId}/view`;
	const nodePath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const optionPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/view`;
	const pathsPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`;
	const editPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/edit`;
	const viewPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/view`;

	const breadCrumbs = [
		{
			name: 'Assessments',
			path: assessmentPath
		},
		{
			name: 'Template',
			path: templatePath
		},
		{
			name: 'Node',
			path: nodePath
		},
		// {
		// 	name: 'Paths',
		// 	path: pathsPath
		// },
		{
			name: 'View Path',
			path: viewPath
		}
	];

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Path</h2>
		<a href={nodePath} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Options</td>
					<td class="table-data">{options}</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Message Before Question</td>
					<td class="table-data">
						{messageBeforeQuestion}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Is Exit Path</td>
					<td class="table-data">
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {isExitPath ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
							{isExitPath ? 'Yes' : 'No'}
						</span>
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Next Node Display Code</td>
					<td class="table-data">{nextNodeDisplayCode}</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button 
				href={editPath}
				text="Edit" 
				variant="primary" 
				iconBefore="mdi:edit" 
				iconSize="md"
			/>
		</div>
</div>
