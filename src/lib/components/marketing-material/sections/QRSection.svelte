<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import ImageUpload from '../ImageUpload.svelte';

	let {
		marketingState,
		data,
		getImageUrl,
		onQRCodeSelected
	} = $props();
</script>

<CollapsibleSection
	id="qrcode"
	title="QR Code"
	description="Upload QR code"
	icon="material-symbols:qr-code-scanner"
	isActive={marketingState.activeSection === 'qrcode'}
	onToggle={() => marketingState.toggleSection('qrcode')}
>
	{#snippet children()}
		<div class="flex flex-col gap-4">
			<ImageUpload
				id="qrcode"
				title="QR Code"
				fileName={marketingState.qrCodeFileName}
				imageUrl={marketingState.QRcode && typeof marketingState.QRcode === 'object' && marketingState.QRcode.ResourceId && (data.marketingMaterial?.QRCode?.imageUrl || getImageUrl(marketingState.QRcode.ResourceId))}
				disabled={marketingState.disabled}
				onFileSelect={onQRCodeSelected}
				onRemove={() => marketingState.clearQRCode()}
				error={marketingState.errors.qrCode}
				helpText="QR code must be at least 200x200 pixels and a valid QR code image."
			/>
		</div>
	{/snippet}
</CollapsibleSection>