import type { PromptTemplateCreateModel } from '$lib/types/prompt.template.types';

export function usePromptTemplate() {
	// State variables
	let name = $state('');
	let description = $state('');
	let content = $state('');
	let group = $state('');
	let category = $state('');
	let version = $state<number | undefined>(undefined);
	let frequency = $state(0);
	let temperature = $state(0);
	let topP = $state(0);
	let prompt = $state('');
	let presence = $state(0);
	let model = $state('');
	let useCaseType = $state('');
	let variables = $state<string[]>([]);
	let errors = $state<Record<string, string>>({});
	let isLoading = $state(false);

	// Derived state
	const isFormValid = $derived(
		name.trim() !== '' && 
		prompt.trim() !== '' && 
		model.trim() !== '' && 
		useCaseType.trim() !== '' && 
		group.trim() !== ''
	);

	const formData = $derived<PromptTemplateCreateModel>({
		Name: name,
		Description: description,
		UseCaseType: useCaseType,
		Group: group,
		Variables: variables,
		Temperature: temperature,
		TopP: topP,
		FrequencyPenalty: frequency,
		PresencePenalty: presence,
		Model: model,
		Prompt: prompt
	});

	// Utility functions
	function extractPlaceholdersFromPrompt(promptText: string): string[] {
		const placeholderRegex = /\{([^}]+)\}/g;
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

	function getColorClass(val: number): string {
		if (val < 0.25) return '#ef4444';
		else if (val < 0.5) return '#facc15'; 
		else if (val < 0.75) return '#22c55e'; 
		else return '#3b82f6'; 
	}

	// Actions
	function updateVariablesFromPrompt(promptText: string) {
		prompt = promptText;
		variables = extractPlaceholdersFromPrompt(promptText);
	}

	function setErrors(newErrors: Record<string, string>) {
		errors = newErrors;
	}

	function clearErrors() {
		errors = {};
	}

	function resetForm() {
		name = '';
		description = '';
		content = '';
		group = '';
		category = '';
		version = undefined;
		frequency = 0;
		temperature = 0;
		topP = 0;
		prompt = '';
		presence = 0;
		model = '';
		useCaseType = '';
		variables = [];
		errors = {};
		isLoading = false;
	}

	function initializeForm(data: any) {
		name = data.Name || '';
		description = data.Description || '';
		content = data.Content || '';
		group = data.Group || '';
		category = data.Category || '';
		version = data.Version;
		frequency = data.FrequencyPenalty || 0;
		temperature = data.Temperature || 0;
		topP = data.TopP || 0;
		prompt = data.Prompt || '';
		presence = data.PresencePenalty || 0;
		model = data.Model || '';
		useCaseType = data.UseCaseType || '';
		variables = extractPlaceholdersFromPrompt(data.Prompt || '');
	}

	// Return reactive state and functions
	return {
		// State
		get name() { return name; },
		set name(value) { name = value; },
		get description() { return description; },
		set description(value) { description = value; },
		get prompt() { return prompt; },
		set prompt(value) { prompt = value; },
		get model() { return model; },
		set model(value) { model = value; },
		get useCaseType() { return useCaseType; },
		set useCaseType(value) { useCaseType = value; },
		get group() { return group; },
		set group(value) { group = value; },
		get variables() { return variables; },
		set variables(value) { variables = value; },
		get temperature() { return temperature; },
		set temperature(value) { temperature = value; },
		get topP() { return topP; },
		set topP(value) { topP = value; },
		get frequency() { return frequency; },
		set frequency(value) { frequency = value; },
		get presence() { return presence; },
		set presence(value) { presence = value; },
		get errors() { return errors; },
		get isLoading() { return isLoading; },
		set isLoading(value) { isLoading = value; },

		// Derived
		get isFormValid() { return isFormValid; },
		get formData() { return formData; },

		// Methods
		updateVariablesFromPrompt,
		setErrors,
		clearErrors,
		resetForm,
		initializeForm,
		getColorClass
	};
} 
