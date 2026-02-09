<script lang="ts">
	import { z } from 'zod';
	import MessageModal from '$lib/components/message-modal.svelte';

	let {
		isOpen = false,
		onClose = () => {},
		onSave = (msg) => {},
		message = { LanguageCode: '', Content: '', WebsiteURL: '' },
		isEdit = false,
		allMessages = [],
		editingIndex = null
	} = $props();

	// Create validation schema using URL instead of WebsiteURL for the shared modal
	const ConsentMessageModalSchema = z.object({
		LanguageCode: z.string().min(1, 'Language is required'),
		Content: z.string().min(1, 'Content is required'),
		URL: z.string()
			.trim()
			.min(1, "Website URL is required")
			.url('Invalid URL')
			.refine(
				val => /\.[a-z]{2,}/i.test(val.split('/')[2] || ''),
				{ message: 'URL must contain a valid domain.' }
			)
	});

	// Map WebsiteURL to URL for the shared component
	const mappedMessage = $derived({
		LanguageCode: message.LanguageCode,
		Content: message.Content,
		URL: message.WebsiteURL || ''
	});

	// Wrap onSave to map URL back to WebsiteURL
	const handleSave = (msg) => {
		onSave({
			LanguageCode: msg.LanguageCode,
			Content: msg.Content,
			WebsiteURL: msg.URL
		});
	};
</script>

<MessageModal
	{isOpen}
	{onClose}
	onSave={handleSave}
	message={mappedMessage}
	{isEdit}
	{allMessages}
	{editingIndex}
	title="Consent Message"
	urlLabel="Website URL"
	urlRequired={true}
	urlPlaceholder="Enter website URL"
	contentPlaceholder="Enter consent message content"
	validationSchema={ConsentMessageModalSchema}
/>
