<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import FormField from '../FormField.svelte';

	let { marketingState } = $props();
</script>

<CollapsibleSection
	id="introduction"
	title="Introduction"
	description="Introduction paragraph and problem statement"
	icon="material-symbols:description-outline"
	isActive={marketingState.activeSection === 'introduction'}
	onToggle={() => marketingState.toggleSection('introduction')}
>
	{#snippet children()}
		<div class="space-y-4">
			<FormField
				id="content-intro-paragraph"
				label="Introduction Paragraph"
				bind:value={marketingState.Content.Introduction.IntroParagraph}
				disabled={marketingState.disabled}
				placeholder="Enter introduction paragraph"
				required={true}
				type="textarea"
				rows={3}
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Introduction.IntroParagraph, 'introParagraph').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Introduction.IntroParagraph, 'introParagraph')}
			/>
			<FormField
				id="content-problem-statement"
				label="Problem Statement"
				bind:value={marketingState.Content.Introduction.ProblemStatement}
				disabled={marketingState.disabled}
				placeholder="Enter problem statement"
				type="textarea"
				rows={3}
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Introduction.ProblemStatement, 'problemStatement').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Introduction.ProblemStatement, 'problemStatement')}
			/>
		</div>
	{/snippet}
</CollapsibleSection>