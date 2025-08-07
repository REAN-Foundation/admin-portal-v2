<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { CAssessmentNodePath, CAssessmentPathCondition } from '$lib/types/assessment-path.types';
    import { ConditionCompositionType, ConditionOperatorType, ConditionOperandDataType, ConditionOperatorTypeList, ConditionCompositionTypeList, ConditionOperandDataTypeList } from '$lib/types/assessment-path.types';

	let { 
		paths = $bindable([]),
		availableNodes = $bindable([]),
		onPathChange = $bindable(),
		parentNodeId = '',
		templateId = '',
		nodeOptions = $bindable([]) // Available answer options for the current node
	} = $props();

	let showAddPathModal = $state(false);
	let showConditionModal = $state(false);
	let showNextNodeModal = $state(false);
	let selectedPath = $state<CAssessmentNodePath | null>(null);
	let selectedCondition = $state<CAssessmentPathCondition | null>(null);
	let selectedAnswerOption = $state('');

	// Common answer options for Yes/No questions
	const commonAnswerOptions = [
		{ value: 'yes', label: 'Yes', color: 'bg-green-100 text-green-800' },
		{ value: 'no', label: 'No', color: 'bg-red-100 text-red-800' },
		{ value: 'maybe', label: 'Maybe', color: 'bg-yellow-100 text-yellow-800' },
		{ value: 'skip', label: 'Skip', color: 'bg-gray-100 text-gray-800' }
	];

	const addNewPath = () => {
		const newPath: CAssessmentNodePath = {
			DisplayCode: `PATH_${Date.now()}`,
			ParentNodeId: parentNodeId || '',
			NextNodeId: '',
			IsExitPath: false,
			MessageBeforeQuestion: ''
		};
		paths = [...paths, newPath];
		selectedPath = newPath;
		showAddPathModal = true;
	};

	const addPathForAnswer = (answerOption: string) => {
		const existingPath = paths.find(p => p.DisplayCode?.includes(answerOption.toUpperCase()));
		if (existingPath) {
			selectedPath = existingPath;
			showAddPathModal = true;
			return;
		}

		const newPath: CAssessmentNodePath = {
			DisplayCode: `PATH_${answerOption.toUpperCase()}_${Date.now()}`,
			ParentNodeId: parentNodeId || '',
			NextNodeId: '',
			IsExitPath: false,
			MessageBeforeQuestion: `Path for answer: ${answerOption}`
		};
		paths = [...paths, newPath];
		selectedPath = newPath;
		selectedAnswerOption = answerOption;
		showAddPathModal = true;
	};

	const editPath = (path: CAssessmentNodePath) => {
		selectedPath = { ...path };
		showAddPathModal = true;
	};

	const deletePath = (pathIndex: number) => {
		paths = paths.filter((_, index) => index !== pathIndex);
		if (onPathChange) onPathChange(paths);
	};

	const savePath = () => {
		if (selectedPath) {
			const index = paths.findIndex(p => p.id === selectedPath.id);
			if (index >= 0) {
				paths[index] = { ...selectedPath };
			} else {
				paths = [...paths, selectedPath];
			}
			if (onPathChange) onPathChange(paths);
		}
		showAddPathModal = false;
		selectedPath = null;
		selectedAnswerOption = '';
	};

	const addCondition = (path: CAssessmentNodePath) => {
		const newCondition: CAssessmentPathCondition = {
			DisplayCode: `COND_${Date.now()}`,
			NodeId: path.ParentNodeId || parentNodeId,
			PathId: path.id,
			IsCompositeCondition: false,
			OperatorType: ConditionOperatorType.EqualTo,
			FirstOperand: { Name: 'ReceivedAnswer', Value: null, DataType: ConditionOperandDataType.Text },
			SecondOperand: { Name: 'ExpectedAnswer', Value: null, DataType: ConditionOperandDataType.Text },
			ThirdOperand: { Name: '', Value: null, DataType: ConditionOperandDataType.Text }
		};
		selectedPath = { ...path, Condition: newCondition };
		selectedCondition = newCondition;
		showConditionModal = true;
	};

	const editCondition = (condition: CAssessmentPathCondition) => {
		selectedCondition = { ...condition };
		showConditionModal = true;
	};

	const setNextNode = (path: CAssessmentNodePath) => {
		selectedPath = { ...path };
		showNextNodeModal = true;
	};

	const saveNextNode = async () => {
		if (selectedPath) {
			try {
				if (selectedPath.NextNodeId) {
					// Set the next node
					const response = await fetch(`/api/server/assessments/${templateId}/nodes/${parentNodeId}/paths/${selectedPath.id}/set-next-node/${selectedPath.NextNodeId}`, {
						method: 'PUT',
						headers: { 'content-type': 'application/json' }
					});
					if (response.ok) {
						const result = await response.json();
						if (result.Status === 'success') {
							const index = paths.findIndex(p => p.id === selectedPath.id);
							if (index >= 0) {
								paths[index] = { ...selectedPath };
							}
							if (onPathChange) onPathChange(paths);
						}
					}
				} else {
					// Remove the next node
					const response = await fetch(`/api/server/assessments/${templateId}/nodes/${parentNodeId}/paths/${selectedPath.id}/set-next-node/remove`, {
						method: 'DELETE',
						headers: { 'content-type': 'application/json' }
					});
					if (response.ok) {
						const result = await response.json();
						if (result.Status === 'success') {
							const index = paths.findIndex(p => p.id === selectedPath.id);
							if (index >= 0) {
								paths[index] = { ...selectedPath };
							}
							if (onPathChange) onPathChange(paths);
						}
					}
				}
			} catch (error) {
				console.error('Failed to save next node:', error);
			}
		}
		showNextNodeModal = false;
		selectedPath = null;
	};

	const saveCondition = async () => {
		if (selectedCondition && selectedPath) {
			try {
				if (selectedCondition.id) {
					// Update existing condition
					const response = await fetch(`/api/server/assessments/${templateId}/nodes/${parentNodeId}/paths/${selectedPath.id}/conditions`, {
						method: 'PUT',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(selectedCondition)
					});
					if (response.ok) {
						const result = await response.json();
						selectedPath.Condition = { ...selectedCondition, ...result.Data };
						selectedPath.ConditionId = selectedCondition.id;
					}
				} else {
					// Create new condition
					const response = await fetch(`/api/server/assessments/${templateId}/nodes/${parentNodeId}/paths/${selectedPath.id}/conditions`, {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(selectedCondition)
					});
					if (response.ok) {
						const result = await response.json();
						selectedPath.Condition = { ...selectedCondition, ...result.Data };
						selectedPath.ConditionId = result.Data.id;
					}
				}
			} catch (error) {
				console.error('Failed to save condition:', error);
			}
		}
		showConditionModal = false;
		selectedCondition = null;
	};

	const getAnswerOptionLabel = (path: CAssessmentNodePath) => {
		const displayCode = path.DisplayCode || '';
		if (displayCode.includes('YES')) return 'Yes';
		if (displayCode.includes('NO')) return 'No';
		if (displayCode.includes('MAYBE')) return 'Maybe';
		if (displayCode.includes('SKIP')) return 'Skip';
		return 'Custom';
	};

	const getAnswerOptionColor = (path: CAssessmentNodePath) => {
		const displayCode = path.DisplayCode || '';
		if (displayCode.includes('YES')) return 'bg-green-100 text-green-800';
		if (displayCode.includes('NO')) return 'bg-red-100 text-red-800';
		if (displayCode.includes('MAYBE')) return 'bg-yellow-100 text-yellow-800';
		if (displayCode.includes('SKIP')) return 'bg-gray-100 text-gray-800';
		return 'bg-blue-100 text-blue-800';
	};
