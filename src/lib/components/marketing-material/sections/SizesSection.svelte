<script lang="ts">
	import CollapsibleSection from '../CollapsibleSection.svelte';

	let { marketingState } = $props();

	const pageWidthOptions = [
		{ value: '', label: 'Select page width' },
		{ value: '148mm', label: 'A6 (148mm)', disabled: true },
		{ value: '210mm', label: 'A5 (210mm)', disabled: true },
		{ value: '297mm', label: 'A4 (297mm)', disabled: false },
		{ value: '420mm', label: 'A3 (420mm)', disabled: true },
		{ value: '216mm', label: 'Letter (216mm)', disabled: true },
		{ value: '279mm', label: 'Legal (279mm)', disabled: true },
		{ value: '200mm', label: 'Custom 200mm', disabled: true },
		{ value: '250mm', label: 'Custom 250mm', disabled: true },
		{ value: '300mm', label: 'Custom 300mm', disabled: true },
		{ value: '350mm', label: 'Custom 350mm', disabled: true }
	];

	const pageHeightOptions = [
		{ value: '', label: 'Select page height' },
		{ value: '105mm', label: 'A6 (105mm)', disabled: true },
		{ value: '148mm', label: 'A5 (148mm)', disabled: true },
		{ value: '210mm', label: 'A4 (210mm)', disabled: false },
		{ value: '297mm', label: 'A3 (297mm)', disabled: true },
		{ value: '279mm', label: 'Letter (279mm)', disabled: true },
		{ value: '356mm', label: 'Legal (356mm)', disabled: true },
		{ value: '250mm', label: 'Custom 250mm', disabled: true },
		{ value: '300mm', label: 'Custom 300mm', disabled: true },
		{ value: '350mm', label: 'Custom 350mm', disabled: true },
		{ value: '400mm', label: 'Custom 400mm', disabled: true }
	];

	const marginOptions = [
		{ value: '', label: 'Select margin' },
		{ value: '200px', label: '200px' },
		{ value: '240px', label: '240px' },
		{ value: '260px', label: '260px' },
		{ value: '280px', label: '280px' },
		{ value: '300px', label: '300px' },
		{ value: '320px', label: '320px' },
		{ value: '350px', label: '350px' },
		{ value: '400px', label: '400px' },
		{ value: '450px', label: '450px' },
		{ value: '500px', label: '500px' }
	];

	const interactionWidthOptions = [
		{ value: '', label: 'Select interaction width' },
		{ value: '200px', label: '200px' },
		{ value: '220px', label: '220px' },
		{ value: '250px', label: '250px' },
		{ value: '270px', label: '270px' },
		{ value: '300px', label: '300px' },
		{ value: '320px', label: '320px' },
		{ value: '350px', label: '350px' },
		{ value: '380px', label: '380px' },
		{ value: '400px', label: '400px' },
		{ value: '450px', label: '450px' }
	];
</script>

<CollapsibleSection
	id="sizes"
	title="Sizes"
	description="Page dimensions and content sizes"
	icon="material-symbols:straighten-outline"
	isActive={marketingState.activeSection === 'sizes'}
	onToggle={() => marketingState.toggleSection('sizes')}
>
	{#snippet children()}
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="my-2 flex flex-col md:flex-row md:items-center">
					<label
						for="styling-page-width"
						class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
					>
						Page Width
					</label>
					<select
						id="styling-page-width"
						bind:value={marketingState.Styling.PageWidth}
						disabled={marketingState.disabled}
						class="select input-field w-[70%]"
					>
						{#each pageWidthOptions as option}
							<option value={option.value} disabled={option.disabled}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="my-2 flex flex-col md:flex-row md:items-center">
					<label
						for="styling-page-height"
						class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
					>
						Page Height
					</label>
					<select
						id="styling-page-height"
						bind:value={marketingState.Styling.PageHeight}
						disabled={marketingState.disabled}
						class="select input-field w-[70%]"
					>
						{#each pageHeightOptions as option}
							<option value={option.value} disabled={option.disabled}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="my-2 flex flex-col md:flex-row md:items-center">
					<label
						for="styling-ui-width"
						class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
					>
						Margin
					</label>
					<select
						id="styling-ui-width"
						bind:value={marketingState.Styling.UserInterfaceWidth}
						disabled={marketingState.disabled}
						class="select input-field w-[70%]"
					>
						{#each marginOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="my-2 flex flex-col md:flex-row md:items-center">
					<label
						for="styling-interaction-width"
						class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
					>
						Interaction Width
					</label>
					<select
						id="styling-interaction-width"
						bind:value={marketingState.Styling.UserInteractionWidth}
						disabled={marketingState.disabled}
						class="select input-field w-[70%]"
					>
						{#each interactionWidthOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	{/snippet}
</CollapsibleSection>