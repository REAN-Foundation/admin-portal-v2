<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import ImageUpload from '../ImageUpload.svelte';

	let {
		marketingState,
		data,
		getImageUrl,
		onImageSelected
	} = $props();
</script>

<CollapsibleSection
	id="images"
	title="Images"
	description="Title image and user interface image"
	icon="material-symbols:image-outline"
	isActive={marketingState.activeSection === 'images'}
	onToggle={() => marketingState.toggleSection('images')}
>
	{#snippet children()}
		<div class="flex flex-col gap-4">
			<ImageUpload
				id="title-image"
				title="Title Image"
				fileName={marketingState.titleImageFileName}
				imageUrl={marketingState.Images.TitleImage && (data.marketingMaterial?.Images?.TitleImageUrl || getImageUrl(marketingState.Images.TitleImage))}
				disabled={marketingState.disabled}
				onFileSelect={async (e) => await onImageSelected(e, 'titleImage')}
				onRemove={() => marketingState.clearTitleImage()}
			/>

			<ImageUpload
				id="user-interface-image"
				title="Secondary Title image"
				fileName={marketingState.userInterfaceImageFileName}
				imageUrl={marketingState.Images.UserInterfaceImage && (data.marketingMaterial?.Images?.UserInterfaceImageUrl || getImageUrl(marketingState.Images.UserInterfaceImage))}
				disabled={marketingState.disabled}
				onFileSelect={async (e) => await onImageSelected(e, 'userInterfaceImage')}
				onRemove={() => marketingState.clearUserInterfaceImage()}
			/>
		</div>
	{/snippet}
</CollapsibleSection>