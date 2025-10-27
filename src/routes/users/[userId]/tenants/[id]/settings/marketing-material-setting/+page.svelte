<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { MarketingMaterialSettingsSchema } from '$lib/validation/tenant.settings.schema.js';
	import type {
		MarketingMaterialSettings,
		MarketingMaterialUploadModel,
		Feature,
		Benefit
	} from '$lib/types/tenant.settings.types.js';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';

	///////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantCode = $state(data.tenantCode);
	const tenantName = $state(data.tenantName);
	const tenantRoute = `/users/${userId}/tenants`;
	const formData = new FormData();
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let marketingMaterialSetting: MarketingMaterialSettings = $state({
		TenantId: tenantId,
		TenantName: tenantName,
		TenantCode: tenantCode,

		// Branding & Logos
		PrimaryLogo: data.marketingMaterialSettings?.PrimaryLogo || '',
		SecondaryLogo: data.marketingMaterialSettings?.SecondaryLogo || '',
		ReanLogo: data.marketingMaterialSettings?.ReanLogo || '',

		// Color Scheme
		PrimaryColor: data.marketingMaterialSettings?.PrimaryColor || '#E53935',
		SecondaryColor: data.marketingMaterialSettings?.SecondaryColor || '#25D366',
		AccentColor: data.marketingMaterialSettings?.AccentColor || '#00ACC1',
		BackgroundLight: data.marketingMaterialSettings?.BackgroundLight || '#FFF3E0',
		TextDark: data.marketingMaterialSettings?.TextDark || '#333333',
		TextLight: data.marketingMaterialSettings?.TextLight || '#666666',

		// Hero Section (Page 1)
		HeroMainTitle: data.marketingMaterialSettings?.HeroMainTitle || '',
		HeroSubtitle: data.marketingMaterialSettings?.HeroSubtitle || '',
		HeroImage: data.marketingMaterialSettings?.HeroImage || '',
		ChatQuestion: data.marketingMaterialSettings?.ChatQuestion || '',
		ChatAnswer: data.marketingMaterialSettings?.ChatAnswer || '',

		// Main Description
		DescriptionHeading: data.marketingMaterialSettings?.DescriptionHeading || '',
		IntroParagraph: data.marketingMaterialSettings?.IntroParagraph || '',
		FeaturesParagraph: data.marketingMaterialSettings?.FeaturesParagraph || '',

		// Benefits (Page 2)
		BenefitsHeading: data.marketingMaterialSettings?.BenefitsHeading || 'Benefits to you',
		Benefits: data.marketingMaterialSettings?.Benefits || [],

		// Target Audience
		TargetHeading: data.marketingMaterialSettings?.TargetHeading || 'Who should use this?',
		TargetParagraph1: data.marketingMaterialSettings?.TargetParagraph1 || '',
		TargetParagraph2: data.marketingMaterialSettings?.TargetParagraph2 || '',
		PhoneMockup: data.marketingMaterialSettings?.PhoneMockup || '',
		MockupQuestion: data.marketingMaterialSettings?.MockupQuestion || '',
		MockupAnswer: data.marketingMaterialSettings?.MockupAnswer || '',

		// Call to Action
		CtaHeading: data.marketingMaterialSettings?.CtaHeading || 'Register by messaging us on',
		WhatsappNumber: data.marketingMaterialSettings?.WhatsappNumber || '',
		QrCodeData: data.marketingMaterialSettings?.QrCodeData || '',
		QrInstruction: data.marketingMaterialSettings?.QrInstruction || '',

		// Legacy fields (keeping for backward compatibility)
		Logo: data.marketingMaterialSettings?.Logo || '',
		Title: data.marketingMaterialSettings?.Title || '',
		Subtitle: data.marketingMaterialSettings?.Subtitle || '',
		ProblemIntro: data.marketingMaterialSettings?.ProblemIntro || '',
		BotIntro: data.marketingMaterialSettings?.BotIntro || '',
		Features: data.marketingMaterialSettings?.Features || [],
		Conclusion: data.marketingMaterialSettings?.Conclusion || '',
		QrCode: data.marketingMaterialSettings?.QrCode || null
	});

	// File upload states
	let primaryLogoUrl = $derived(marketingMaterialSetting.PrimaryLogo || '');
	let secondaryLogoUrl = $derived(marketingMaterialSetting.SecondaryLogo || '');
	// let reanLogoUrl = $derived(marketingMaterialSetting.ReanLogo || '');
	let heroImageUrl = $derived(marketingMaterialSetting.HeroImage || '');
	let phoneMockupUrl = $derived(marketingMaterialSetting.PhoneMockup || '');
	let qrCodeUrl = $derived(marketingMaterialSetting.QrCode || '');

	// File name states for display
	let primaryLogoFileName = $state('');
	let secondaryLogoFileName = $state('');
	let heroImageFileName = $state('');
	let phoneMockupFileName = $state('');
	let qrCodeFileName = $state('');
	let benefitIconFileName = $state('');

	let newBenefit: Benefit = $state({
		Icon: '',
		Title: '',
		Description: ''
	});

	let disabled = $state(true);
	let edit = $state(false);
	let editingBenefitIndex = $state(-1);
	let activeSections = $state(new Set([]));
	let benefitCount = $state(0);

	// Ensure arrays are always initialized
	$effect(() => {
		if (!marketingMaterialSetting.Features) {
			marketingMaterialSetting.Features = [];
		}
		if (!marketingMaterialSetting.Benefits) {
			marketingMaterialSetting.Benefits = [];
		}

		// Add initial benefits if none exist (similar to reference file)
		if (marketingMaterialSetting.Benefits.length === 0) {
			marketingMaterialSetting.Benefits = [{ Icon: '', Title: '', Description: '' }];
		}
	});

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

	const handleFileUpload = async (event: Event, uploadType: string) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Set file name for display
		switch (uploadType) {
			case 'primary-logo':
				primaryLogoFileName = file.name;
				break;
			case 'secondary-logo':
				secondaryLogoFileName = file.name;
				break;
			case 'hero-image':
				heroImageFileName = file.name;
				break;
			case 'phone-mockup':
				phoneMockupFileName = file.name;
				break;
			case 'qrcode':
				qrCodeFileName = file.name;
				break;
		}

		const uploadModel: MarketingMaterialUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const validationResult = imageUploadSchema.safeParse(uploadModel);
		if (!validationResult.success) {
			errors = Object.fromEntries(
				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/MarketingMaterial/${uploadType}`,
				{
					method: 'POST',
					body: formData
				}
			);

			const result = await response.json();
			if (result.HttpCode === 200 || result.HttpCode === 201) {
				// Update the appropriate field based on upload type
				switch (uploadType) {
					case 'primary-logo':
						marketingMaterialSetting.PrimaryLogo = result.Data.Url;
						break;
					case 'secondary-logo':
						marketingMaterialSetting.SecondaryLogo = result.Data.Url;
						break;
					case 'rean-logo':
						marketingMaterialSetting.ReanLogo = result.Data.Url;
						break;
					case 'hero-image':
						marketingMaterialSetting.HeroImage = result.Data.Url;
						break;
					case 'phone-mockup':
						marketingMaterialSetting.PhoneMockup = result.Data.Url;
						break;
					case 'qrcode':
						marketingMaterialSetting.QrCode = result.Data.Url;
						break;
					case 'feature-logo':
						// This will be handled by the specific benefit upload function
						return result.Data.Url;
				}
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error(`${uploadType} upload failed:`, error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: `${uploadType} upload failed. Please try again.`
			});
		}
	};

	const handleBenefitIconUpload = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Set file name for display
		benefitIconFileName = file.name;

		const uploadModel: MarketingMaterialUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const validationResult = imageUploadSchema.safeParse(uploadModel);
		if (!validationResult.success) {
			errors = Object.fromEntries(
				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/MarketingMaterial/feature-logo`,
				{
					method: 'POST',
					body: formData
				}
			);

			const result = await response.json();
			if (result.HttpCode === 200 || result.HttpCode === 201) {
				newBenefit.Icon = result.Data.Url;
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Benefit icon upload failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Benefit icon upload failed. Please try again.'
			});
		}
	};

	const handleBenefitIconUploadForIndex = async (event: Event, index: number) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		const uploadModel: MarketingMaterialUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const validationResult = imageUploadSchema.safeParse(uploadModel);
		if (!validationResult.success) {
			errors = Object.fromEntries(
				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/MarketingMaterial/feature-logo`,
				{
					method: 'POST',
					body: formData
				}
			);

			const result = await response.json();
			if (result.HttpCode === 200 || result.HttpCode === 201) {
				// Update the specific benefit at the given index
				if (marketingMaterialSetting.Benefits && marketingMaterialSetting.Benefits[index]) {
					marketingMaterialSetting.Benefits[index].Icon = result.Data.Url;
				}
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Benefit icon upload failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Benefit icon upload failed. Please try again.'
			});
		}
	};

	const addBenefitCard = () => {
		benefitCount++;
		const benefitCard = {
			id: benefitCount,
			icon: '',
			title: '',
			description: ''
		};

		// Add to benefits array
			if (!marketingMaterialSetting.Benefits) {
				marketingMaterialSetting.Benefits = [];
			}
			marketingMaterialSetting.Benefits = [
				...marketingMaterialSetting.Benefits,
				{
				Icon: '',
				Title: '',
				Description: ''
			}
		];
	};

	const removeBenefitCard = (index: number) => {
		marketingMaterialSetting.Benefits =
			marketingMaterialSetting.Benefits?.filter((_, i) => i !== index) || [];
	};

	const addBenefit = () => {
		// Ensure Benefits array exists
		if (!marketingMaterialSetting.Benefits) {
			marketingMaterialSetting.Benefits = [];
		}

		// Enable edit mode when adding benefits
		disabled = false;
		edit = true;

		// Add a new empty benefit
		marketingMaterialSetting.Benefits = [
			...marketingMaterialSetting.Benefits,
			{
				Icon: '',
				Title: '',
				Description: ''
		}
		];

		console.log('Added benefit. Total benefits:', marketingMaterialSetting.Benefits.length);
	};

	const removeBenefit = (index: number) => {
		marketingMaterialSetting.Benefits =
			marketingMaterialSetting.Benefits?.filter((_, i) => i !== index) || [];
		console.log('Removed benefit at index:', index);
		console.log('Current benefits:', marketingMaterialSetting.Benefits);
	};

	const editBenefit = (index: number) => {
		if (marketingMaterialSetting.Benefits && marketingMaterialSetting.Benefits[index]) {
			const benefit = marketingMaterialSetting.Benefits[index];
			newBenefit = {
				Icon: benefit.Icon || '',
				Title: benefit.Title,
				Description: benefit.Description
			};
			editingBenefitIndex = index;
		}
	};

	const updateBenefit = () => {
		if (editingBenefitIndex >= 0 && newBenefit.Title.trim() && newBenefit.Description.trim()) {
			if (
				marketingMaterialSetting.Benefits &&
				marketingMaterialSetting.Benefits[editingBenefitIndex]
			) {
				marketingMaterialSetting.Benefits[editingBenefitIndex] = {
					Icon: newBenefit.Icon || '',
					Title: newBenefit.Title.trim(),
					Description: newBenefit.Description.trim()
				};
				console.log('Updated benefit at index:', editingBenefitIndex);
				console.log('Current benefits:', marketingMaterialSetting.Benefits);
			}
			// Reset form
			newBenefit = {
				Icon: '',
				Title: '',
				Description: ''
			};
			editingBenefitIndex = -1;
		}
	};

	const cancelBenefitEdit = () => {
		newBenefit = {
			Icon: '',
			Title: '',
			Description: ''
		};
		editingBenefitIndex = -1;
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

			const validationResult = MarketingMaterialSettingsSchema.safeParse(marketingMaterialSetting);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/MarketingMaterial`, {
				method: 'PUT',
				body: JSON.stringify(marketingMaterialSetting),
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
			toastMessage();
		}
	};

	const handleExport = async () => {
		try {
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/MarketingMaterial/export`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			const result = await response.json();

			if (result.HttpCode === 200 || result.HttpCode === 201) {
				toastMessage(result);
				// Handle file download if the response contains file data
				if (result.Data && result.Data.fileUrl) {
					window.open(result.Data.fileUrl, '_blank');
				}
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Export failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Export failed. Please try again.'
			});
		}
	};

	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/server/tenants/settings/${tenantId}/MarketingMaterial`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const result = await response.json();

			if (result.HttpCode === 200 || result.HttpCode === 201) {
				toastMessage(result);
				// Reset form data
				marketingMaterialSetting = {
					TenantId: tenantId,
					TenantName: tenantName,
					TenantCode: tenantCode,

					// Branding & Logos
					PrimaryLogo: '',
					SecondaryLogo: '',
					ReanLogo: '',

					// Color Scheme
					PrimaryColor: '#E53935',
					SecondaryColor: '#25D366',
					AccentColor: '#00ACC1',
					BackgroundLight: '#FFF3E0',
					TextDark: '#333333',
					TextLight: '#666666',

					// Hero Section (Page 1)
					HeroMainTitle: '',
					HeroSubtitle: '',
					HeroImage: '',
					ChatQuestion: '',
					ChatAnswer: '',

					// Main Description
					DescriptionHeading: '',
					IntroParagraph: '',
					FeaturesParagraph: '',

					// Benefits (Page 2)
					BenefitsHeading: 'Benefits to you',
					Benefits: [],

					// Target Audience
					TargetHeading: 'Who should use this?',
					TargetParagraph1: '',
					TargetParagraph2: '',
					PhoneMockup: '',
					MockupQuestion: '',
					MockupAnswer: '',

					// Call to Action
					CtaHeading: 'Register by messaging us on',
					WhatsappNumber: '',
					QrCodeData: '',
					QrInstruction: '',

					// Legacy fields
					Logo: '',
					Title: '',
					Subtitle: '',
					ProblemIntro: '',
					BotIntro: '',
					Features: [],
					Conclusion: '',
					QrCode: null
				};
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Delete failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Delete failed. Please try again.'
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
				<h1 class=" text-xl text-[var(--color-info)]">Marketing Material</h1>
				<div class="flex items-center gap-2 text-end">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleExport}
					>
						<Icon icon="material-symbols:download" />
						Export
					</button>
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" />
					</button>
					<a
						href={tenantRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
					>
						<Icon icon="material-symbols:close-rounded" class=" h-5" />
					</a>
				</div>
			</div>

			<div class="flex flex-col space-y-4 px-4 py-4">
				<!-- Branding & Logos Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('branding') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('branding')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('branding')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:diamond-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Logos</p>
								<p class=" text-sm">Upload and manage your brand logos</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('branding')}
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

					{#if activeSections.has('branding')}
						<div class="space-y-4 p-6">
							<div class="space-y-6">
								<div class="space-y-2">
									<label for="primary-logo" class="text-sm font-medium text-[var(--color-info)]">Primary Logo</label>
									<div class="flex w-full gap-3">
										<label class="table-btn variant-filled-secondary">
											Select File
										<input
												id="primary-logo"
											type="file"
												class="hidden"
											accept="image/*"
											onchange={(e) => handleFileUpload(e, 'primary-logo')}
											{disabled}
											/>
										</label>
										<input
											type="text"
											class="input-field w-[70%]"
											placeholder="No file selected..."
											readonly
											{disabled}
											value={primaryLogoFileName}
										/>
									</div>
									<p class="text-xs text-gray-500">Positioned at top-left</p>
									{#if primaryLogoUrl}
										<div class="mt-2">
											<img
												src={primaryLogoUrl}
												alt="Primary Logo"
												class="h-16 w-16 object-contain"
											/>
										</div>
									{/if}
								</div>

								<div class="space-y-2">
									<label for="secondary-logo" class="text-sm font-medium text-[var(--color-info)]">Secondary Logo</label>
									<div class="flex w-full gap-3">
										<label class="table-btn variant-filled-secondary">
											Select File
										<input
												id="secondary-logo"
											type="file"
												class="hidden"
											accept="image/*"
											onchange={(e) => handleFileUpload(e, 'secondary-logo')}
											{disabled}
											/>
										</label>
										<input
											type="text"
											class="input-field w-[70%]"
											placeholder="No file selected..."
											readonly
											{disabled}
											value={secondaryLogoFileName}
										/>
									</div>
									<p class="text-xs text-gray-500">Positioned at top-center</p>
									{#if secondaryLogoUrl}
										<div class="mt-2">
											<img
												src={secondaryLogoUrl}
												alt="Secondary Logo"
												class="h-16 w-16 object-contain"
											/>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Color Scheme Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('colors') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('colors')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('colors')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:palette-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Color Scheme</p>
								<p class=" text-sm">Configure your brand colors</p>
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
								<div class="space-y-2">
									<label for="primary-color" class="text-sm font-medium text-[var(--color-info)]">Primary Color</label>
									<div class="flex items-center gap-2">
										<input
											id="primary-color"
											type="color"
											bind:value={marketingMaterialSetting.PrimaryColor}
											{disabled}
											class="h-12 w-16 cursor-pointer border-none"
										/>
										<input
											type="text"
											bind:value={marketingMaterialSetting.PrimaryColor}
											{disabled}
											class="flex-1 rounded border border-gray-300 p-2"
											readonly
										/>
									</div>
								</div>

								<div class="space-y-2">
									<label for="secondary-color" class="text-sm font-medium text-[var(--color-info)]">Secondary Color</label
									>
									<div class="flex items-center gap-2">
										<input
											id="secondary-color"
											type="color"
											bind:value={marketingMaterialSetting.SecondaryColor}
											{disabled}
											class="h-12 w-16 cursor-pointer border-none"
										/>
										<input
											type="text"
											bind:value={marketingMaterialSetting.SecondaryColor}
											{disabled}
											class="flex-1 rounded border border-gray-300 p-2"
											readonly
										/>
									</div>
								</div>

								<div class="space-y-2">
									<label for="accent-color" class="text-sm font-medium text-[var(--color-info)]">Accent Color</label>
									<div class="flex items-center gap-2">
										<input
											id="accent-color"
											type="color"
											bind:value={marketingMaterialSetting.AccentColor}
											{disabled}
											class="h-12 w-16 cursor-pointer border-none"
										/>
										<input
											type="text"
											bind:value={marketingMaterialSetting.AccentColor}
											{disabled}
											class="flex-1 rounded border border-gray-300 p-2"
											readonly
										/>
									</div>
								</div>

								<div class="space-y-2">
									<label for="background-light" class="text-sm font-medium text-[var(--color-info)]"
										>Background Light</label
									>
									<div class="flex items-center gap-2">
										<input
											id="background-light"
											type="color"
											bind:value={marketingMaterialSetting.BackgroundLight}
											{disabled}
											class="h-12 w-16 cursor-pointer border-none"
										/>
										<input
											type="text"
											bind:value={marketingMaterialSetting.BackgroundLight}
											{disabled}
											class="flex-1 rounded border border-gray-300 p-2"
											readonly
										/>
									</div>
								</div>

								<div class="space-y-2">
									<label for="text-dark" class="text-sm font-medium text-[var(--color-info)]">Text Dark</label>
									<div class="flex items-center gap-2">
										<input
											id="text-dark"
											type="color"
											bind:value={marketingMaterialSetting.TextDark}
											{disabled}
											class="h-12 w-16 cursor-pointer border-none"
										/>
										<input
											type="text"
											bind:value={marketingMaterialSetting.TextDark}
											{disabled}
											class="flex-1 rounded border border-gray-300 p-2"
											readonly
										/>
									</div>
								</div>

								<div class="space-y-2">
									<label for="text-light" class="text-sm font-medium text-[var(--color-info)]">Text Light</label>
									<div class="flex items-center gap-2">
										<input
											id="text-light"
											type="color"
											bind:value={marketingMaterialSetting.TextLight}
											{disabled}
											class="h-12 w-16 cursor-pointer border-none"
										/>
										<input
											type="text"
											bind:value={marketingMaterialSetting.TextLight}
											{disabled}
											class="flex-1 rounded border border-gray-300 p-2"
											readonly
										/>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Hero Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('hero') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('hero')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('hero')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:home-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Hero Section</p>
								<p class=" text-sm">Main title, subtitle and hero image</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('hero')}
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

					{#if activeSections.has('hero')}
						<div class="space-y-4 p-6">
							<div class="space-y-6">
								<!-- Main Title -->
								<div class="space-y-2">
									<label for="main-title" class="text-sm font-medium text-[var(--color-info)]">Main Title *</label>
									<input
										id="main-title"
										type="text"
										bind:value={marketingMaterialSetting.HeroMainTitle}
										placeholder="Enter main title"
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
									{#if errors?.HeroMainTitle}
										<p class="mt-1 text-sm text-red-500">{errors.HeroMainTitle}</p>
									{/if}
								</div>

								<!-- Subtitle -->
								<div class="space-y-2">
									<label for="subtitle" class="text-sm font-medium text-[var(--color-info)]">Subtitle</label>
									<textarea
										id="subtitle"
										bind:value={marketingMaterialSetting.HeroSubtitle}
										placeholder="Enter subtitle"
										{disabled}
										rows="3"
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									></textarea>
								</div>

								<!-- Hero Image -->
								<div class="space-y-2">
									<label for="hero-image" class="text-sm font-medium text-[var(--color-info)]">Hero Image</label>
									<div class="flex w-full gap-3">
										<label class="table-btn variant-filled-secondary">
											Select File
										<input
												id="hero-image"
											type="file"
												class="hidden"
											accept="image/*"
											onchange={(e) => handleFileUpload(e, 'hero-image')}
											{disabled}
											/>
										</label>
										<input
											type="text"
											class="input-field w-[70%]"
											placeholder="No file selected..."
											readonly
											{disabled}
											value={heroImageFileName}
										/>
									</div>
									{#if heroImageUrl}
										<div class="mt-2">
											<img
												src={heroImageUrl}
												alt=""
												class="h-32 w-full rounded-lg object-cover"
											/>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Main Description Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('description') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('description')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('description')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:description-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Main Description</p>
								<p class=" text-sm">Content and features description</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('description')}
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

					{#if activeSections.has('description')}
						<div class="space-y-4 p-6">
							<div class="space-y-6">
								<!-- Description Heading -->
								<div class="space-y-2">
									<label for="description-heading" class="text-sm font-medium text-[var(--color-info)]"
										>Description Heading *</label
									>
									<input
										id="description-heading"
										type="text"
										bind:value={marketingMaterialSetting.DescriptionHeading}
										placeholder="Enter description heading"
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
									{#if errors?.DescriptionHeading}
										<p class="mt-1 text-sm text-red-500">{errors.DescriptionHeading}</p>
									{/if}
								</div>

								<!-- Introduction Paragraph -->
								<div class="space-y-2">
									<label for="intro-paragraph" class="text-sm font-medium text-[var(--color-info)]"
										>Introduction Paragraph</label
									>
									<textarea
										id="intro-paragraph"
										bind:value={marketingMaterialSetting.IntroParagraph}
										placeholder="Enter introduction paragraph"
										{disabled}
										rows="3"
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									></textarea>
								</div>

								<!-- Features Paragraph -->
								<div class="space-y-2">
									<label for="features-paragraph" class="text-sm font-medium text-[var(--color-info)]"
										>Features Paragraph</label
									>
									<textarea
										id="features-paragraph"
										bind:value={marketingMaterialSetting.FeaturesParagraph}
										placeholder="Enter features paragraph"
										{disabled}
										rows="3"
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									></textarea>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Benefits Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('benefits') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('benefits')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 transition-all duration-100 ease-in-out  ${
																		activeSections.has('benefits')
								? 'rounded-b-none bg-[var(--color-primary)]'
																			: `border-hover rounded bg-[var(--color-secondary)]`
																	} 
	                               `}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:check-circle-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Benefits</p>
								<p class=" text-sm">Key benefits and features list</p>
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
							<div class="space-y-6">
								<!-- Benefits Heading -->
								<div class="space-y-2">
									<label for="benefits-heading" class="text-sm font-medium text-[var(--color-info)]"
										>Benefits Section Heading</label
									>
									<input
										id="benefits-heading"
										type="text"
										bind:value={marketingMaterialSetting.BenefitsHeading}
										placeholder="Benefits to you"
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
								</div>

								<!-- Benefits Container -->
								<div id="benefitsContainer" class="space-y-3">
									{#if marketingMaterialSetting.Benefits && marketingMaterialSetting.Benefits.length > 0}
										{#each marketingMaterialSetting.Benefits as benefit, index}
											<div
												class="repeater-section relative rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
											>
												<div class="repeater-header mb-4 flex items-center justify-between">
													<h4 class="text-sm font-medium  text-[var(--color-info)]">
														Benefit #{index + 1}
										</h4>
													{#if !disabled}
														<button
															type="button"
															class="rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
															onclick={() => removeBenefitCard(index)}
														>
															Remove
														</button>
													{/if}
												</div>

												<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
										<!-- Benefit Icon Upload -->
										<div class="space-y-1">
														<label for="benefit-icon-{index}" class="text-xs font-medium text-[var(--color-info)]"
															>Icon Image</label
														>
														<div class="flex w-full gap-2">
															<label class="table-btn variant-filled-secondary text-xs">
																Select File
												<input
																	id="benefit-icon-{index}"
													type="file"
																	class="hidden"
													accept="image/*"
																	onchange={(e) => handleBenefitIconUploadForIndex(e, index)}
													{disabled}
																/>
															</label>
															<input
																type="text"
																class="input-field w-[70%] text-xs"
																placeholder="No file selected..."
																readonly
																{disabled}
																value={benefitIconFileName}
															/>
												</div>
														{#if benefit.Icon}
												<div class="mt-2">
													<img
																	src={benefit.Icon}
														alt="Benefit Icon Preview"
														class="h-12 w-12 object-contain"
													/>
												</div>
											{/if}
										</div>

										<!-- Benefit Title -->
										<div class="space-y-1">
														<label for="benefit-title-{index}" class="text-xs font-medium text-[var(--color-info)]">Title</label
														>
											<input
															id="benefit-title-{index}"
												type="text"
															bind:value={benefit.Title}
												placeholder="Enter benefit title"
												{disabled}
												class="w-full rounded border border-gray-300 p-2 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
											/>
													</div>
										</div>

										<!-- Benefit Description -->
												<div class="mt-4 space-y-1">
													<label for="benefit-description-{index}" class="text-xs font-medium text-[var(--color-info)]"
														>Description</label
													>
											<textarea
														id="benefit-description-{index}"
														bind:value={benefit.Description}
												placeholder="Enter benefit description"
												{disabled}
												rows="3"
												class="w-full rounded border border-gray-300 p-2 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
											></textarea>
										</div>
											</div>
										{/each}
											{:else}
										<div
											class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500 italic"
										>
											<p class="text-sm">No benefits added yet.</p>
											<p class="mt-1 text-xs">Click "Add Benefit" below to get started.</p>
									</div>
								{/if}
															</div>

								<!-- Add Benefit Button -->
															<button
																type="button"
									class="btn btn-success btn-add mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
									onclick={addBenefit}
								>
									+ Add Benefit
															</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- Target Audience Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('target') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('target')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('target')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:group-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Target Audience</p>
								<p class=" text-sm">Define your target users and use cases</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('target')}
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

					{#if activeSections.has('target')}
						<div class="space-y-4 p-6">
							<div class="space-y-6">
								<div class="space-y-2">
									<label for="target-heading" class="text-sm font-medium text-[var(--color-info)]">Section Heading</label
									>
									<input
										id="target-heading"
										type="text"
										bind:value={marketingMaterialSetting.TargetHeading}
										placeholder="Who should use this?"
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
								</div>

								<div class="space-y-2">
									<label for="target-paragraph-1" class="text-sm font-medium text-[var(--color-info)]">Paragraph 1</label>
									<textarea
										id="target-paragraph-1"
										bind:value={marketingMaterialSetting.TargetParagraph1}
										placeholder="Enter first paragraph"
										{disabled}
										rows="3"
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									></textarea>
								</div>

								<div class="space-y-2">
									<label for="target-paragraph-2" class="text-sm font-medium text-[var(--color-info)]">Paragraph 2</label>
									<textarea
										id="target-paragraph-2"
										bind:value={marketingMaterialSetting.TargetParagraph2}
										placeholder="Enter second paragraph"
										{disabled}
										rows="3"
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									></textarea>
								</div>

								<div class="space-y-2">
									<label for="phone-mockup" class="text-sm font-medium text-[var(--color-info)]"
										>Phone Mockup Screenshot</label
									>
									<div class="flex w-full gap-3">
										<label class="table-btn variant-filled-secondary">
											Select File
										<input
												id="phone-mockup"
											type="file"
												class="hidden"
											accept="image/*"
											onchange={(e) => handleFileUpload(e, 'phone-mockup')}
											{disabled}
											/>
										</label>
										<input
											type="text"
											class="input-field w-[70%]"
											placeholder="No file selected..."
											readonly
											{disabled}
											value={phoneMockupFileName}
										/>
									</div>
									{#if phoneMockupUrl}
										<div class="mt-2">
											<img
												src={phoneMockupUrl}
												alt="Phone Mockup"
												class="h-32 w-auto rounded-lg object-contain"
											/>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Call to Action Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						activeSections.has('cta') ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleSection('cta')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		activeSections.has('cta')
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:call-outline" class="hidden h-5 w-5 md:block" />
							<div class=" text-start">
								<p class="text-md font-medium">Call to Action</p>
								<p class=" text-sm">Contact information and QR code</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSections.has('cta')}
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

					{#if activeSections.has('cta')}
						<div class="space-y-4 p-6">
							<div class="space-y-6">
								<div class="space-y-2">
									<label for="cta-heading" class="text-sm font-medium text-[var(--color-info)]">CTA Heading</label>
									<input
										id="cta-heading"
										type="text"
										bind:value={marketingMaterialSetting.CtaHeading}
										placeholder="Register by messaging us on"
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
								</div>

								<div class="space-y-2">
									<label for="whatsapp-number" class="text-sm font-medium text-[var(--color-info)]"
										>Phone Number (WhatsApp)</label
									>
									<input
										id="whatsapp-number"
										type="tel"
										bind:value={marketingMaterialSetting.WhatsappNumber}
										placeholder="Enter WhatsApp number"
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
								</div>

								<div class="space-y-2">
									<label for="qr-code-data" class="text-sm font-medium text-[var(--color-info)]"
										>QR Code URL/Data</label
									>
									<input
										id="qr-code-data"
										type="text"
										bind:value={marketingMaterialSetting.QrCodeData}
										placeholder="https://wa.me/..."
										{disabled}
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									/>
								</div>

								<div class="space-y-2">
									<label for="qr-instruction" class="text-sm font-medium text-[var(--color-info)]"
										>QR Code Instruction Text</label
									>
									<textarea
										id="qr-instruction"
										bind:value={marketingMaterialSetting.QrInstruction}
										placeholder="Enter QR code instruction text"
										{disabled}
										rows="3"
										class="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
									></textarea>
								</div>

								<div class="space-y-2">
									<label for="qr-code-image" class="text-sm font-medium text-[var(--color-info)]">QR Code Image</label>
									<div class="flex w-full gap-3">
										<label class="table-btn variant-filled-secondary">
											Select File
										<input
												id="qr-code-image"
											type="file"
												class="hidden"
											accept="image/*"
											onchange={(e) => handleFileUpload(e, 'qrcode')}
											{disabled}
											/>
										</label>
										<input
											type="text"
											class="input-field w-[70%]"
											placeholder="No file selected..."
											readonly
											{disabled}
											value={qrCodeFileName}
										/>
									</div>
									{#if qrCodeUrl}
										<div class="mt-2">
											<img src={qrCodeUrl} alt="QR Code" class="h-16 w-16 object-contain" />
										</div>
									{/if}
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
