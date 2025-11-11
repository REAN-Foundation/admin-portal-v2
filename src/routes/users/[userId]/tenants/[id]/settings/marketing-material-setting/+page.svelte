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
			items: (data.marketingMaterial?.Content?.benefits?.items ?? []).map((item) => {
				// Handle both string (legacy) and object formats
				if (typeof item === 'string') {
					return { icon: '', title: item, description: '' };
				}
				return {
					icon: item?.icon ?? '',
					title: item?.title ?? '',
					description: item?.description ?? ''
				};
			})
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

	const addBenefit = () => {
		Content.benefits.items = [...Content.benefits.items, { icon: '', title: '', description: '' }];
	};

	const removeBenefit = (index: number) => {
		Content.benefits.items = Content.benefits.items.filter((_, i) => i !== index);
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
			const method = 'POST';

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/marketing-material`, {
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
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class="text-xl text-[var(--color-info)]">Marketing Material</h1>
				<div class="flex items-center gap-2 text-end">
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
						<Icon icon="material-symbols:close-rounded" class="h-5" />
					</a>
				</div>
			</div>

			<div class="flex flex-col space-y-4 px-4 py-4">
				<!-- Colors Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('colors') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('colors')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('colors')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:palette-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Colors</p>
								<p class="text-sm">Primary, secondary, accent and text colors</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('colors')}
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

					{#if activeSections.has('colors')}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								{#each [
									{ key: 'primary', label: 'Primary' },
									{ key: 'secondary', label: 'Secondary' },
									{ key: 'accent', label: 'Accent' },
									{ key: 'lightBg', label: 'Light Background' },
									{ key: 'panel', label: 'Panel' },
									{ key: 'muted', label: 'Muted Text' },
									{ key: 'text', label: 'Body Text' }
								] as c}
									<div class="space-y-2">
										<label
											for="styling-{c.key}-color"
											class="text-sm font-medium text-[var(--color-info)]"
											>{c.label} Color</label
										>
										<div class="flex items-center gap-2">
											<input
												type="color"
												id="styling-{c.key}-color"
												bind:value={Styling[c.key]}
												{disabled}
												class="h-12 w-16 cursor-pointer border-none rounded"
											/>
											<input
												type="text"
												id="styling-{c.key}-text"
												bind:value={Styling[c.key]}
												{disabled}
												class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
												readonly
											/>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Fonts Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('fonts') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('fonts')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('fonts')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:format-size-outline" class="h-5 w-5" />
							<div class="text-start">
								<p class="text-md font-medium">Fonts</p>
								<p class="text-sm">Heading and body font families</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('fonts')}
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

					{#if activeSections.has('fonts')}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="space-y-2">
									<label
										for="styling-heading-font"
										class="text-sm font-medium text-[var(--color-info)]"
										>Heading Font</label
									>
									<input
										type="text"
										id="styling-heading-font"
										bind:value={Styling.headingFont}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
								<div class="space-y-2">
									<label
										for="styling-body-font"
										class="text-sm font-medium text-[var(--color-info)]"
										>Body Font</label
									>
									<input
										type="text"
										id="styling-body-font"
										bind:value={Styling.bodyFont}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Sizes Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('sizes') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('sizes')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('sizes')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:straighten-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Sizes</p>
								<p class="text-sm">Page dimensions and content sizes</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('sizes')}
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

					{#if activeSections.has('sizes')}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="space-y-2">
									<label
										for="styling-page-width"
										class="text-sm font-medium text-[var(--color-info)]"
										>Page Width</label
									>
									<input
										type="text"
										id="styling-page-width"
										bind:value={Styling.pageWidth}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
								<div class="space-y-2">
									<label
										for="styling-page-height"
										class="text-sm font-medium text-[var(--color-info)]"
										>Page Height</label
									>
									<input
										type="text"
										id="styling-page-height"
										bind:value={Styling.pageHeight}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
								<div class="space-y-2">
									<label
										for="styling-ui-width"
										class="text-sm font-medium text-[var(--color-info)]"
										>UI Width</label
									>
									<input
										type="text"
										id="styling-ui-width"
										bind:value={Styling.userInterfaceWidth}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
								<div class="space-y-2">
									<label
										for="styling-interaction-width"
										class="text-sm font-medium text-[var(--color-info)]"
										>Interaction Width</label
									>
									<input
										type="text"
										id="styling-interaction-width"
										bind:value={Styling.userInteractionWidth}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
								<div class="space-y-2">
									<label
										for="styling-qr-size"
										class="text-sm font-medium text-[var(--color-info)]"
										>QR Size</label
									>
									<input
										type="text"
										id="styling-qr-size"
										bind:value={Styling.qrSize}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Header Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('header') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('header')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('header')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:title-outline" class="h-5 w-5" />
							<div class="text-start">
								<p class="text-md font-medium">Header</p>
								<p class="text-sm">Main title and subtitle</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('header')}
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

					{#if activeSections.has('header')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="content-main-title"
									class="text-sm font-medium text-[var(--color-info)]"
									>Main Title</label
								>
								<input
									type="text"
									id="content-main-title"
									bind:value={Content.header.mainTitle}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>
							<div class="space-y-2">
								<label
									for="content-subtitle"
									class="text-sm font-medium text-[var(--color-info)]"
									>Subtitle</label
								>
								<input
									type="text"
									id="content-subtitle"
									bind:value={Content.header.subtitle}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Introduction Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('introduction') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('introduction')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('introduction')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:description-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Introduction</p>
								<p class="text-sm">Introduction paragraph and problem statement</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('introduction')}
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

					{#if activeSections.has('introduction')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="content-intro-paragraph"
									class="text-sm font-medium text-[var(--color-info)]"
									>Introduction Paragraph</label
								>
								<textarea
									id="content-intro-paragraph"
									rows="3"
									bind:value={Content.introduction.introParagraph}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								></textarea>
							</div>
							<div class="space-y-2">
								<label
									for="content-problem-statement"
									class="text-sm font-medium text-[var(--color-info)]"
									>Problem Statement</label
								>
								<textarea
									id="content-problem-statement"
									rows="3"
									bind:value={Content.introduction.problemStatement}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								></textarea>
							</div>
						</div>
					{/if}
				</div>

				<!-- Benefits Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('benefits') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('benefits')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('benefits')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:star-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Benefits</p>
								<p class="text-sm">Benefits title and items list</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('benefits')}
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

					{#if activeSections.has('benefits')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="content-benefits-title"
									class="text-sm font-medium text-[var(--color-info)]"
									>Benefits Title</label
								>
								<input
									type="text"
									id="content-benefits-title"
									bind:value={Content.benefits.title}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>

							<!-- Benefits Items -->
							<div class="space-y-4">
								{#if Content.benefits.items.length === 0}
									<div class="rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] p-4 text-center text-sm text-[var(--color-info)]">
										No benefits added yet. Click "Add Benefit" to create one.
									</div>
								{:else}
									{#each Content.benefits.items as benefit, index}
										<div
											class="rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] p-4"
										>
											<div class="mb-4 flex items-center justify-between">
												<h4 class="text-sm font-medium text-[var(--color-info)]">
													Benefit #{index + 1}
												</h4>
												{#if !disabled}
													<button
														type="button"
														onclick={() => removeBenefit(index)}
														class="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
													>
														Remove
													</button>
												{/if}
											</div>
											<div class="space-y-4">
												<div class="space-y-2">
													<label
														for="benefit-icon-{index}"
														class="text-sm font-medium text-[var(--color-info)]"
														>Icon URL</label
													>
													<input
														type="text"
														id="benefit-icon-{index}"
														bind:value={benefit.icon}
														{disabled}
														class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
														placeholder="Icon image URL"
													/>
												</div>
												<div class="space-y-2">
													<label
														for="benefit-title-{index}"
														class="text-sm font-medium text-[var(--color-info)]"
														>Title</label
													>
													<input
														type="text"
														id="benefit-title-{index}"
														bind:value={benefit.title}
														{disabled}
														class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
														placeholder="Benefit title"
													/>
												</div>
												<div class="space-y-2">
													<label
														for="benefit-description-{index}"
														class="text-sm font-medium text-[var(--color-info)]"
														>Description</label
													>
													<textarea
														id="benefit-description-{index}"
														rows="3"
														bind:value={benefit.description}
														{disabled}
														class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
														placeholder="Benefit description"
													></textarea>
												</div>
											</div>
										</div>
									{/each}
								{/if}

								<button
									type="button"
									onclick={addBenefit}
									{disabled}
									class="w-full rounded-md border border-[var(--color-outline)] bg-[var(--color-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-info)] hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
								>
									+ Add Benefit
								</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- User Interface Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('userInterface') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('userInterface')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('userInterface')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:phone-android-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">User Interface</p>
								<p class="text-sm">UI heading and paragraph text</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('userInterface')}
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

					{#if activeSections.has('userInterface')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="content-ui-heading"
									class="text-sm font-medium text-[var(--color-info)]"
									>UI Heading</label
								>
								<input
									type="text"
									id="content-ui-heading"
									bind:value={Content.userInterface.heading}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>
							<div class="space-y-2">
								<label
									for="content-ui-paragraph"
									class="text-sm font-medium text-[var(--color-info)]"
									>UI Paragraph</label
								>
								<textarea
									id="content-ui-paragraph"
									rows="3"
									bind:value={Content.userInterface.paragraph}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								></textarea>
							</div>
						</div>
					{/if}
				</div>

				<!-- Footer Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('footer') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('footer')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('footer')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:call-to-action-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Footer</p>
								<p class="text-sm">CTA heading, description and QR instruction</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('footer')}
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

					{#if activeSections.has('footer')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="content-cta-heading"
									class="text-sm font-medium text-[var(--color-info)]"
									>CTA Heading</label
								>
								<input
									type="text"
									id="content-cta-heading"
									bind:value={Content.footer.ctaHeading}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>
							<div class="space-y-2">
								<label
									for="content-cta-description"
									class="text-sm font-medium text-[var(--color-info)]"
									>CTA Description</label
								>
								<textarea
									id="content-cta-description"
									rows="3"
									bind:value={Content.footer.ctaDescription}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								></textarea>
							</div>
							<div class="space-y-2">
								<label
									for="content-qr-instruction"
									class="text-sm font-medium text-[var(--color-info)]"
									>QR Instruction</label
								>
								<input
									type="text"
									id="content-qr-instruction"
									bind:value={Content.footer.qrInstruction}
									{disabled}
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
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
					<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
				{/await}
			</div>
		</form>
	</div>
</div>