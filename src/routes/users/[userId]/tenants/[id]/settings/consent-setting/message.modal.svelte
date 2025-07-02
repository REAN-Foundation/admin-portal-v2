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

		const messageModel: ConsentMessage = {
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

</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div
			class="relative w-[90%] max-w-lg rounded-xl border border-[var(--color-outline)] bg-[var(--color-secondary)] p-6 shadow-lg"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-[var(--color-info)]">
					{isEdit ? 'Edit Message' : 'Add Message'}
				</h2>
				<button
					class="cancel-btn"
					onclick={() => onClose()}
				>
					<Icon icon="material-symbols:close-rounded" class="h-5" />
				</button>
			</div>
			<div class="space-y-4">
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label
						class="mx-1 mb-2 w-[30%] font-medium text"
						for="languageCode">Language <span class="text-red-700">*</span></label
					>
					<select class="input-field w-[70%] select" bind:value={localMessage.LanguageCode}>
						<option value="" disabled selected>Select language</option>
						{#each languages as lang}
							<option value={lang.code}>{lang.name}</option>
						{/each}
					</select>
				</div>
				{#if errors.LanguageCode}
					<p class="text-error ml-[25%]">{errors.LanguageCode}</p>
				{/if}
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label
						class="mx-1 mb-2 w-[30%] font-medium text"
						for="content">Content <span class="text-red-700">*</span></label
					>
					<textarea
						name="content"
						class="input-field w-[70%]"
						placeholder="Enter content"
						bind:value={localMessage.Content}
					></textarea>
				</div>
				{#if errors.Content}
					<p class="text-error ml-[25%]">{errors.Content}</p>
				{/if}
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label
						class="mx-1 mb-2 w-[30%] font-medium text"
						for="websiteUrl">Website Url <span class="text-red-700">*</span></label
					>
					<input
						type="text"
						name="websiteurl"
						class="input-field w-[70%]"
						placeholder="Enter website URL"
						bind:value={localMessage.WebsiteURL}
					/>
				</div>
				{#if errors.WebsiteURL}
					<p class="text-error ml-[25%]">{errors.WebsiteURL}</p>
				{/if}
				<div class="mt-6 flex justify-end gap-3">
					<button
						class="cancel-btn rounded px-4 py-2 text-sm"
						type="button"
						onclick={() => onClose()}>Cancel</button
					>
					<button
						class="health-system-btn variant-filled-secondary"
						type="button"
						onclick={handleSave}>{isEdit ? 'Update' : 'Save'}</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}
