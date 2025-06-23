import { writable, derived } from 'svelte/store';
import type { PromptTemplateCreateModel, PromptTemplateUpdateModel } from '$lib/types/prompt.template.types';

// State stores
export const promptTemplateForm = writable<{
	name: string;
	description: string;
	content: string;
	group: string;
	category: string;
	version: number | undefined;
	frequency: number;
	temperature: number;
	topP: number;
	prompt: string;
	presence: number;
	model: string;
	useCaseType: string;
	variables: string[];
}>({
	name: '',
	description: '',
	content: '',
	group: '',
	category: '',
	version: undefined,
	frequency: 0,
	temperature: 0,
	topP: 0,
	prompt: '',
	presence: 0,
	model: '',
	useCaseType: '',
	variables: []
});

export const promptTemplateErrors = writable<Record<string, string>>({});
export const promptTemplateLoading = writable(false);

// Derived stores
export const isFormValid = derived(promptTemplateForm, ($form) => {
	return $form.name.trim() !== '' && 
		   $form.prompt.trim() !== '' && 
		   $form.model.trim() !== '' && 
		   $form.useCaseType.trim() !== '' && 
		   $form.group.trim() !== '';
});

// Utilities
export function extractPlaceholdersFromPrompt(promptText: string): string[] {
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

// Actions
export const promptTemplateActions = {
	updateField: (field: string, value: any) => {
		promptTemplateForm.update(form => ({
			...form,
			[field]: value
		}));
	},

	updateVariablesFromPrompt: (promptText: string) => {
		const extractedVariables = extractPlaceholdersFromPrompt(promptText);
		promptTemplateForm.update(form => ({
			...form,
			variables: extractedVariables
		}));
	},

	setErrors: (errors: Record<string, string>) => {
		promptTemplateErrors.set(errors);
	},

	clearErrors: () => {
		promptTemplateErrors.set({});
	},

	resetForm: () => {
		promptTemplateForm.set({
			name: '',
			description: '',
			content: '',
			group: '',
			category: '',
			version: undefined,
			frequency: 0,
			temperature: 0,
			topP: 0,
			prompt: '',
			presence: 0,
			model: '',
			useCaseType: '',
			variables: []
		});
		promptTemplateErrors.set({});
	},

	initializeForm: (data: any) => {
		promptTemplateForm.set({
			name: data.Name || '',
			description: data.Description || '',
			content: data.Content || '',
			group: data.Group || '',
			category: data.Category || '',
			version: data.Version,
			frequency: data.FrequencyPenalty || 0,
			temperature: data.Temperature || 0,
			topP: data.TopP || 0,
			prompt: data.Prompt || '',
			presence: data.PresencePenalty || 0,
			model: data.Model || '',
			useCaseType: data.UseCaseType || '',
			variables: extractPlaceholdersFromPrompt(data.Prompt || '')
		});
	}
}; 
