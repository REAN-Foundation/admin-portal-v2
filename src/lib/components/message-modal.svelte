<script lang="ts">
	import { languages } from '$lib/utils/language';
	import Button from '$lib/components/button/button.svelte';

	let {
		isOpen = false,
		onClose = () => {},
		onSave = (msg) => {},
		message = { LanguageCode: '', Content: '', URL: '' },
		isEdit = false,
		allMessages = [],
		editingIndex = null,
		title = 'Message',
		urlLabel = 'URL',
		urlRequired = false,
		urlPlaceholder = 'Enter URL',
		contentPlaceholder = 'Enter message content',
		validationSchema
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

		// Use the validation schema if provided
		if (validationSchema) {
			const validationResult = validationSchema.safeParse(localMessage);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
		}

		// Check for duplicate language codes
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

		onSave(localMessage);
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
					{isEdit ? `Edit ${title}` : `Add ${title}`}
				</h2>
				<Button
					variant="icon"
					icon="material-symbols:close-rounded"
					onclick={() => onClose()}
					className="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
				/>
			</div>
			<div class="space-y-4">
				<!-- Language Selection -->
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label class="mx-1 mb-2 w-[30%] font-medium text" for="languageCode">
						Language <span class="text-red-700">*</span>
					</label>
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

				<!-- Content Textarea -->
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label class="mx-1 mb-2 w-[30%] font-medium text" for="content">
						Content <span class="text-red-700">*</span>
					</label>
					<textarea
						name="content"
						class="input-field w-[70%]"
						placeholder={contentPlaceholder}
						bind:value={localMessage.Content}
					></textarea>
				</div>
				{#if errors.Content}
					<p class="text-error ml-[25%]">{errors.Content}</p>
				{/if}

				<!-- URL/WebsiteURL Input -->
				<div class="my-4 flex flex-col md:flex-row md:items-center">
					<label class="mx-1 mb-2 w-[30%] font-medium text" for="url">
						{urlLabel}
						{#if urlRequired}
							<span class="text-red-700">*</span>
						{/if}
					</label>
					<input
						type="text"
						name="url"
						class="input-field w-[70%]"
						placeholder={urlPlaceholder}
						bind:value={localMessage.URL}
					/>
				</div>
				{#if errors.URL || errors.WebsiteURL}
					<p class="text-error ml-[25%]">{errors.URL || errors.WebsiteURL}</p>
				{/if}

				<!-- Action Buttons -->
				<div class="mt-6 flex justify-end gap-3">
					<Button variant="outline" size="sm" text="Cancel" onclick={() => onClose()} className = "border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-red-600"/>
					<Button
						variant="primary"
						size="sm"
						text={isEdit ? 'Update' : 'Save'}
						onclick={handleSave}
					/>
				</div>
			</div>
		</div>
	</div>
{/if}