</script>

<div class="assessment-path-manager">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h3 class="text-xl font-semibold">Assessment Paths & Conditions</h3>
			{#if parentNodeId}
				<p class="text-sm text-gray-600">Configure how answers flow to different nodes</p>
			{/if}
		</div>
		<Button text="Add Custom Path" variant="primary" onclick={addNewPath} />
	</div>

	<!-- Quick Add Paths for Common Answer Options -->
	<div class="bg-blue-50 rounded-lg p-4 mb-6">
		<h4 class="text-md font-medium mb-3">Quick Add Paths for Common Answers</h4>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
			{#each commonAnswerOptions as option}
				<Button 
					text={option.label} 
					variant="secondary" 
					onclick={() => addPathForAnswer(option.value)}
				/>
			{/each}
		</div>
	</div>

	{#if paths.length === 0}
		<div class="text-center py-12 text-gray-500">
			<Icon icon="mdi:map-marker-path" class="h-16 w-16 mx-auto mb-4" />
			<p class="text-lg font-medium mb-2">No paths configured</p>
			<p class="text-sm mb-4">Create paths to define how the assessment flows based on answers</p>
			<div class="flex justify-center space-x-3">
				<Button text="Add Yes/No Paths" variant="primary" onclick={() => {
					addPathForAnswer('yes');
					addPathForAnswer('no');
				}} />
				<Button text="Add Custom Path" variant="secondary" onclick={addNewPath} />
			</div>
		</div>
	{:else}
		<!-- Path Summary -->
		<div class="bg-gray-50 rounded-lg p-4 mb-6">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-600">{paths.length}</div>
					<div class="text-gray-600">Total Paths</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">{paths.filter(p => p.Condition).length}</div>
					<div class="text-gray-600">With Conditions</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-purple-600">{paths.filter(p => p.NextNodeId).length}</div>
					<div class="text-gray-600">Connected</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-red-600">{paths.filter(p => p.IsExitPath).length}</div>
					<div class="text-gray-600">Exit Paths</div>
				</div>
			</div>
		</div>
		
		<!-- Paths Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each paths as path, index}
				<div class="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
					<div class="flex justify-between items-start mb-4">
						<div class="flex-1">
							<div class="flex items-center mb-2">
								<span class="inline-block px-3 py-1 rounded-full text-xs font-medium {getAnswerOptionColor(path)}">
									{getAnswerOptionLabel(path)}
								</span>
								{#if path.IsExitPath}
									<span class="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
										Exit Path
									</span>
								{/if}
							</div>
							<h4 class="font-medium text-lg">{path.DisplayCode || `Path ${index + 1}`}</h4>
							
							<!-- Flow Visualization -->
							<div class="mt-3 p-3 bg-gray-50 rounded">
								<div class="flex items-center text-sm">
									<span class="font-medium">Current Node</span>
									<Icon icon="mdi:arrow-right" class="mx-2 text-gray-400" />
									{#if path.NextNodeId}
										<span class="font-medium text-green-600">Next Node</span>
										<span class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
											Connected
										</span>
									{:else}
										<span class="font-medium text-yellow-600">No Target</span>
										<span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
											Set Next Node
										</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex space-x-2">
							<Button text="Edit" variant="secondary" size="sm" onclick={() => editPath(path)} />
							<Button text="Delete" variant="secondary" size="sm" onclick={() => deletePath(index)} />
						</div>
					</div>

					<!-- Condition Section -->
					{#if path.Condition}
						<div class="bg-blue-50 rounded p-4 mb-4">
							<div class="flex justify-between items-center mb-2">
								<span class="text-sm font-medium text-blue-800">Condition: {path.Condition.DisplayCode}</span>
								<Button text="Edit" variant="secondary" size="xs" onclick={() => editCondition(path.Condition)} />
							</div>
							<div class="text-xs text-blue-700">
								<strong>Operator:</strong> {path.Condition.OperatorType}
								{#if path.Condition.FirstOperand?.Name}
									<br><strong>First Operand:</strong> {path.Condition.FirstOperand.Name} = {path.Condition.FirstOperand.Value ?? 'null'}
								{/if}
								{#if path.Condition.SecondOperand?.Name}
									<br><strong>Second Operand:</strong> {path.Condition.SecondOperand.Name} = {path.Condition.SecondOperand.Value ?? 'null'}
								{/if}
							</div>
						</div>
					{:else}
						<div class="text-center py-3 mb-4">
							<Button text="Add Condition" variant="secondary" size="sm" onclick={() => addCondition(path)} />
						</div>
					{/if}

					<!-- Next Node Section -->
					<div class="border-t pt-4">
						<div class="flex justify-between items-center">
							<div>
								<span class="text-sm font-medium">Next Node:</span>
								{#if path.NextNodeId}
									<span class="ml-2 text-sm text-green-600">
										{path.NextNodeDisplayCode || path.NextNodeId}
									</span>
								{:else}
									<span class="ml-2 text-sm text-gray-500">Not set</span>
								{/if}
							</div>
							<Button text="Set Next Node" variant="secondary" size="sm" onclick={() => setNextNode(path)} />
						</div>
					</div>

					{#if path.MessageBeforeQuestion}
						<div class="mt-3 p-2 bg-yellow-50 rounded text-sm">
							<span class="font-medium">Message:</span> {path.MessageBeforeQuestion}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Path Modal -->
{#if showAddPathModal && selectedPath}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold">
					{selectedAnswerOption ? `Configure Path for "${selectedAnswerOption}"` : 'Edit Path'}
				</h3>
				<button onclick={() => showAddPathModal = false} class="text-gray-500 hover:text-gray-700">
					<Icon icon="material-symbols:close" class="h-6 w-6" />
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">Display Code</label>
					<input 
						type="text" 
						bind:value={selectedPath.DisplayCode}
						class="input w-full"
						placeholder="Enter display code"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Parent Node</label>
						<select bind:value={selectedPath.ParentNodeId} class="select w-full">
							<option value="">Select parent node</option>
							{#each availableNodes as node}
								<option value={node.id}>{node.DisplayCode || node.Title}</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Next Node</label>
						<select bind:value={selectedPath.NextNodeId} class="select w-full">
							<option value="">Select next node</option>
							{#each availableNodes as node}
								<option value={node.id}>{node.DisplayCode || node.Title}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium mb-1">Message Before Question</label>
					<textarea 
						bind:value={selectedPath.MessageBeforeQuestion}
						class="textarea w-full"
						rows="3"
						placeholder="Enter message to show before the question"
					></textarea>
				</div>

				<div class="flex items-center">
					<input 
						type="checkbox" 
						bind:checked={selectedPath.IsExitPath}
						id="isExitPath"
						class="mr-2"
					/>
					<label for="isExitPath" class="text-sm">Is Exit Path</label>
				</div>
			</div>

			<div class="flex justify-end space-x-3 mt-6">
				<Button text="Cancel" variant="secondary" onclick={() => showAddPathModal = false} />
				<Button text="Save" variant="primary" onclick={savePath} />
			</div>
		</div>
	</div>
{/if}

<!-- Condition Modal -->
{#if showConditionModal && selectedCondition}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold">Configure Condition</h3>
				<button onclick={() => showConditionModal = false} class="text-gray-500 hover:text-gray-700">
					<Icon icon="material-symbols:close" class="h-6 w-6" />
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">Display Code</label>
					<input 
						type="text" 
						bind:value={selectedCondition.DisplayCode}
						class="input w-full"
						placeholder="Enter condition display code"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Operator Type</label>
						<select bind:value={selectedCondition.OperatorType} class="select w-full">
							{#each ConditionOperatorTypeList as operator}
								<option value={operator}>{operator}</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Is Composite Condition</label>
						<select bind:value={selectedCondition.IsCompositeCondition} class="select w-full">
							<option value={false}>No</option>
							<option value={true}>Yes</option>
						</select>
					</div>
				</div>

				{#if selectedCondition.IsCompositeCondition}
					<div>
						<label class="block text-sm font-medium mb-1">Composition Type</label>
						<select bind:value={selectedCondition.CompositionType} class="select w-full">
							{#each ConditionCompositionTypeList as compositionType}
								<option value={compositionType}>{compositionType}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Operand Configuration -->
				<div class="space-y-4">
					<h4 class="text-md font-medium">Operands Configuration</h4>
					
					<!-- First Operand -->
					<div class="border rounded-lg p-4 bg-gray-50">
						<div class="flex justify-between items-center mb-2">
							<label class="block text-sm font-medium">First Operand (Received Answer)</label>
							<select bind:value={selectedCondition.FirstOperand.DataType} class="select text-xs">
								{#each ConditionOperandDataTypeList as dataType}
									<option value={dataType}>{dataType}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<div>
								<label class="block text-xs font-medium mb-1">Name</label>
								<input 
									type="text" 
									bind:value={selectedCondition.FirstOperand.Name}
									class="input w-full text-sm"
									placeholder="e.g., 'ReceivedAnswer'"
								/>
							</div>
							<div>
								<label class="block text-xs font-medium mb-1">Value</label>
								<input 
									type="text" 
									bind:value={selectedCondition.FirstOperand.Value}
									class="input w-full text-sm"
									placeholder="e.g., 'yes', 'no'"
								/>
							</div>
						</div>
					</div>

					<!-- Second Operand -->
					<div class="border rounded-lg p-4 bg-gray-50">
						<div class="flex justify-between items-center mb-2">
							<label class="block text-sm font-medium">Second Operand (Expected Answer)</label>
							<select bind:value={selectedCondition.SecondOperand.DataType} class="select text-xs">
								{#each ConditionOperandDataTypeList as dataType}
									<option value={dataType}>{dataType}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-2">
							<div>
								<label class="block text-xs font-medium mb-1">Name</label>
								<input 
									type="text" 
									bind:value={selectedCondition.SecondOperand.Name}
									class="input w-full text-sm"
									placeholder="e.g., 'ExpectedAnswer'"
								/>
							</div>
							<div>
								<label class="block text-xs font-medium mb-1">Value</label>
								<input 
									type="text" 
									bind:value={selectedCondition.SecondOperand.Value}
									class="input w-full text-sm"
									placeholder="e.g., 'yes', 'no'"
								/>
							</div>
						</div>
					</div>

					<!-- Third Operand (for Between operations) -->
					{#if selectedCondition.OperatorType === 'Between'}
						<div class="border rounded-lg p-4 bg-gray-50">
							<div class="flex justify-between items-center mb-2">
								<label class="block text-sm font-medium">Third Operand (Upper Bound)</label>
								<select bind:value={selectedCondition.ThirdOperand.DataType} class="select text-xs">
									{#each ConditionOperandDataTypeList as dataType}
										<option value={dataType}>{dataType}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-2">
								<div>
									<label class="block text-xs font-medium mb-1">Name</label>
									<input 
										type="text" 
										bind:value={selectedCondition.ThirdOperand.Name}
										class="input w-full text-sm"
										placeholder="Enter operand name"
									/>
								</div>
								<div>
									<label class="block text-xs font-medium mb-1">Value</label>
									<input 
										type="text" 
										bind:value={selectedCondition.ThirdOperand.Value}
										class="input w-full text-sm"
										placeholder="Enter upper bound value"
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex justify-end space-x-3 mt-6">
				<Button text="Cancel" variant="secondary" onclick={() => showConditionModal = false} />
				<Button text="Save" variant="primary" onclick={saveCondition} />
			</div>
		</div>
	</div>
{/if}

<!-- Next Node Modal -->
{#if showNextNodeModal && selectedPath}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-lg">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold">Set Next Node</h3>
				<button onclick={() => showNextNodeModal = false} class="text-gray-500 hover:text-gray-700">
					<Icon icon="material-symbols:close" class="h-6 w-6" />
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">Next Node</label>
					<select bind:value={selectedPath.NextNodeId} class="select w-full">
						<option value="">Select next node</option>
						{#each availableNodes as node}
							<option value={node.id}>{node.DisplayCode || node.Title}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium mb-1">Message Before Next Node</label>
					<textarea 
						bind:value={selectedPath.MessageBeforeQuestion}
						class="textarea w-full"
						rows="3"
						placeholder="Optional message to show before the next node"
					></textarea>
				</div>
			</div>

			<div class="flex justify-end space-x-3 mt-6">
				<Button text="Cancel" variant="secondary" onclick={() => showNextNodeModal = false} />
				<Button text="Save" variant="primary" onclick={saveNextNode} />
			</div>
		</div>
	</div>
{/if} 