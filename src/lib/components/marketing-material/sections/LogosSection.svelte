<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/components/toast/toast.store';
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import Image from '$lib/components/image.svelte';

	let {
		marketingState,
		data,
		getImageUrl,
		onLogoSelected
	} = $props();

	const handleAddLogo = () => {
		const success = marketingState.addLogo();
		if (!success) {
			addToast({
				message: 'Maximum 2 logos allowed',
				type: 'warning',
				timeout: 3000
			});
		}
	};
</script>

<CollapsibleSection
	id="logos"
	title="Logos"
	description="Upload logos"
	icon="material-symbols:workspace-premium-outline"
	isActive={marketingState.activeSection === 'logos'}
	onToggle={() => marketingState.toggleSection('logos')}
>
	{#snippet children()}
		<div class="flex flex-col gap-4">
			<div class="my-4 flex items-center justify-between">
				<h4 class="text-sm font-medium text-[var(--color-info)]">
					Logos ({marketingState.Logos.length} / 2)
				</h4>
				{#if !marketingState.disabled && marketingState.Logos.length < 2}
					<button type="button" onclick={handleAddLogo} class="table-btn variant-filled-secondary">
						Add Logo
					</button>
				{/if}
			</div>

			<div class="flex flex-col gap-4">
				{#each marketingState.Logos as logo, index (index)}
					<div class="relative rounded-lg border border-[var(--color-outline)] bg-[var(--color-primary)] p-4 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<h4 class="text-base text-[var(--color-info)]">Logo {index + 1}</h4>
							{#if !marketingState.disabled}
								<button
									type="button"
									onclick={() => marketingState.removeLogo(index)}
									class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-light-red)]"
								>
									<Icon icon="material-symbols:delete-outline" class="h-5" />
								</button>
							{/if}
						</div>

						<div class="mb-2">
							<label
								for="logo-upload-{index}"
								class="mb-2 block text-xs font-medium tracking-wide text-[var(--color-info)]"
							>
								Logo File
							</label>
							<div class="relative flex items-center rounded border border-[var(--color-outline)] bg-[var(--color-primary)]">
								<label class="health-system-btn variant-filled-secondary" for="logo-upload-{index}">
									Select File
									<input
										type="file"
										id="logo-upload-{index}"
										accept="image/*"
										class="hidden"
										disabled={marketingState.disabled}
										onchange={async (e) => await onLogoSelected(e, index)}
									/>
								</label>
								<input
									type="text"
									value={marketingState.logoFileNames[index] || ''}
									readonly
									disabled={marketingState.disabled}
									class="flex-1 border-0 bg-transparent px-3 py-2 text-sm text-[var(--color-info)] placeholder-[var(--color-muted)] focus:outline-none"
									placeholder="No file selected..."
								/>
							</div>
						</div>

						{#if marketingState.Logos[index] && (data.marketingMaterial?.LogoUrls?.[index] || getImageUrl(marketingState.Logos[index]))}
							<div class="mt-4">
								<Image
									cls="h-24 w-24 rounded border border-[var(--color-outline)] object-cover"
									source={data.marketingMaterial?.LogoUrls?.[index] || getImageUrl(marketingState.Logos[index])}
									w="24"
									h="24"
								/>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</CollapsibleSection>