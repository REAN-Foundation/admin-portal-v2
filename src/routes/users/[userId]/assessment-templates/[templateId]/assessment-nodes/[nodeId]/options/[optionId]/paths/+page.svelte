<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { page } from '$app/state';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';

	///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	// Get route parameters
	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const nodeId = page.params.nodeId;
	const optionId = page.params.optionId;

	// Navigation paths
	const assessmentPath = `/users/${userId}/assessment-templates`;
	const templatePath = `/users/${userId}/assessment-templates/${templateId}/view`;
	const nodePath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`;
	const optionPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/view`;
	const createPath = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/create`;

	// Breadcrumb navigation
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
		{
			name: 'Option',
			path: optionPath
		},
		{
			name: 'Paths',
			path: `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths`
		}
	];

	const handleCreatePath = () => {
		goto(createPath);
	};

	const handleViewPath = (pathId: string) => {
		goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/view`);
	};

	const handleEditPath = (pathId: string) => {
		goto(`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/options/${optionId}/paths/${pathId}/edit`);
	};

	const handleBack = () => {
		goto(optionPath);
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">Assessment Paths</h2>
		<div class="flex space-x-3">
			<Button
				size="sm"
				type="button"
				text="Create New Path"
				variant="primary"
				onclick={handleCreatePath}
			/>
			<button onclick={handleBack} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</button>
		</div>
	</div>

	{#if data.optionData}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Question & Option Information</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h4 class="text-md font-medium text-gray-700 mb-2">Question Node</h4>
					<table class="w-full">
						<tbody>
							<tr class="tables-row">
								<td class="table-label">Node Title</td>
								<td class="table-data">{data.nodeData?.Title || 'N/A'}</td>
							</tr>
							<tr class="tables-row">
								<td class="table-label">Node Type</td>
								<td class="table-data">{data.nodeData?.NodeType || 'N/A'}</td>
							</tr>
							<tr class="tables-row">
								<td class="table-label">Display Code</td>
								<td class="table-data font-mono text-sm">{data.nodeData?.DisplayCode || 'N/A'}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4 class="text-md font-medium text-gray-700 mb-2">Selected Option</h4>
					<table class="w-full">
						<tbody>
							<tr class="tables-row">
								<td class="table-label">Option Text</td>
								<td class="table-data">{data.optionData.Text || 'N/A'}</td>
							</tr>
							<tr class="tables-row">
								<td class="table-label">Sequence</td>
								<td class="table-data">{data.optionData.Sequence || 'N/A'}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	{#if data.paths && data.paths.length > 0}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Path Configuration ({data.paths.length})</h3>
			<div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<div class="flex items-start space-x-3">
					<Icon icon="material-symbols:info-outline" class="text-blue-600 mt-0.5 flex-shrink-0" />
					<div class="text-sm text-blue-800">
						<p class="font-medium">Path Management</p>
						<p>This option can have one path that defines what happens when a user selects this answer. The path determines the next question or action in the assessment flow.</p>
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-200">
							<th class="text-left py-3 px-4 font-medium text-gray-900">Path ID</th>
							<th class="text-left py-3 px-4 font-medium text-gray-900">Message</th>
							<th class="text-left py-3 px-4 font-medium text-gray-900">Exit Path</th>
							<th class="text-left py-3 px-4 font-medium text-gray-900">Next Node</th>
							<th class="text-left py-3 px-4 font-medium text-gray-900">Created</th>
							<th class="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.paths as path}
							<tr class="border-b border-gray-100 hover:bg-gray-50">
								<td class="py-3 px-4 font-mono text-sm text-gray-600">{path.Id || 'N/A'}</td>
								<td class="py-3 px-4 text-gray-900">
									{path.MessageBeforeQuestion || 'No message'}
								</td>
								<td class="py-3 px-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {path.IsExitPath ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
										{path.IsExitPath ? 'Yes' : 'No'}
									</span>
								</td>
								<td class="py-3 px-4 font-mono text-sm text-gray-600">{path.NextNode || 'N/A'}</td>
								<td class="py-3 px-4 text-gray-600">{formatDate(path.CreatedAt)}</td>
								<td class="py-3 px-4">
									<div class="flex space-x-2">
										<Button
											size="xs"
											type="button"
											text="View"
											variant="secondary"
											onclick={() => handleViewPath(path.Id)}
										/>
										<Button
											size="xs"
											type="button"
											text="Edit"
											variant="primary"
											onclick={() => handleEditPath(path.Id)}
										/>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="text-center">
				<Icon icon="material-symbols:path-outline" class="mx-auto h-12 w-12 text-gray-400" />
				<h3 class="mt-2 text-sm font-medium text-gray-900">No Path Configured</h3>
				<p class="mt-1 text-sm text-gray-500">This option doesn't have a path configured yet. Create a path to define what happens when a user selects this answer.</p>
				<div class="mt-6">
					<Button
						size="md"
						type="button"
						text="Create First Path"
						variant="primary"
						onclick={handleCreatePath}
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Navigation -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
		<div class="flex space-x-3">
			<Button
				size="md"
				type="button"
				text="Back to Option"
				variant="secondary"
				onclick={handleBack}
			/>
			<Button
				size="md"
				type="button"
				text="Create New Path"
				variant="primary"
				onclick={handleCreatePath}
			/>
		</div>
	</div>
</div>
