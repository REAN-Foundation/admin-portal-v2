<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';

	let { marketingState } = $props();

	const fontOptions = [
		{ value: '', label: 'Select a font' },
		{ value: "'Poppins', sans-serif", label: 'Poppins' },
		{ value: "'Inter', sans-serif", label: 'Inter' },
		{ value: "'Roboto', sans-serif", label: 'Roboto' },
		{ value: "'Open Sans', sans-serif", label: 'Open Sans' },
		{ value: "'Lato', sans-serif", label: 'Lato' },
		{ value: "'Montserrat', sans-serif", label: 'Montserrat' },
		{ value: "'Raleway', sans-serif", label: 'Raleway' },
		{ value: "'Nunito', sans-serif", label: 'Nunito' },
		{ value: "'Playfair Display', serif", label: 'Playfair Display' },
		{ value: "'Merriweather', serif", label: 'Merriweather' },
		{ value: "'Lora', serif", label: 'Lora' },
		{ value: "'PT Serif', serif", label: 'PT Serif' },
		{ value: "'Roboto Slab', serif", label: 'Roboto Slab' },
		{ value: "'Source Sans Pro', sans-serif", label: 'Source Sans Pro' },
		{ value: "'Ubuntu', sans-serif", label: 'Ubuntu' },
		{ value: "'Oswald', sans-serif", label: 'Oswald' },
		{ value: "'Fira Sans', sans-serif", label: 'Fira Sans' },
		{ value: "'Crimson Text', serif", label: 'Crimson Text' },
		{ value: "'Libre Baskerville', serif", label: 'Libre Baskerville' }
	];
</script>

<CollapsibleSection
	id="fonts"
	title="Fonts"
	description="Heading and body font families"
	icon="material-symbols:font-download"
	isActive={marketingState.activeSection === 'fonts'}
	onToggle={() => marketingState.toggleSection('fonts')}
>
	{#snippet children()}
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="my-2 flex flex-col md:flex-row md:items-start">
					<label
						for="styling-heading-font"
						class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
					>Heading Font</label>
					<div class="w-[70%] flex flex-col">
						<select
							id="styling-heading-font"
							bind:value={marketingState.Styling.HeadingFont}
							disabled={marketingState.disabled}
							class="select input-field w-full"
						>
							{#each fontOptions as font}
								<option value={font.value}>{font.label}</option>
							{/each}
						</select>
						{#if marketingState.Styling.HeadingFont}
							<div class="mt-2 rounded border border-[var(--color-outline)] bg-[var(--color-secondary)] p-2">
								<p class="text-xs text-[var(--color-muted)] mb-1">Example:</p>
								<p style="font-family: {marketingState.Styling.HeadingFont}; font-size: 16px; font-weight: 600;" class="text-[var(--color-info)]">
									This is a heading
								</p>
							</div>
						{/if}
					</div>
				</div>
				<div class="my-2 flex flex-col md:flex-row md:items-start">
					<label
						for="styling-body-font"
						class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
					>Body Font</label>
					<div class="w-[70%] flex flex-col">
						<select
							id="styling-body-font"
							bind:value={marketingState.Styling.BodyFont}
							disabled={marketingState.disabled}
							class="select input-field w-full"
						>
							{#each fontOptions as font}
								<option value={font.value}>{font.label}</option>
							{/each}
						</select>
						{#if marketingState.Styling.BodyFont}
							<div class="mt-2 rounded border border-[var(--color-outline)] bg-[var(--color-secondary)] p-2">
								<p class="text-xs text-[var(--color-muted)] mb-1">Example:</p>
								<p style="font-family: {marketingState.Styling.BodyFont}; font-size: 13px;" class="text-[var(--color-info)]">
									This is body text in the PDF
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</CollapsibleSection>