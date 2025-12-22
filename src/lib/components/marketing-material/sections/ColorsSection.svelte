<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';

	let { marketingState } = $props();

	const colorFields = [
		{ key: 'Primary', label: 'Primary Color' },
		{ key: 'Secondary', label: 'Secondary Color' },
		{ key: 'Text', label: 'Body Text Color' },
		{ key: 'Muted', label: 'Muted Text Color' },
		{ key: 'Accent', label: 'Accent Color (Primary Background)' },
		{ key: 'LightBg', label: 'Light Background Color (Secondary Background)' },
		{ key: 'Panel', label: 'Panel Color' }
	];
</script>

<CollapsibleSection
	id="colors"
	title="Colors"
	description="Primary, secondary, accent and text colors"
	icon="material-symbols:palette-outline"
	isActive={marketingState.activeSection === 'colors'}
	onToggle={() => marketingState.toggleSection('colors')}
>
	{#snippet children()}
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each colorFields as c}
					<div class="my-2 flex flex-col md:flex-row md:items-center">
						<label
							for="styling-{c.key}-color"
							class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
						>{c.label}</label>
						<div class="flex w-[70%] items-center gap-2">
							<input
								type="color"
								id="styling-{c.key}-color"
								bind:value={marketingState.Styling[c.key]}
								disabled={marketingState.disabled}
								class="h-12 w-16 cursor-pointer rounded border-none"
							/>
							<input
								type="text"
								id="styling-{c.key}-text"
								bind:value={marketingState.Styling[c.key]}
								disabled={marketingState.disabled}
								placeholder="#1a472a"
								class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								readonly
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</CollapsibleSection>