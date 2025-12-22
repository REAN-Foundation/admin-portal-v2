<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast } from '$lib/components/toast/toast.store';
	import CollapsibleSection from '../CollapsibleSection.svelte';
	import FormField from '../FormField.svelte';
	import CharacterCounter from '../CharacterCounter.svelte';
	import { CONTENT_LIMITS } from '../marketing-material.state.svelte';

	let { marketingState } = $props();

	const handleAddBenefit = () => {
		const success = marketingState.addBenefit();
		if (!success) {
			const maxBenefits = CONTENT_LIMITS[marketingState.pageView].maxBenefits;
			addToast({
				message: `Maximum ${maxBenefits} benefits allowed for ${marketingState.pageView}-page view`,
				type: 'warning',
				timeout: 3000
			});
		}
	};
</script>

<CollapsibleSection
	id="benefits"
	title="Benefits"
	description="Benefits title and items list"
	icon="material-symbols:star-outline"
	isActive={marketingState.activeSection === 'benefits'}
	onToggle={() => marketingState.toggleSection('benefits')}
>
	{#snippet children()}
		<div class="space-y-4">
			<FormField
				id="content-benefits-title"
				label="Benefits Title"
				bind:value={marketingState.Content.Benefits.Title}
				disabled={marketingState.disabled}
				placeholder="Key Benefits"
				maxlength={marketingState.getCharacterStatus(marketingState.Content.Benefits.Title, 'benefitsTitle').limits.max}
				characterStatus={marketingState.getCharacterStatus(marketingState.Content.Benefits.Title, 'benefitsTitle')}
			/>

			<div class="my-4 flex items-center justify-between">
				<h4 class="text-sm font-medium text-[var(--color-info)]">Key Benefits</h4>
				<button
					type="button"
					onclick={handleAddBenefit}
					disabled={marketingState.disabled || (marketingState.Content.Benefits.Items ?? []).length >= CONTENT_LIMITS[marketingState.pageView].maxBenefits}
					class="table-btn variant-filled-secondary disabled:cursor-not-allowed disabled:opacity-50"
				>
					Add Benefit
				</button>
			</div>

			<div class="space-y-4">
				{#each marketingState.Content.Benefits.Items ?? [] as benefit, index (index)}
					<div class="my-2 flex flex-col gap-1">
						<div class="flex items-start gap-2">
							<textarea
								id="benefit-item-{index}"
								rows="2"
								bind:value={marketingState.Content.Benefits.Items[index]}
								maxlength={marketingState.getCharacterStatus(benefit, 'benefitItem').limits.max}
								disabled={marketingState.disabled}
								placeholder="Enter benefit text"
								class="input-field flex-1"
							></textarea>
							{#if !marketingState.disabled}
								<button
									type="button"
									onclick={() => marketingState.removeBenefit(index)}
									class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-light-red)] whitespace-nowrap"
								>
									<Icon icon="material-symbols:delete-outline" class="h-5" />
								</button>
							{/if}
						</div>
						<CharacterCounter
							length={marketingState.getCharacterStatus(benefit, 'benefitItem').length}
							max={marketingState.getCharacterStatus(benefit, 'benefitItem').limits.max}
							min={marketingState.getCharacterStatus(benefit, 'benefitItem').limits.min}
							isValid={marketingState.getCharacterStatus(benefit, 'benefitItem').isValid}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</CollapsibleSection>