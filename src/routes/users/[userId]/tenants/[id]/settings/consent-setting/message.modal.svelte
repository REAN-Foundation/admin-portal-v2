<script lang="ts">
	import type { ConsentMessage } from '$lib/types/tenant.settings.types';
	import { languages } from '$lib/utils/language';
	import { ConsentMessageSchema } from '$lib/validation/tenant.settings.schema';
	import Icon from '@iconify/svelte';

	let { 
		isOpen = false, 
		onClose = () => {}, 
		onSave = (msg) => {}, 
		message = { LanguageCode: '', Content: '', WebsiteURL: '' }, 
		isEdit = false,
		allMessages = [],
		editingIndex = null
	} = $props();

	let localMessage = $state({ ...message });
	
	let errors: Record<string, string> = $state({});

	$effect(() => {
		if (isOpen) {
			localMessage = { ...message };
			errors = {};
		}
	});

	function handleSave() {
		errors = {};

		const messageModel : ConsentMessage = {
			LanguageCode: localMessage.LanguageCode,
			Content: localMessage.Content,
			WebsiteURL: localMessage.WebsiteURL
		};
		
		const validationResult = ConsentMessageSchema.safeParse(messageModel);
		if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

		const languageExists = allMessages.some((msg, index) => {
			if (isEdit && index === editingIndex) {
				return false;
			}
			return msg.LanguageCode === localMessage.LanguageCode;
		});

		if (languageExists) {
			errors.LanguageCode = `Language '${localMessage.LanguageCode}' already exists.`;
		}
		
		if (Object.keys(errors).length) return;

		onSave(messageModel);
		onClose();
	}

	function getLanguageName(code: string) {
		const lang = languages.find(l => l.code === code);
		return lang ? lang.name : code;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="relative w-[90%] max-w-lg rounded-xl border border-[var(--color-outline)] bg-[var(--color-secondary)] p-6 shadow-lg">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-[var(--color-info)]">{isEdit ? 'Edit Message' : 'Add Message'}</h2>
				<button class="inline-flex items-center justify-center rounded-md border-[0.5px] !border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200" onclick={() => onClose()}>
					<Icon icon="material-symbols:close-rounded" class="h-5" />
				</button>
			</div>
			<div class="space-y-4">
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label class="mx-1 mb-2 block w-[30%] text-sm font-medium text-[var(--color-info)]" for="languageCode">Language<span class="text-red-700">*</span></label>
					<select class="input-field w-[70%]" bind:value={localMessage.LanguageCode}>
						<option value="" disabled selected>Select language</option>
						{#each languages as lang}
							<option value={lang.code}>{lang.name}</option>
						{/each}
					</select>
				</div>
			{#if errors.LanguageCode}
					<p class="text-error ml-[30%]">{errors.LanguageCode}</p>
				{/if}
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label class="mx-1 mb-2 block w-[30%] text-sm font-medium text-[var(--color-info)]" for="content">Content</label>
					<textarea
						name="content"
						class="input-field w-[70%]"
						placeholder="Enter content"
						bind:value={localMessage.Content}
					></textarea>
				</div>
				{#if errors.Content}
					<p class="text-error ml-[30%]">{errors.Content}</p>
				{/if}
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label class="mx-1 mb-2 block w-[30%] text-sm font-medium text-[var(--color-info)]" for="websiteUrl">Website Url</label>
					<input
						type="text"
						name="websiteurl"
						class="input-field w-[70%]"
						placeholder="Enter website URL"
						bind:value={localMessage.WebsiteURL}
					/>
				</div>
				{#if errors.WebsiteURL}
					<p class="text-error ml-[30%]">{errors.WebsiteURL}</p>
				{/if}
				<div class="flex justify-end gap-3 mt-6">
					<button class="health-system-btn variant-soft-secondary" type="button" onclick={() => onClose()}>Cancel</button>
					<button class="health-system-btn variant-filled-secondary" type="button" onclick={handleSave}>{isEdit ? 'Update' : 'Save'}</button>
				</div>
			</div>
		</div>
	</div>
{/if} 