<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { PromptTemplateUpdateModel } from '$lib/types/prompt.template.types';
	import { createOrUpdateSchema } from '$lib/validation/prompt.template.schema';
	import InputPrompts from '../../prompt.variables.svelte';

	////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let name = $state(data.prompts.Name);
	let description = $state(data.prompts.Description || undefined);
	let prompt = $state(data.prompts.Prompt);
	let model = $state(data.prompts.Model);
	let content = $state(data.prompts.Content);
	let group = $state(data.prompts.Group);
	let useCaseType = $state(data.prompts.UseCaseType);
	let category = $state(data.prompts.Category);
	let temperature = $state(data.prompts.Temperature);
	let topP = $state(data.prompts.TopP);
	let frequencyPenalty = $state(data.prompts.FrequencyPenalty);
	let presencePenalty = $state(data.prompts.PresencePenalty);
	let variables: string[] = $state([]);
	let variableInput = $state('');
    variables = initializeVariables(data.prompts.Prompt);

    // let variables: string = $derived(variablesRaw.join(', '));
    
	let variableStr: string = $state('');
	let version = $state(data.prompts.Version);

	let errors: Record<string, string> = $state({});
	let promise = $state();

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

	function updateVariables(event) {
		const inputValue = event.target.value;

		const matches = inputValue
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item !== '');

		variables = matches;
		console.log('Manual variables input:', variables);
	}

	function getColorClass(val: number): string {
		if (val < 0.25) return '#ef4444';
		else if (val < 0.5) return '#facc15';
		else if (val < 0.75) return '#22c55e';
		else return '#3b82f6';
	}

	const userId = page.params.userId;
	var promptId = page.params.id;
	const createRoute = `/users/${userId}/bot-content/prompt-template/create`;
	const promptRoutes = `/users/${userId}/bot-content/prompt-template`;

	const breadCrumbs = [
		{ name: 'Prompt Template', path: promptRoutes },
		{ name: 'Edit', path: createRoute }
	];

	const handleReset = () => {
		name = data?.prompts?.Name;
		description = data?.prompts?.Description;
		(content = data?.prompts?.Content),
			(group = data?.prompts?.Group),
			(useCaseType = data?.prompts?.UseCaseType),
			(variables = data?.prompts?.Variables),
			(version = data?.prompts?.Version),
			(category = data?.prompts?.Category),
			(errors = {});
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const promptTemplateUpdateModel: PromptTemplateUpdateModel = {
				Name: name,
				Description: description,
				Prompt: prompt,
				Model: model,
				UseCaseType: useCaseType,
				Group: group,
				Variables: variables,
				Temperature: parseFloat(temperature),
				TopP: parseFloat(topP),
				FrequencyPenalty: parseFloat(frequencyPenalty),
				PresencePenalty: parseFloat(presencePenalty)
			};

			const validationResult = createOrUpdateSchema.safeParse(promptTemplateUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/prompt-template/${promptId}`, {
				method: 'PUT',
				body: JSON.stringify(promptTemplateUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${promptRoutes}/${response?.Data?.id}/view`);
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

    function initializeVariables(prompt: string) {
        variables = extractPlaceholdersFromPrompt(prompt);
        variableInput = variables.join(', ');
        return variables;
    }

	function handleVariablesChanged(newVariables: string[]) {
		variables = newVariables;
		console.log('Variables updated via InputPrompts:', variables);
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Prompt Template</th>
							<th class="text-end">
								<a href={promptRoutes} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="name"
									placeholder="Enter name here..."
									class="health-system-input"
									bind:value={name}
								/>
                                {#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>  
						</tr>
						<tr>
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									placeholder="Enter description here..."
									class="health-system-input"
									bind:value={description}
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Model *</td>
							<td>
								<select
									class="select w-full"
									required
									name="model"
									bind:value={model}
									placeholder="Select type here..."
								>
									<option value="OpenAi GPT 3.5 Turbo">OpenAi GPT 3.5 Turbo</option>
									<option value="OpenAi GPT 3.5">OpenAi GPT 3.5</option>
									<option value="OpenAi GPT 4 Turbo">OpenAi GPT 4 Turbo</option>
									<option value="OpenAi GPT 4">OpenAi GPT 4</option>
									<option value="OpenAi GPT 4o">OpenAi GPT 4o</option>
									<option value="OpenAi GPT 3.5 Turbo">OpenAi GPT 3.5 Turbo</option>
								</select>
							</td>
						</tr>
						<!-- <tr>
							<td>Prompt</td>
							<td>
								<textarea
									name="prompt"
									bind:value={prompt}
									required
									placeholder="Enter prompt here..."
									class="input"
									oninput={updateVariables}
								>
								</textarea>
							</td>
						</tr> -->
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
							<td>Use Case Type </td>
							<td>
								<select
									class="input"
									required
									name="useCaseType"
									bind:value={useCaseType}
									placeholder="Select type here..."
								>
									<option value="Chat">Chat</option>
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
						

						<!-- <tr>
							<td class="align-top">Variables</td>
							<td class="">
								<div class="variables-container">
									<input
										name="variables"
										bind:value={variableInput}
										class="health-system-input"
										oninput={updateVariables}
									/>
								</div>
							</td>
						</tr> -->
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
							<td>
								<input
									name="frequencyPenalty"
									type="range"
									min="0"
									max="1"
									step="0.01"
									bind:value={frequencyPenalty}
									class="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full"
									style="background: linear-gradient(to right, {getColorClass(
										frequencyPenalty
									)} 0%, {getColorClass(frequencyPenalty)} {frequencyPenalty *
										100}%, #d1d5db {frequencyPenalty * 100}%, #d1d5db 100%);"
								/>
								<span class="">
									{frequencyPenalty}
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
									bind:value={presencePenalty}
									class="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full"
									style="background: linear-gradient(to right, {getColorClass(
										presencePenalty
									)} 0%, {getColorClass(presencePenalty)} {presencePenalty *
										100}%, #d1d5db {presencePenalty * 100}%, #d1d5db 100%);"
								/>
								<span class="">
									{presencePenalty}
								</span>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
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
