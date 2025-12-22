<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import FormField from '../FormField.svelte';

	let { marketingState } = $props();
</script>

<CollapsibleSection
	id="userInterface"
	title="Types of users"
	description="UI heading and paragraph text"
	icon="material-symbols:phone-android-outline"
	isActive={marketingState.activeSection === 'userInterface'}
	onToggle={() => marketingState.toggleSection('userInterface')}
>
	{#snippet children()}
		<div class="space-y-4">
			<FormField
				id="content-ui-heading"
				label="UI Heading"
				bind:value={marketingState.Content.UserInterface.Heading}
				disabled={marketingState.disabled}
				placeholder="Who Can Benefit from This Program"
				required={true}
				maxlength={marketingState.getCharacterStatus(marketingState.Content.UserInterface.Heading, 'uiHeading').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.UserInterface.Heading, 'uiHeading')}
			/>
			<FormField
				id="content-ui-paragraph"
				label="UI Paragraph"
				bind:value={marketingState.Content.UserInterface.Paragraph}
				disabled={marketingState.disabled}
				placeholder="Enter user interface paragraph"
				type="textarea"
				rows={3}
				maxlength={marketingState.getCharacterStatus(marketingState.Content.UserInterface.Paragraph, 'uiParagraph').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.UserInterface.Paragraph, 'uiParagraph')}
			/>
		</div>
	{/snippet}
</CollapsibleSection>