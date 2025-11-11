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
	const hasExistingData = !data.isEmpty && 
		data.marketingMaterial &&
		(Object.keys(data.marketingMaterial).length > 0 ||
			data.marketingMaterial.Styling ||
			data.marketingMaterial.Content);

	// Initialize fields as empty if data is empty, otherwise populate with existing data
	const isEmpty = data.isEmpty || !data.marketingMaterial;

	// New nested structures for Styling and Content
	let Styling = $state(
		isEmpty
			? {
					primary: '',
					secondary: '',
					accent: '',
					lightBg: '',
					panel: '',
					muted: '',
					text: '',
					headingFont: '',
					bodyFont: '',
					pageWidth: '',
					pageHeight: '',
					userInterfaceWidth: '',
					userInteractionWidth: '',
					qrSize: ''
				}
			: {
					primary: data.marketingMaterial?.Styling?.primary ?? '',
					secondary: data.marketingMaterial?.Styling?.secondary ?? '',
					accent: data.marketingMaterial?.Styling?.accent ?? '',
					lightBg: data.marketingMaterial?.Styling?.lightBg ?? '',
					panel: data.marketingMaterial?.Styling?.panel ?? '',
					muted: data.marketingMaterial?.Styling?.muted ?? '',
					text: data.marketingMaterial?.Styling?.text ?? '',
					headingFont: data.marketingMaterial?.Styling?.headingFont ?? '',
					bodyFont: data.marketingMaterial?.Styling?.bodyFont ?? '',
					pageWidth: data.marketingMaterial?.Styling?.pageWidth ?? '',
					pageHeight: data.marketingMaterial?.Styling?.pageHeight ?? '',
					userInterfaceWidth: data.marketingMaterial?.Styling?.userInterfaceWidth ?? '',
					userInteractionWidth: data.marketingMaterial?.Styling?.userInteractionWidth ?? '',
					qrSize: data.marketingMaterial?.Styling?.qrSize ?? ''
				}
	);

	let Content = $state(
		isEmpty
			? {
					header: {
						mainTitle: '',
						subtitle: ''
					},
					introduction: {
						introParagraph: '',
						problemStatement: ''
					},
					benefits: {
						title: '',
						items: []
					},
					userInterface: {
						heading: '',
						paragraph: ''
					},
					footer: {
						ctaHeading: '',
						ctaDescription: '',
						qrInstruction: ''
					}
				}
			: {
					header: {
						mainTitle: data.marketingMaterial?.Content?.header?.mainTitle ?? '',
						subtitle: data.marketingMaterial?.Content?.header?.subtitle ?? ''
					},
					introduction: {
						introParagraph: data.marketingMaterial?.Content?.introduction?.introParagraph ?? '',
						problemStatement: data.marketingMaterial?.Content?.introduction?.problemStatement ?? ''
					},
					benefits: {
						title: data.marketingMaterial?.Content?.benefits?.title ?? '',
						items: (data.marketingMaterial?.Content?.benefits?.items ?? []).map((item) => {
							// Backend expects array of strings, so convert any object format to string
							if (typeof item === 'string') {
								return item;
							}
							// If it's an object, use title or description as the string value
							return item?.title || item?.description || '';
						})
					},
					userInterface: {
						heading: data.marketingMaterial?.Content?.userInterface?.heading ?? '',
						paragraph: data.marketingMaterial?.Content?.userInterface?.paragraph ?? ''
					},
					footer: {
						ctaHeading: data.marketingMaterial?.Content?.footer?.ctaHeading ?? '',
						ctaDescription: data.marketingMaterial?.Content?.footer?.ctaDescription ?? '',
						qrInstruction: data.marketingMaterial?.Content?.footer?.qrInstruction ?? ''
					}
				}
	);

	// Images state
	let Images = $state(
		isEmpty
			? {
					titleImage: '',
					userInterfaceImage: ''
				}
			: {
					titleImage: data.marketingMaterial?.Images?.titleImage ?? '',
					userInterfaceImage: data.marketingMaterial?.Images?.userInterfaceImage ?? ''
				}
	);

	// Logos state (array of resource IDs)
	let Logos = $state<string[]>(isEmpty ? [] : (data.marketingMaterial?.Logos ?? []));

	// QRcode state
	let QRcode = $state(
		isEmpty
			? {
					resourceId: '',
					whatsappNumber: '',
					url: ''
				}
			: {
					resourceId: data.marketingMaterial?.QRcode?.resourceId ?? '',
					whatsappNumber: data.marketingMaterial?.QRcode?.whatsappNumber ?? '',
					url: data.marketingMaterial?.QRcode?.url ?? ''
				}
	);

	// File name tracking for UI display
	let titleImageFileName = $state('');
	let userInterfaceImageFileName = $state('');
	let qrCodeFileName = $state('');
	let logoFileNames = $state<string[]>([]);

	// Helper function to get image URL from resource ID
	const getImageUrl = (resourceId: string) => {
		if (!resourceId) return null;
		return `/api/server/file-resources/${resourceId}/download?disposition=inline`;
	};

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
		Content.benefits.items = [...Content.benefits.items, ''];
	};

	const removeBenefit = (index: number) => {
		Content.benefits.items = Content.benefits.items.filter((_, i) => i !== index);
	};

	const addLogo = () => {
		Logos = [...Logos, ''];
		logoFileNames = [...logoFileNames, ''];
	};

	const removeLogo = (index: number) => {
		Logos = Logos.filter((_, i) => i !== index);
		logoFileNames = logoFileNames.filter((_, i) => i !== index);
	};

	// File selection handler for images
	const onImageSelected = async (
		e: Event,
		imageType: 'titleImage' | 'userInterfaceImage'
	) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (imageType === 'titleImage') {
			titleImageFileName = file.name;
		} else {
			userInterfaceImageFileName = file.name;
		}

		// Upload immediately
		await uploadImage(file, imageType);
	};

	// File upload function for images
	const uploadImage = async (file: File, imageType: 'titleImage' | 'userInterfaceImage') => {
		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`/api/server/file-resources/upload/reancare`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			if (response.Status === 'success' && response.HttpCode === 201) {
				const resourceId = response.Data?.FileResources?.[0]?.id || response.Data?.id;
				if (resourceId) {
					Images[imageType] = resourceId;
					addToast({
						message: 'Image uploaded successfully.',
						type: 'success',
						timeout: 3000
					});
					return resourceId;
				}
			} else {
				addToast({
					message: response.Message || 'Image upload failed.',
					type: 'error',
					timeout: 3000
				});
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			addToast({
				message: 'Failed to upload image. Please try again.',
				type: 'error',
				timeout: 3000
			});
		}
		return null;
	};

	// File selection handler for logos
	const onLogoSelected = async (e: Event, logoIndex: number) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Update file name array
		if (!logoFileNames[logoIndex]) {
			logoFileNames = [...logoFileNames];
		}
		logoFileNames[logoIndex] = file.name;
		logoFileNames = [...logoFileNames];

		// Upload immediately
		await uploadLogo(file, logoIndex);
	};

	// File upload function for logos
	const uploadLogo = async (file: File, logoIndex: number) => {
		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`/api/server/file-resources/upload/reancare`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			if (response.Status === 'success' && response.HttpCode === 201) {
				const resourceId = response.Data?.FileResources?.[0]?.id || response.Data?.id;
				if (resourceId) {
					Logos[logoIndex] = resourceId;
					addToast({
						message: 'Logo uploaded successfully.',
						type: 'success',
						timeout: 3000
					});
					return resourceId;
				}
			} else {
				addToast({
					message: response.Message || 'Logo upload failed.',
					type: 'error',
					timeout: 3000
				});
			}
		} catch (error) {
			console.error('Error uploading logo:', error);
			addToast({
				message: 'Failed to upload logo. Please try again.',
				type: 'error',
				timeout: 3000
			});
		}
		return null;
	};

	// File selection handler for QR code
	const onQRCodeSelected = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		qrCodeFileName = file.name;
		// Upload immediately
		await uploadQRCode(file);
	};

	// File upload function for QR code
	const uploadQRCode = async (file: File) => {
		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`/api/server/file-resources/upload/reancare`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			if (response.Status === 'success' && response.HttpCode === 201) {
				const resourceId = response.Data?.FileResources?.[0]?.id || response.Data?.id;
				if (resourceId) {
					QRcode.resourceId = resourceId;
					addToast({
						message: 'QR code uploaded successfully.',
						type: 'success',
						timeout: 3000
					});
					return resourceId;
				}
			} else {
				addToast({
					message: response.Message || 'QR code upload failed.',
					type: 'error',
					timeout: 3000
				});
			}
		} catch (error) {
			console.error('Error uploading QR code:', error);
			addToast({
				message: 'Failed to upload QR code. Please try again.',
				type: 'error',
				timeout: 3000
			});
		}
		return null;
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
			// Filter out empty image fields - backend requires non-empty resource ID strings
			const filteredImages: Record<string, string> = {};
			if (Images.titleImage && Images.titleImage.trim() !== '') {
				filteredImages.titleImage = Images.titleImage;
			}
			if (Images.userInterfaceImage && Images.userInterfaceImage.trim() !== '') {
				filteredImages.userInterfaceImage = Images.userInterfaceImage;
			}

			// Filter out empty QRcode fields
			const filteredQRcode: Record<string, string> = {};
			if (QRcode.resourceId && QRcode.resourceId.trim() !== '') {
				filteredQRcode.resourceId = QRcode.resourceId;
			}
			if (QRcode.whatsappNumber && QRcode.whatsappNumber.trim() !== '') {
				filteredQRcode.whatsappNumber = QRcode.whatsappNumber;
			}
			if (QRcode.url && QRcode.url.trim() !== '') {
				filteredQRcode.url = QRcode.url;
			}

			const payload = {
				Styling,
				Content: {
					...Content,
					benefits: {
						...Content.benefits,
						items: Content.benefits.items.filter((item) => item && item.trim() !== '')
					}
				},
				Images: Object.keys(filteredImages).length > 0 ? filteredImages : undefined,
				Logos: Logos.filter((logo) => logo && logo.trim() !== ''),
				QRcode: Object.keys(filteredQRcode).length > 0 ? filteredQRcode : undefined
			};

			// Determine if this is a create (POST) or update (PUT) operation
			// Use POST if data is empty, PUT if data exists
			const method = isEmpty ? 'POST' : 'PUT';

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
				`Error ${isEmpty ? 'creating' : 'updating'} marketing material:`,
				error
			);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: `Failed to ${isEmpty ? 'create' : 'update'} marketing material. Please try again.`
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
												placeholder="#1a472a"
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
							<Icon icon="material-symbols:font-download" class="h-5 w-5" />
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
									<select
										id="styling-heading-font"
										bind:value={Styling.headingFont}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select a font</option>
										<option value="'Poppins', sans-serif">Poppins</option>
										<option value="'Inter', sans-serif">Inter</option>
										<option value="'Roboto', sans-serif">Roboto</option>
										<option value="'Open Sans', sans-serif">Open Sans</option>
										<option value="'Lato', sans-serif">Lato</option>
										<option value="'Montserrat', sans-serif">Montserrat</option>
										<option value="'Raleway', sans-serif">Raleway</option>
										<option value="'Nunito', sans-serif">Nunito</option>
										<option value="'Playfair Display', serif">Playfair Display</option>
										<option value="'Merriweather', serif">Merriweather</option>
										<option value="'Lora', serif">Lora</option>
										<option value="'PT Serif', serif">PT Serif</option>
										<option value="'Roboto Slab', serif">Roboto Slab</option>
										<option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
										<option value="'Ubuntu', sans-serif">Ubuntu</option>
										<option value="'Oswald', sans-serif">Oswald</option>
										<option value="'Fira Sans', sans-serif">Fira Sans</option>
										<option value="'Crimson Text', serif">Crimson Text</option>
										<option value="'Libre Baskerville', serif">Libre Baskerville</option>
									</select>
									{#if Styling.headingFont && !['', "'Poppins', sans-serif", "'Inter', sans-serif", "'Roboto', sans-serif", "'Open Sans', sans-serif", "'Lato', sans-serif", "'Montserrat', sans-serif", "'Raleway', sans-serif", "'Nunito', sans-serif", "'Playfair Display', serif", "'Merriweather', serif", "'Lora', serif", "'PT Serif', serif", "'Roboto Slab', serif", "'Source Sans Pro', sans-serif", "'Ubuntu', sans-serif", "'Oswald', sans-serif", "'Fira Sans', sans-serif", "'Crimson Text', serif", "'Libre Baskerville', serif"].includes(Styling.headingFont)}
										<input
											type="text"
											bind:value={Styling.headingFont}
											{disabled}
											placeholder="Custom font (e.g., 'Custom Font', sans-serif)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
								</div>
								<div class="space-y-2">
									<label
										for="styling-body-font"
										class="text-sm font-medium text-[var(--color-info)]"
										>Body Font</label
									>
									<select
										id="styling-body-font"
										bind:value={Styling.bodyFont}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select a font</option>
										<option value="'Poppins', sans-serif">Poppins</option>
										<option value="'Inter', sans-serif">Inter</option>
										<option value="'Roboto', sans-serif">Roboto</option>
										<option value="'Open Sans', sans-serif">Open Sans</option>
										<option value="'Lato', sans-serif">Lato</option>
										<option value="'Montserrat', sans-serif">Montserrat</option>
										<option value="'Raleway', sans-serif">Raleway</option>
										<option value="'Nunito', sans-serif">Nunito</option>
										<option value="'Playfair Display', serif">Playfair Display</option>
										<option value="'Merriweather', serif">Merriweather</option>
										<option value="'Lora', serif">Lora</option>
										<option value="'PT Serif', serif">PT Serif</option>
										<option value="'Roboto Slab', serif">Roboto Slab</option>
										<option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
										<option value="'Ubuntu', sans-serif">Ubuntu</option>
										<option value="'Oswald', sans-serif">Oswald</option>
										<option value="'Fira Sans', sans-serif">Fira Sans</option>
										<option value="'Crimson Text', serif">Crimson Text</option>
										<option value="'Libre Baskerville', serif">Libre Baskerville</option>
									</select>
									{#if Styling.bodyFont && !['', "'Poppins', sans-serif", "'Inter', sans-serif", "'Roboto', sans-serif", "'Open Sans', sans-serif", "'Lato', sans-serif", "'Montserrat', sans-serif", "'Raleway', sans-serif", "'Nunito', sans-serif", "'Playfair Display', serif", "'Merriweather', serif", "'Lora', serif", "'PT Serif', serif", "'Roboto Slab', serif", "'Source Sans Pro', sans-serif", "'Ubuntu', sans-serif", "'Oswald', sans-serif", "'Fira Sans', sans-serif", "'Crimson Text', serif", "'Libre Baskerville', serif"].includes(Styling.bodyFont)}
										<input
											type="text"
											bind:value={Styling.bodyFont}
											{disabled}
											placeholder="Custom font (e.g., 'Custom Font', sans-serif)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
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
									<select
										id="styling-page-width"
										bind:value={Styling.pageWidth}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select page width</option>
										<option value="148mm">A6 (148mm)</option>
										<option value="210mm">A5 (210mm)</option>
										<option value="297mm">A4 (297mm)</option>
										<option value="420mm">A3 (420mm)</option>
										<option value="216mm">Letter (216mm)</option>
										<option value="279mm">Legal (279mm)</option>
										<option value="200mm">Custom 200mm</option>
										<option value="250mm">Custom 250mm</option>
										<option value="300mm">Custom 300mm</option>
										<option value="350mm">Custom 350mm</option>
									</select>
									{#if Styling.pageWidth && !['', '148mm', '210mm', '297mm', '420mm', '216mm', '279mm', '200mm', '250mm', '300mm', '350mm'].includes(Styling.pageWidth)}
										<input
											type="text"
											bind:value={Styling.pageWidth}
											{disabled}
											placeholder="Custom width (e.g., 180mm)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
								</div>
								<div class="space-y-2">
									<label
										for="styling-page-height"
										class="text-sm font-medium text-[var(--color-info)]"
										>Page Height</label
									>
									<select
										id="styling-page-height"
										bind:value={Styling.pageHeight}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select page height</option>
										<option value="105mm">A6 (105mm)</option>
										<option value="148mm">A5 (148mm)</option>
										<option value="210mm">A4 (210mm)</option>
										<option value="297mm">A3 (297mm)</option>
										<option value="279mm">Letter (279mm)</option>
										<option value="356mm">Legal (356mm)</option>
										<option value="250mm">Custom 250mm</option>
										<option value="300mm">Custom 300mm</option>
										<option value="350mm">Custom 350mm</option>
										<option value="400mm">Custom 400mm</option>
									</select>
									{#if Styling.pageHeight && !['', '105mm', '148mm', '210mm', '297mm', '279mm', '356mm', '250mm', '300mm', '350mm', '400mm'].includes(Styling.pageHeight)}
										<input
											type="text"
											bind:value={Styling.pageHeight}
											{disabled}
											placeholder="Custom height (e.g., 240mm)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
								</div>
								<div class="space-y-2">
									<label
										for="styling-ui-width"
										class="text-sm font-medium text-[var(--color-info)]"
										>UI Width</label
									>
									<select
										id="styling-ui-width"
										bind:value={Styling.userInterfaceWidth}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select UI width</option>
										<option value="200px">200px</option>
										<option value="240px">240px</option>
										<option value="260px">260px</option>
										<option value="280px">280px</option>
										<option value="300px">300px</option>
										<option value="320px">320px</option>
										<option value="350px">350px</option>
										<option value="400px">400px</option>
										<option value="450px">450px</option>
										<option value="500px">500px</option>
									</select>
									{#if Styling.userInterfaceWidth && !['', '200px', '240px', '260px', '280px', '300px', '320px', '350px', '400px', '450px', '500px'].includes(Styling.userInterfaceWidth)}
										<input
											type="text"
											bind:value={Styling.userInterfaceWidth}
											{disabled}
											placeholder="Custom width (e.g., 270px)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
								</div>
								<div class="space-y-2">
									<label
										for="styling-interaction-width"
										class="text-sm font-medium text-[var(--color-info)]"
										>Interaction Width</label
									>
									<select
										id="styling-interaction-width"
										bind:value={Styling.userInteractionWidth}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select interaction width</option>
										<option value="200px">200px</option>
										<option value="220px">220px</option>
										<option value="250px">250px</option>
										<option value="270px">270px</option>
										<option value="300px">300px</option>
										<option value="320px">320px</option>
										<option value="350px">350px</option>
										<option value="380px">380px</option>
										<option value="400px">400px</option>
										<option value="450px">450px</option>
									</select>
									{#if Styling.userInteractionWidth && !['', '200px', '220px', '250px', '270px', '300px', '320px', '350px', '380px', '400px', '450px'].includes(Styling.userInteractionWidth)}
										<input
											type="text"
											bind:value={Styling.userInteractionWidth}
											{disabled}
											placeholder="Custom width (e.g., 230px)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
								</div>
								<div class="space-y-2">
									<label
										for="styling-qr-size"
										class="text-sm font-medium text-[var(--color-info)]"
										>QR Size</label
									>
									<select
										id="styling-qr-size"
										bind:value={Styling.qrSize}
										{disabled}
										class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
									>
										<option value="">Select QR size</option>
										<option value="80px">80px (Small)</option>
										<option value="100px">100px</option>
										<option value="120px">120px (Medium)</option>
										<option value="150px">150px</option>
										<option value="180px">180px</option>
										<option value="200px">200px (Large)</option>
										<option value="250px">250px</option>
										<option value="300px">300px (Extra Large)</option>
									</select>
									{#if Styling.qrSize && !['', '80px', '100px', '120px', '150px', '180px', '200px', '250px', '300px'].includes(Styling.qrSize)}
										<input
											type="text"
											bind:value={Styling.qrSize}
											{disabled}
											placeholder="Custom size (e.g., 140px)"
											class="mt-2 w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										/>
									{/if}
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
							<Icon icon="material-symbols:text-fields" class="h-5 w-5" />
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
									placeholder="Enter main title"
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
									placeholder="Enter subtitle"
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
									placeholder="Enter introduction paragraph"
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
									placeholder="Enter problem statement"
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
									placeholder="Key Benefits"
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>

							<!-- Benefits Items -->
							<div class="space-y-4">
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
										<div class="space-y-2">
											<label
												for="benefit-{index}"
												class="text-sm font-medium text-[var(--color-info)]"
												>Benefit Text</label
											>
											<textarea
												id="benefit-{index}"
												rows="3"
												bind:value={Content.benefits.items[index]}
												{disabled}
												placeholder="Enter benefit description (e.g., Access personalized health recommendations and care plans)"
												class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
											></textarea>
										</div>
									</div>
								{/each}

								<button
									type="button"
									onclick={addBenefit}
									{disabled}
									class="inline-flex items-center gap-1 rounded-md border border-[var(--color-outline)] bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-info)] hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Icon icon="material-symbols:add" class="h-4 w-4" />
									Add Benefit
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
									placeholder="Who Can Benefit from This Program"
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
									placeholder="Enter user interface paragraph"
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
									placeholder="Get Started Today"
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
									placeholder="Enter CTA description"
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
									placeholder="Scan to get started"
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Images Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('images') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('images')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('images')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:image-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Images</p>
								<p class="text-sm">Title image and user interface image</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('images')}
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

					{#if activeSections.has('images')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="image-title-image"
									class="text-sm font-medium text-[var(--color-info)]"
									>Title Image</label
								>
								<div class="flex w-full gap-3">
									<label class="table-btn variant-filled-secondary" for="title-image-upload">
										Select File
										<input
											type="file"
											id="title-image-upload"
											accept="image/*"
											class="hidden"
											disabled={disabled}
											onchange={async (e) => await onImageSelected(e, 'titleImage')}
										/>
									</label>
									<input
										type="text"
										id="image-title-image"
										value={titleImageFileName || Images.titleImage || ''}
										readonly
										{disabled}
										class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										placeholder="No file selected..."
									/>
								</div>
								{#if Images.titleImage}
									<div class="mt-2">
										<img
											src={getImageUrl(Images.titleImage)}
											alt=""
											class="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
										/>
									</div>
								{/if}
							</div>
							<div class="space-y-2">
								<label
									for="image-user-interface-image"
									class="text-sm font-medium text-[var(--color-info)]"
									>User Interface Image</label
								>
								<div class="flex w-full gap-3">
									<label class="table-btn variant-filled-secondary" for="user-interface-image-upload">
										Select File
										<input
											type="file"
											id="user-interface-image-upload"
											accept="image/*"
											class="hidden"
											disabled={disabled}
											onchange={async (e) => await onImageSelected(e, 'userInterfaceImage')}
										/>
									</label>
									<input
										type="text"
										id="image-user-interface-image"
										value={userInterfaceImageFileName || Images.userInterfaceImage || ''}
										readonly
										{disabled}
										class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										placeholder="No file selected..."
									/>
								</div>
								{#if Images.userInterfaceImage}
									<div class="mt-2">
										<img
											src={getImageUrl(Images.userInterfaceImage)}
											alt=""
											class="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
										/>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>

				<!-- Logos Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('logos') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('logos')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('logos')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:workspace-premium-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Logos</p>
								<p class="text-sm">Logo resource IDs array</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('logos')}
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

					{#if activeSections.has('logos')}
						<div class="space-y-4 p-6">
							{#each Logos as logo, index}
								<div
									class="rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] p-4"
								>
									<div class="mb-4 flex items-center justify-between">
										<h4 class="text-sm font-medium text-[var(--color-info)]">
											Logo #{index + 1}
										</h4>
										{#if !disabled}
											<button
												type="button"
												onclick={() => removeLogo(index)}
												class="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
											>
												Remove
											</button>
										{/if}
									</div>
									<div class="flex w-full gap-3">
										<label class="table-btn variant-filled-secondary" for="logo-upload-{index}">
											Select File
											<input
												type="file"
												id="logo-upload-{index}"
												accept="image/*"
												class="hidden"
												disabled={disabled}
												onchange={async (e) => await onLogoSelected(e, index)}
											/>
										</label>
										<input
											type="text"
											value={logoFileNames[index] || Logos[index] || ''}
											readonly
											{disabled}
											class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
											placeholder="No file selected..."
										/>
									</div>
									{#if Logos[index]}
										<div class="mt-2">
											<img
												src={getImageUrl(Logos[index])}
												alt=""
												class="h-24 w-24 rounded border border-[var(--color-outline)] object-cover"
											/>
										</div>
									{/if}
								</div>
							{/each}

							<button
								type="button"
								onclick={addLogo}
								{disabled}
								class="inline-flex items-center gap-1 rounded-md border border-[var(--color-outline)] bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-info)] hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Icon icon="material-symbols:add" class="h-4 w-4" />
								Add Logo
							</button>
						</div>
					{/if}
				</div>

				<!-- QR Code Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSections.has('qrcode') ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('qrcode')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSections.has('qrcode')
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:qr-code-scanner" class="h-5 w-5" />
							<div class="text-start">
								<p class="text-md font-medium">QR Code</p>
								<p class="text-sm">QR code resource ID, WhatsApp number and URL</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('qrcode')}
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

					{#if activeSections.has('qrcode')}
						<div class="space-y-4 p-6">
							<div class="space-y-2">
								<label
									for="qrcode-resource-id"
									class="text-sm font-medium text-[var(--color-info)]"
									>QR Code Image</label
								>
								<div class="flex w-full gap-3">
									<label class="table-btn variant-filled-secondary" for="qrcode-upload">
										Select File
										<input
											type="file"
											id="qrcode-upload"
											accept="image/*"
											class="hidden"
											disabled={disabled}
											onchange={async (e) => await onQRCodeSelected(e)}
										/>
									</label>
									<input
										type="text"
										id="qrcode-resource-id"
										value={qrCodeFileName || QRcode.resourceId || ''}
										readonly
										{disabled}
										class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
										placeholder="No file selected..."
									/>
								</div>
								{#if QRcode.resourceId}
									<div class="mt-2">
										<img
											src={getImageUrl(QRcode.resourceId)}
											alt=""
											class="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
										/>
									</div>
								{/if}
							</div>
							<div class="space-y-2">
								<label
									for="qrcode-whatsapp-number"
									class="text-sm font-medium text-[var(--color-info)]"
									>WhatsApp Number</label
								>
								<input
									type="text"
									id="qrcode-whatsapp-number"
									bind:value={QRcode.whatsappNumber}
									{disabled}
									placeholder="+91-1234567890"
									class="w-full rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
								/>
							</div>
							<div class="space-y-2">
								<label
									for="qrcode-url"
									class="text-sm font-medium text-[var(--color-info)]"
									>URL</label
								>
								<input
									type="text"
									id="qrcode-url"
									bind:value={QRcode.url}
									{disabled}
									placeholder="https://wa.me/911234567890"
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