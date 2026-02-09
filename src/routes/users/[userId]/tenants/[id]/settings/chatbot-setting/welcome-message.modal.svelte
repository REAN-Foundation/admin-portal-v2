<script lang="ts">
	import { WelcomeMessageSchema } from '$lib/validation/tenant.settings.schema';
	import MessageModal from '$lib/components/message-modal.svelte';

	let {
		isOpen = false,
		onClose = () => {},
		onSave = (msg) => {},
		message = { LanguageCode: '', Content: '', URL: '' },
		isEdit = false,
		allMessages = [],
		editingIndex = null
	} = $props();
</script>

<MessageModal
	{isOpen}
	{onClose}
	{onSave}
	{message}
	{isEdit}
	{allMessages}
	{editingIndex}
	title="Welcome Message"
	urlLabel="URL"
	urlRequired={false}
	urlPlaceholder="Enter URL"
	contentPlaceholder="Enter welcome message content"
	validationSchema={WelcomeMessageSchema}
/>
