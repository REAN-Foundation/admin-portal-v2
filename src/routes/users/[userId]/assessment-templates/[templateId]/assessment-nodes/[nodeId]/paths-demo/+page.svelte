<script lang="ts">
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import AssessmentPathManager from '$lib/components/assessment/assessment-path-manager.svelte';
	import type { CAssessmentNodePath } from '$lib/types/assessment-path.types';
	import { page } from '$app/state';

	let { data }: { data: any } = $props();
	
	let nodePaths = $state<CAssessmentNodePath[]>([]);
	let availableNodes = $state([
		{ id: 'node-1', DisplayCode: 'MEDICATION_QUESTION', Title: 'Have you taken your prescribed medications?' },
		{ id: 'node-2', DisplayCode: 'YES_RESPONSE', Title: 'Yes - Medication Taken' },
		{ id: 'node-3', DisplayCode: 'NO_RESPONSE', Title: 'No - Medication Not Taken' },
		{ id: 'node-4', DisplayCode: 'FOLLOW_UP', Title: 'Follow-up Questions' },
		{ id: 'node-5', DisplayCode: 'EXIT', Title: 'Assessment Complete' }
	]);

	const templateId = $derived(page.params.templateId);
	const nodeId = $derived(page.params.nodeId);

	const handlePathChange = (paths: CAssessmentNodePath[]) => {
		nodePaths = paths;
		console.log('Paths updated:', paths);
	};

	const breadcrumbs = [
		{ href: '/users', text: 'Users' },
		{ href: `/users/${page.params.userId}`, text: 'User Dashboard' },
		{ href: `/users/${page.params.userId}/assessment-templates`, text: 'Assessment Templates' },
		{ href: `/users/${page.params.userId}/assessment-templates/${templateId}`, text: 'Template Details' },
		{ href: `/users/${page.params.userId}/assessment-templates/${templateId}/assessment-nodes`, text: 'Assessment Nodes' },
		{ href: `/users/${page.params.userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}`, text: 'Node Details' },
		{ href: '#', text: 'Paths Demo' }
	];
</script>

<div class="container mx-auto px-4 py-8">
	<BreadCrumbs {breadcrumbs} />
	
	<div class="mt-8">
		<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-blue-800">
						Assessment Paths Demo
					</h3>
					<div class="mt-2 text-sm text-blue-700">
						<p>This demo shows how to configure assessment paths with conditions for Yes/No questions.</p>
						<p class="mt-1"><strong>Example:</strong> "Have you taken your prescribed medications?" with Yes/No options.</p>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Current Node Info -->
			<div class="lg:col-span-1">
				<div class="bg-white rounded-lg shadow p-6">
					<h3 class="text-lg font-semibold mb-4">Current Node</h3>
					<div class="space-y-3">
						<div>
							<label class="block text-sm font-medium text-gray-700">Question</label>
							<p class="text-sm text-gray-900 mt-1">Have you taken your prescribed medications?</p>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Node ID</label>
							<p class="text-sm text-gray-900 mt-1 font-mono">{nodeId}</p>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Template ID</label>
							<p class="text-sm text-gray-900 mt-1 font-mono">{templateId}</p>
						</div>
					</div>
				</div>

				<!-- Available Nodes -->
				<div class="bg-white rounded-lg shadow p-6 mt-6">
					<h3 class="text-lg font-semibold mb-4">Available Next Nodes</h3>
					<div class="space-y-2">
						{#each availableNodes as node}
							<div class="flex items-center justify-between p-2 bg-gray-50 rounded">
								<div>
									<span class="text-sm font-medium">{node.DisplayCode}</span>
									<p class="text-xs text-gray-600">{node.Title}</p>
								</div>
								<span class="text-xs text-gray-500 font-mono">{node.id}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Path Manager -->
			<div class="lg:col-span-2">
				<AssessmentPathManager 
					bind:paths={nodePaths}
					bind:availableNodes={availableNodes}
					onPathChange={handlePathChange}
					parentNodeId={nodeId}
					templateId={templateId}
				/>
			</div>
		</div>

		<!-- Instructions -->
		<div class="mt-8 bg-gray-50 rounded-lg p-6">
			<h3 class="text-lg font-semibold mb-4">How to Use</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h4 class="font-medium text-gray-900 mb-2">1. Create Paths</h4>
					<ul class="text-sm text-gray-700 space-y-1">
						<li>• Click "Add Yes/No Paths" to quickly create paths for Yes and No answers</li>
						<li>• Or use individual buttons (Yes, No, Maybe, Skip) for specific answers</li>
						<li>• Use "Add Custom Path" for other answer types</li>
					</ul>
				</div>
				<div>
					<h4 class="font-medium text-gray-900 mb-2">2. Configure Conditions</h4>
					<ul class="text-sm text-gray-700 space-y-1">
						<li>• Click "Add Condition" on each path to set up conditional logic</li>
						<li>• Configure operands (ReceivedAnswer vs ExpectedAnswer)</li>
						<li>• Set operator types (Equal to, Not equal to, etc.)</li>
					</ul>
				</div>
				<div>
					<h4 class="font-medium text-gray-900 mb-2">3. Set Next Nodes</h4>
					<ul class="text-sm text-gray-700 space-y-1">
						<li>• Click "Set Next Node" to choose where the assessment flows</li>
						<li>• Select from available nodes in the dropdown</li>
						<li>• Add optional messages to show before the next node</li>
					</ul>
				</div>
				<div>
					<h4 class="font-medium text-gray-900 mb-2">4. Example Flow</h4>
					<ul class="text-sm text-gray-700 space-y-1">
						<li>• Yes → Follow-up Questions</li>
						<li>• No → Exit Assessment</li>
						<li>• Each path can have different conditions and messages</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div> 