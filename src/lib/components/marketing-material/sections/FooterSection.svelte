<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import FormField from '../FormField.svelte';

	let { marketingState } = $props();
</script>

<CollapsibleSection
	id="footer"
	title="Footer"
	description="CTA heading, description and QR instruction"
	icon="material-symbols:call-to-action-outline"
	isActive={marketingState.activeSection === 'footer'}
	onToggle={() => marketingState.toggleSection('footer')}
>
	{#snippet children()}
		<div class="space-y-4">
			<FormField
				id="content-cta-heading"
				label="CTA Heading"
				bind:value={marketingState.Content.Footer.CtaHeading}
				disabled={marketingState.disabled}
				placeholder="Get Started Today"
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Footer.CtaHeading, 'ctaHeading').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Footer.CtaHeading, 'ctaHeading')}
			/>
			<FormField
				id="content-cta-description"
				label="CTA Description"
				bind:value={marketingState.Content.Footer.CtaDescription}
				disabled={marketingState.disabled}
				placeholder="Enter CTA description"
				type="textarea"
				rows={3}
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Footer.CtaDescription, 'ctaDescription').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Footer.CtaDescription, 'ctaDescription')}
			/>
			<FormField
				id="content-qr-instruction"
				label="QR Instruction"
				bind:value={marketingState.Content.Footer.QrInstruction}
				disabled={marketingState.disabled}
				placeholder="Scan to get started"
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Footer.QrInstruction, 'qrInstruction').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Footer.QrInstruction, 'qrInstruction')}
			/>
		</div>
	{/snippet}
</CollapsibleSection>