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
	const optionId = $state(data.optionId);
	const pathId = $state(data.pathId)

	console.log('optionId',optionId )
	console.log('pathId', pathId)

	console.log("Page",page)

	let pathData = $state(data.pathData);
	let options = data.optionData.Text || 'Not Specified';
	let messageBeforeQuestion = pathData.MessageBeforeQuestion ?? 'Not Specified';
	let isExitPath = pathData.IsExitPath;
	let nextNodeDisplayCode = pathData.NextNodeDisplayCode ?? 'Not Specified';

	const assessmentPath = `/users/${userId}/assessment-templates`;
	const templatePath = `/users/${userId}/assessment-templates/${templateId}/view`;
	const nodePath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const optionPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/view`;
	const pathsPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`;
	const editPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/edit`;
	const viewPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/view`;

	console.log("editpath", pathId)
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
					<td class="table-label">Option Text</td>
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
						{isExitPath }
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
