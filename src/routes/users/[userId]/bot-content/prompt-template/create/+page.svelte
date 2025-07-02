<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { PromptTemplateCreateModel } from '$lib/types/prompt.template.types.js';
	import { createOrUpdateSchema } from '$lib/validation/prompt.template.schema.js';
	import InputPrompts from '../prompt.variables.svelte';

	////////////////////////////////////////////////////////////////////////////////

	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	const createRoute = `/users/${userId}/bot-content/prompt-template/create`;
	const groupsRoute = `/users/${userId}/bot-content/prompt-template`;

	const breadCrumbs = [
		{ name: 'Prompt Templates', path: groupsRoute },
		{ name: 'Create', path: createRoute }
	];

	let variables: string[] = $state([]);
	let name = $state('');
	let description = $state('');
	let group = $state();
	let frequency = $state(0);
	let temperature = $state(0);
	let topP = $state(0);
	let prompt = $state('');
	let presence = $state(0);
	let model = $state();
	let useCaseType = $state();

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const promptTemplateCreateModel: PromptTemplateCreateModel = {
				Name: name,
				Description: description,
				UseCaseType: useCaseType as string,
				Group: group as string,
				Variables: variables,
				Temperature: temperature,
				TopP: topP,
				FrequencyPenalty: frequency,
				PresencePenalty: presence,
				Model: model as string,
				Prompt: prompt
			};
			const validationResult = createOrUpdateSchema.safeParse(promptTemplateCreateModel);

			console.log('validation result', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/prompt-template`, {
				method: 'POST',
				body: JSON.stringify(promptTemplateCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response', response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${groupsRoute}/${response?.Data?.id}/view`);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

function extractPlaceholdersFromPrompt(promptText: string): string[] {
	const placeholderRegex = /(?<!\{)\{([^}]+)\}(?!\})/g;
	const matches = [];
	let match;
	
	while ((match = placeholderRegex.exec(promptText)) !== null) {
		const placeholder = match[1].trim();
		if (placeholder && !matches.includes(placeholder)) {
			matches.push(placeholder);
		}
	}
	return matches;
}
 

	function updateVariablesFromPrompt(event) {
		const promptText = event.target.value;
		
		// Extract placeholders from prompt
		const extractedVariables = extractPlaceholdersFromPrompt(promptText);
		
		// Update variables array
		variables = extractedVariables;
		
		console.log('Extracted variables from prompt:', variables);
	}

	// Add this new function to handle when variables are manually changed via InputChips
	function handleVariablesChanged(newVariables: string[]) {
		variables = newVariables;
		console.log('Variables updated via InputChips:', variables);
	}

	function getColorClass(val: number): string {
		if (val < 0.25)
			return '#ef4444';
		else if (val < 0.5)
			return '#facc15'; 
		else if (val < 0.75)
			return '#22c55e'; 
		else return '#3b82f6'; 
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Prompt template</th>
							<th class="text-end">
								<a href={groupsRoute} class="cancel-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="name"
									bind:value={name}
									placeholder="Enter name here..."
									class="health-system-input"
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Description </td>
							<td>
								<textarea
									name="description"
									bind:value={description}
									placeholder="Enter description here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>

						<tr>
							<td>Model <span class="text-red-700">*</span></td>
							<td>
								<select
									class="select w-full"
									required
									name="model"
									bind:value={model}
									placeholder="Select type here..."
								>
									<option value="OpenAi GPT 3.5 Turbo" selected>OpenAi GPT 3.5 Turbo</option>
									<option value="OpenAi GPT 3.5">OpenAi GPT 3.5</option>
									<option value="OpenAi GPT 4 Turbo">OpenAi GPT 4 Turbo</option>
									<option value="OpenAi GPT 4">OpenAi GPT 4</option>
									<option value="OpenAi GPT 4o">OpenAi GPT 4o</option>
									<option value="OpenAi GPT 3.5 Turbo">OpenAi GPT 3.5 Turbo</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>Prompt <span class="text-red-700">*</span></td>
							<td>
								<textarea
									name="prompt"
									bind:value={prompt}
									placeholder="Enter prompt here... Use for placeholders"
									class="input"
									oninput={updateVariablesFromPrompt}
								>
								</textarea>
                                {#if errors?.Prompt}
									<p class="text-error">{errors?.Prompt}</p>
								{/if}
							</td>
						</tr>
                        <tr>
							<td class="align-top">Variables</td>
							<td class="">
								<div class="">
									<InputPrompts 
										bind:keywords={variables}
										keywordsChanged={handleVariablesChanged}
										name="variables"
										id="variables"
									/>
								</div>
							</td>
						</tr>
						<tr>
							<td>Use Case Type</td>
							<td>
								<select
									class="input"
									required
									name="useCaseType"
									bind:value={useCaseType}
									placeholder="Select type here..."
								>
									<option value="Chat" selected>Chat</option>
									<option value="Classification">Classification</option>
									<option value="Extraction">Extraction</option>
									<option value="Summarization">Summarization</option>
									<option value="Generation">Generation</option>
								</select>
							</td>
						</tr>

						<tr>
							<td>Group</td>
							<td>
								<select
									class="input"
									required
									name="group"
									bind:value={group}
									placeholder="Select Group here..."
								>
									<option value="Chat Default" selected>Chat Default</option>
									<option value="Content Generation">Content Generation</option>
									<option value="Generic">Generic</option>
									<option value="Miscellaneous">Miscellaneous</option>
									<option value="Evaluation and Quality">Evaluation and Quality</option>
									<option value="Chat Custom">Chat Custom</option>
								</select>
							</td>
						</tr>
						

						<tr>
							<td>Temperature</td>
							<td>
								<input
									name="temperature"
									type="range"
									min="0"
									max="1"
									step="0.01"
									bind:value={temperature}
									class="h-2 w-full cursor-pointer appearance-none rounded-lg"
									style="background: linear-gradient(to right, {getColorClass(
										temperature
									)} 0%, {getColorClass(temperature)} {temperature * 100}%, #e5e7eb {temperature *
										100}%, #e5e7eb 100%);"
								/>

								<span class="">
									{temperature}
								</span></td
							>
						</tr>
						<tr>
							<td>Top P</td>
							<td>
								<input
									name="topp"
									type="range"
									min="0"
									max="1"
									step="0.01"
									bind:value={topP}
									class="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full"
									style="background: linear-gradient(to right, {getColorClass(
										topP
									)} 0%, {getColorClass(topP)} {topP * 100}%, #d1d5db {topP * 100}%, #d1d5db 100%);"
								/>
								<span class="">
									{topP}
								</span>
							</td>
						</tr>
						<tr>
							<td>Frequency Penalty</td>
							<td class="relative">
								<input
									name="frequencyPenalty"
									type="range"
									min="0"
									max="1"
									step="0.01"
									bind:value={frequency}
									class="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full"
									style="background: linear-gradient(to right, {getColorClass(
										frequency
									)} 0%, {getColorClass(frequency)} {frequency * 100}%, #d1d5db {frequency *
										100}%, #d1d5db 100%);"
								/>

								<span class="">
									{frequency}
								</span>
							</td>
						</tr>
						<tr>
							<td>Presence Penalty</td>
							<td>
								<input
									name="presencePenalty"
									type="range"
									min="0"
									max="1"
									step="0.01"
									bind:value={presence}
									class="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full"
									style="background: linear-gradient(to right, {getColorClass(
										presence
									)} 0%, {getColorClass(presence)} {presence * 100}%, #d1d5db {presence *
										100}%, #d1d5db 100%);"
								/>
								<span class="">
									{presence}
								</span>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
