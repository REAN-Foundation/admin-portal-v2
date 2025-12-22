<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import FormField from '../FormField.svelte';

	let { marketingState } = $props();
</script>

<CollapsibleSection
	id="header"
	title="Header"
	description="Main title and subtitle"
	icon="material-symbols:text-fields"
	isActive={marketingState.activeSection === 'header'}
	onToggle={() => marketingState.toggleSection('header')}
>
	{#snippet children()}
		<div class="space-y-4">
			<FormField
				id="content-main-title"
				label="Main Title"
				bind:value={marketingState.Content.Header.MainTitle}
				disabled={marketingState.disabled}
				placeholder="Enter main title"
				required={true}
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Header.MainTitle, 'mainTitle').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Header.MainTitle, 'mainTitle')}
			/>
			<FormField
				id="content-subtitle"
				label="Subtitle"
				bind:value={marketingState.Content.Header.Subtitle}
				disabled={marketingState.disabled}
				placeholder="Enter subtitle"
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Header.Subtitle, 'subtitle').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Header.Subtitle, 'subtitle')}
			/>
		</div>
	{/snippet}
</CollapsibleSection>