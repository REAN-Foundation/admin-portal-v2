<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';

	let { data } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;
	let errors: Record<string, string> = $state({});
	let promise = $state();

	// Check if marketing material already exists (for create vs update)
	const hasExistingData =
		data.marketingMaterial &&
		(Object.keys(data.marketingMaterial).length > 0 ||
			data.marketingMaterial.Styling ||
			data.marketingMaterial.Content);

	// New nested structures for Styling and Content
	let Styling = $state({
		primary: data.marketingMaterial?.Styling?.primary ?? '#1a472a',
		secondary: data.marketingMaterial?.Styling?.secondary ?? '#2d5f3f',
		accent: data.marketingMaterial?.Styling?.accent ?? '#25D366',
		lightBg: data.marketingMaterial?.Styling?.lightBg ?? '#f1f8f4',
		panel: data.marketingMaterial?.Styling?.panel ?? '#ffffff',
		muted: data.marketingMaterial?.Styling?.muted ?? '#555',
		text: data.marketingMaterial?.Styling?.text ?? '#222',
		headingFont: data.marketingMaterial?.Styling?.headingFont ?? "'Poppins', sans-serif",
		bodyFont: data.marketingMaterial?.Styling?.bodyFont ?? "'Inter', sans-serif",
		pageWidth: data.marketingMaterial?.Styling?.pageWidth ?? '210mm',
		pageHeight: data.marketingMaterial?.Styling?.pageHeight ?? '297mm',
		userInterfaceWidth: data.marketingMaterial?.Styling?.userInterfaceWidth ?? '260px',
		userInteractionWidth: data.marketingMaterial?.Styling?.userInteractionWidth ?? '250px',
		qrSize: data.marketingMaterial?.Styling?.qrSize ?? '120px'
	});

	let Content = $state({
		header: {
			mainTitle: data.marketingMaterial?.Content?.header?.mainTitle ?? '',
			subtitle: data.marketingMaterial?.Content?.header?.subtitle ?? ''
		},
		introduction: {
			introParagraph: data.marketingMaterial?.Content?.introduction?.introParagraph ?? '',
			problemStatement: data.marketingMaterial?.Content?.introduction?.problemStatement ?? ''
		},
		benefits: {
			title: data.marketingMaterial?.Content?.benefits?.title ?? 'Key Benefits',
			items: data.marketingMaterial?.Content?.benefits?.items ?? []
		},
		userInterface: {
			heading:
				data.marketingMaterial?.Content?.userInterface?.heading ??
				'Who Can Benefit from This Program',
			paragraph: data.marketingMaterial?.Content?.userInterface?.paragraph ?? ''
		},
		footer: {
			ctaHeading: data.marketingMaterial?.Content?.footer?.ctaHeading ?? 'Get Started Today',
			ctaDescription: data.marketingMaterial?.Content?.footer?.ctaDescription ?? '',
			qrInstruction: data.marketingMaterial?.Content?.footer?.qrInstruction ?? 'Scan to get started'
		}
	});

	// Helper for editing benefits items as newline-separated text
	let benefitsItemsText = $state(
		(Array.isArray(Content.benefits.items) ? Content.benefits.items : []).join('\n')
	);
	$effect(() => {
		Content.benefits.items = benefitsItemsText
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	});

	let disabled = $state(true);
	let edit = $state(false);
	let activeSections = $state(new Set([]));

	const toggleSection = (sectionId: string) => {
		if (activeSections.has(sectionId)) {
			activeSections.delete(sectionId);
		} else {
			activeSections.add(sectionId);
		}
		activeSections = new Set(activeSections);
	};

	const handleEditClick = async () => {
		if (!edit) {
			addToast({
				message: 'Edit mode enabled.',
				type: 'info',
				timeout: 3000
			});
			edit = true;
		} else {
			addToast({
				message: 'Edit mode disabled.',
				type: 'info',
				timeout: 3000
			});
			edit = false;
		}
		disabled = !disabled;
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		try {
			if (disabled) {
				addToast({
					message: 'Nothing to edit !',
					type: 'warning',
					timeout: 3000
				});
				return;
			}

			errors = {};

			// Build payload in the requested nested format
			const payload = {
				Styling,
				Content
			};

			// Determine if this is a create (POST) or update (PUT) operation
			const method = hasExistingData ? 'PUT' : 'POST';
			const action = hasExistingData ? 'updating' : 'creating';

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/MarketingMaterial`, {
				method: method,
				body: JSON.stringify(payload),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				edit = false;
				disabled = true;
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error(
				`Error ${hasExistingData ? 'updating' : 'creating'} marketing material:`,
				error
			);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: `Failed to ${hasExistingData ? 'update' : 'create'} marketing material. Please try again.`
			});
		}
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div
				class="flex items-center justify-end gap-2 border-b border-[var(--color-outline)] bg-[var(--color-primary)] px-5 py-4"
			>
				<button
					type="button"
					class="table-btn variant-filled-secondary gap-1"
					onclick={handleEditClick}
				>
					<Icon icon="material-symbols:edit-outline" />
					Edit
				</button>
				<a
					href={tenantRoute}
					class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
				>
					<Icon icon="material-symbols:close-rounded" class=" h-5" />
				</a>
			</div>

			<div class="flex flex-col space-y-4 px-4 py-4">
				<!-- Styling Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('styling') ? 'border-hover ' : ''} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('styling')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('styling')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:brush-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Styling</p>
								<p class=" text-sm">Colors, fonts and layout sizes</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('styling')}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSections.has('styling')}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<!-- Colors -->
								{#each [{ key: 'primary', label: 'Primary' }, { key: 'secondary', label: 'Secondary' }, { key: 'accent', label: 'Accent' }, { key: 'lightBg', label: 'Light Background' }, { key: 'panel', label: 'Panel' }, { key: 'muted', label: 'Muted Text' }, { key: 'text', label: 'Body Text' }] as c}
									<div class="space-y-2">
										<label for="styling-{c.key}-color" class="text-sm font-medium text-[var(--color-info)]"
											>{c.label} Color</label
										>
										<div class="flex items-center gap-2">
											<input
												type="color"
												id="styling-{c.key}-color"
												bind:value={Styling[c.key]}
												{disabled}
												class="h-12 w-16 cursor-pointer border-none"
											/>
											<input
												type="text"
												id="styling-{c.key}-text"
												bind:value={Styling[c.key]}
												{disabled}
												class="flex-1 rounded border border-gray-300 p-2"
												readonly
											/>
										</div>
									</div>
								{/each}

								<!-- Fonts and sizes -->
								<div class="space-y-2">
									<label for="styling-heading-font" class="text-sm font-medium text-[var(--color-info)]">Heading Font</label>
									<input
										type="text"
										id="styling-heading-font"
										bind:value={Styling.headingFont}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="styling-body-font" class="text-sm font-medium text-[var(--color-info)]">Body Font</label>
									<input
										type="text"
										id="styling-body-font"
										bind:value={Styling.bodyFont}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="styling-page-width" class="text-sm font-medium text-[var(--color-info)]">Page Width</label>
									<input
										type="text"
										id="styling-page-width"
										bind:value={Styling.pageWidth}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="styling-page-height" class="text-sm font-medium text-[var(--color-info)]">Page Height</label>
									<input
										type="text"
										id="styling-page-height"
										bind:value={Styling.pageHeight}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="styling-ui-width" class="text-sm font-medium text-[var(--color-info)]">UI Width</label>
									<input
										type="text"
										id="styling-ui-width"
										bind:value={Styling.userInterfaceWidth}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="styling-interaction-width" class="text-sm font-medium text-[var(--color-info)]"
										>Interaction Width</label
									>
									<input
										type="text"
										id="styling-interaction-width"
										bind:value={Styling.userInteractionWidth}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="styling-qr-size" class="text-sm font-medium text-[var(--color-info)]">QR Size</label>
									<input
										type="text"
										id="styling-qr-size"
										bind:value={Styling.qrSize}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Content Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('content') ? 'border-hover ' : ''} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('content')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('content')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:article-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Content</p>
								<p class=" text-sm">Header, introduction, benefits, UI text, footer</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('content')}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSections.has('content')}
						<div class="space-y-6 p-6">
							<!-- Header -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<label for="content-main-title" class="text-sm font-medium text-[var(--color-info)]">Main Title</label>
									<input
										type="text"
										id="content-main-title"
										bind:value={Content.header.mainTitle}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="content-subtitle" class="text-sm font-medium text-[var(--color-info)]">Subtitle</label>
									<input
										type="text"
										id="content-subtitle"
										bind:value={Content.header.subtitle}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
							</div>

							<!-- Introduction -->
							<div class="space-y-2">
								<label for="content-intro-paragraph" class="text-sm font-medium text-[var(--color-info)]"
									>Introduction Paragraph</label
								>
								<textarea
									id="content-intro-paragraph"
									rows="3"
									bind:value={Content.introduction.introParagraph}
									{disabled}
									class="w-full rounded border border-gray-300 p-2"
								></textarea>
							</div>
							<div class="space-y-2">
								<label for="content-problem-statement" class="text-sm font-medium text-[var(--color-info)]">Problem Statement</label
								>
								<textarea
									id="content-problem-statement"
									rows="3"
									bind:value={Content.introduction.problemStatement}
									{disabled}
									class="w-full rounded border border-gray-300 p-2"
								></textarea>
							</div>

							<!-- Benefits -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<label for="content-benefits-title" class="text-sm font-medium text-[var(--color-info)]">Benefits Title</label>
									<input
										type="text"
										id="content-benefits-title"
										bind:value={Content.benefits.title}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="col-span-1 space-y-2 md:col-span-1">
									<label for="content-benefits-items" class="text-sm font-medium text-[var(--color-info)]"
										>Benefits Items (one per line)</label
									>
									<textarea
										id="content-benefits-items"
										rows="4"
										bind:value={benefitsItemsText}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									></textarea>
								</div>
							</div>

							<!-- User Interface copy -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<label for="content-ui-heading" class="text-sm font-medium text-[var(--color-info)]">UI Heading</label>
									<input
										type="text"
										id="content-ui-heading"
										bind:value={Content.userInterface.heading}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="space-y-2">
									<label for="content-ui-paragraph" class="text-sm font-medium text-[var(--color-info)]">UI Paragraph</label>
									<textarea
										id="content-ui-paragraph"
										rows="3"
										bind:value={Content.userInterface.paragraph}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									></textarea>
								</div>
							</div>

							<!-- Footer -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="space-y-2">
									<label for="content-cta-heading" class="text-sm font-medium text-[var(--color-info)]">CTA Heading</label>
									<input
										type="text"
										id="content-cta-heading"
										bind:value={Content.footer.ctaHeading}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
								<div class="col-span-1 space-y-2 md:col-span-1">
									<label for="content-cta-description" class="text-sm font-medium text-[var(--color-info)]">CTA Description</label
									>
									<textarea
										id="content-cta-description"
										rows="3"
										bind:value={Content.footer.ctaDescription}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									></textarea>
								</div>
								<div class="space-y-2">
									<label for="content-qr-instruction" class="text-sm font-medium text-[var(--color-info)]">QR Instruction</label>
									<input
										type="text"
										id="content-qr-instruction"
										bind:value={Content.footer.qrInstruction}
										{disabled}
										class="w-full rounded border border-gray-300 p-2"
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<hr class="border-[0.5px] border-t border-[var(--color-outline)]" />

			<div class="button-container my-4">
				{#await promise}
					<button type="submit" class="table-btn variant-soft-secondary" disabled>
						Submiting
					</button>
				{:then data}
					<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
				{/await}
			</div>
		</form>
	</div>
</div>
