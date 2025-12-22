<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { MarketingMaterialRequestSchema } from '$lib/validation/tenant.settings.schema';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';
	import type { FaviconUploadModel } from '$lib/types/tenant.settings.types.js';
	import { createMarketingState } from '$lib/components/marketing-material/marketing-material.state.svelte';
	import { validateQRCode, uploadFile, downloadMaterial } from '$lib/components/marketing-material/marketing-material.utils';

	// Import section components
	import HeaderSection from '$lib/components/marketing-material/sections/HeaderSection.svelte';
	import IntroductionSection from '$lib/components/marketing-material/sections/IntroductionSection.svelte';
	import BenefitsSection from '$lib/components/marketing-material/sections/BenefitsSection.svelte';
	import UserInterfaceSection from '$lib/components/marketing-material/sections/UserInterfaceSection.svelte';
	import FooterSection from '$lib/components/marketing-material/sections/FooterSection.svelte';
	import ImagesSection from '$lib/components/marketing-material/sections/ImagesSection.svelte';
	import QRSection from '$lib/components/marketing-material/sections/QRSection.svelte';
	import LogosSection from '$lib/components/marketing-material/sections/LogosSection.svelte';
	import ColorsSection from '$lib/components/marketing-material/sections/ColorsSection.svelte';
	import FontsSection from '$lib/components/marketing-material/sections/FontsSection.svelte';
	import SizesSection from '$lib/components/marketing-material/sections/SizesSection.svelte';

	let { data } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;
	const marketingMaterialRoute = `/users/${userId}/tenants/${tenantId}/marketing-material`;

	const breadCrumbs = [
		{ name: 'Tenants', path: tenantRoute },
		{ name: 'Marketing Material', path: marketingMaterialRoute }
	];

	const isEmpty = data.isEmpty || !data.marketingMaterial;
	const marketingState = createMarketingState(data, isEmpty);

	let submitPromise = $state<Promise<void> | undefined>(undefined);
	let downloadPromise = $state<Promise<void> | undefined>(undefined);

	const getImageUrl = (resourceId: string) => {
		if (!resourceId) return null;
		return `/api/server/file-resources/download/${resourceId}`;
	};

	const handleEditClick = () => {
		marketingState.toggleEdit();
		addToast({
			message: marketingState.edit ? 'Edit mode enabled.' : 'Edit mode disabled.',
			type: 'info',
			timeout: 3000
		});
	};

	const handleDownload = () => downloadMaterial(tenantId, marketingState.hasMarketingMaterial);

	const onImageSelected = async (e: Event, imageType: 'titleImage' | 'userInterfaceImage') => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const fileCreateModel: FaviconUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		if (!fileValidationResult.success) {
			marketingState.errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		if (imageType === 'titleImage') {
			marketingState.titleImageFileName = file.name;
			marketingState.titleImageFile = file;
		} else {
			marketingState.userInterfaceImageFileName = file.name;
			marketingState.userInterfaceImageFile = file;
		}
	};

	const onLogoSelected = async (e: Event, logoIndex: number) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const fileValidationResult = imageUploadSchema.safeParse({
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		});

		if (!fileValidationResult.success) {
			marketingState.errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		marketingState.setLogoFile(logoIndex, file, file.name);
	};

	const onQRCodeSelected = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const newErrors = { ...marketingState.errors };
		delete newErrors.qrCode;
		delete newErrors.qrCodeSize;
		marketingState.errors = newErrors;

		const fileValidationResult = imageUploadSchema.safeParse({
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		});

		if (!fileValidationResult.success) {
			marketingState.errors = {
				...marketingState.errors,
				...Object.fromEntries(
					Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				)
			};
			return;
		}

		const qrValidation = await validateQRCode(file);

		if (!qrValidation.isValid) {
			marketingState.errors = { ...marketingState.errors, qrCode: qrValidation.errors.join(' ') };
			marketingState.qrCodeFileName = '';
			marketingState.qrCodeFile = null;
			input.value = '';
			return;
		}

		const cleanErrors = { ...marketingState.errors };
		delete cleanErrors.qrCode;
		delete cleanErrors.qrCodeSize;
		marketingState.errors = cleanErrors;
		marketingState.qrCodeFileName = file.name;
		marketingState.qrCodeFile = file;
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			if (marketingState.disabled) {
				addToast({ message: 'Nothing to edit!', type: 'warning', timeout: 3000 });
				return;
			}

			marketingState.errors = {};

			// Collect files to upload
			const filesToUpload: Array<{ file: File; type: string; index?: number }> = [];

			if (marketingState.titleImageFile)
				filesToUpload.push({ file: marketingState.titleImageFile, type: 'Title image' });
			if (marketingState.userInterfaceImageFile)
				filesToUpload.push({ file: marketingState.userInterfaceImageFile, type: 'User interface image' });
			marketingState.logoFiles.forEach((file, index) => {
				if (file) filesToUpload.push({ file, type: `Logo ${index + 1}`, index });
			});
			if (marketingState.qrCodeFile) filesToUpload.push({ file: marketingState.qrCodeFile, type: 'QR code' });

			// Upload files
			if (filesToUpload.length > 0) {
				addToast({
					message: `Uploading ${filesToUpload.length} file(s)...`,
					type: 'info',
					timeout: 3000
				});

				const uploadResults = await Promise.all(
					filesToUpload.map(({ file, type }) => uploadFile(file, type))
				);

				const failures = uploadResults
					.map((result, idx) => ({ result, file: filesToUpload[idx] }))
					.filter(({ result }) => !result.success);

				if (failures.length > 0) {
					const errorMessages = failures
						.map(({ file, result }) => `${file.type}: ${result.error}`)
						.join('\n');
					addToast({
						message: `Failed to upload ${failures.length} file(s):\n${errorMessages}`,
						type: 'error',
						timeout: 5000
					});
					return;
				}

				// Update resource IDs
				uploadResults.forEach((result, idx) => {
					const fileInfo = filesToUpload[idx];
					if (result.success && result.resourceId) {
						switch (fileInfo.type) {
							case 'Title image':
								marketingState.Images.TitleImage = result.resourceId;
								marketingState.titleImageFile = null;
								break;
							case 'User interface image':
								marketingState.Images.UserInterfaceImage = result.resourceId;
								marketingState.userInterfaceImageFile = null;
								break;
							case 'QR code':
								marketingState.QRcode = { ResourceId: result.resourceId };
								marketingState.qrCodeFile = null;
								break;
							default:
								if (fileInfo.type.startsWith('Logo') && fileInfo.index !== undefined) {
									const newLogos = [...marketingState.Logos];
									newLogos[fileInfo.index] = result.resourceId;
									marketingState.Logos = newLogos;
									const newLogoFiles = [...marketingState.logoFiles];
									newLogoFiles[fileInfo.index] = null;
									marketingState.logoFiles = newLogoFiles;
								}
						}
					}
				});

				addToast({
					message: `Successfully uploaded ${uploadResults.length} file(s)`,
					type: 'success',
					timeout: 3000
				});
			}

			// Prepare marketing material model
			const finalLogosArray = marketingState.Logos.filter((logo) => logo && logo.trim() !== '');

			const marketingMaterialModel = {
				Styling: marketingState.Styling,
				Content: {
					...marketingState.Content,
					Benefits: {
						...marketingState.Content.Benefits,
						Items: marketingState.Content.Benefits.Items?.filter((item) => item.trim() !== '') ?? []
					}
				},
				Images: marketingState.Images,
				Logos: finalLogosArray.length > 0 ? finalLogosArray : null,
				QRCode: marketingState.QRcode,
				PageView: marketingState.pageView
			};

			// Validate
			const validationResult = MarketingMaterialRequestSchema.safeParse(marketingMaterialModel);

			if (!validationResult.success) {
				marketingState.errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				addToast({
					message: 'Validation failed. Please check the form.',
					type: 'error',
					timeout: 3000
				});
				return;
			}

			// Submit
			const method = isEmpty ? 'POST' : 'PUT';
			const res = await fetch(`/api/server/tenants/settings/${tenantId}/marketing-material`, {
				method,
				body: JSON.stringify(marketingMaterialModel),
				headers: { 'content-type': 'application/json' }
			});

			if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				marketingState.edit = false;
				marketingState.disabled = true;
				marketingState.hasMarketingMaterial = true;
				marketingState.Logos = [...marketingState.Logos];
				return;
			}

			if (response.Errors) {
				marketingState.errors = response.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			addToast({
				message: 'An unexpected error occurred. Please try again.',
				type: 'error',
				timeout: 5000
			});
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-5 py-4">
	<div class="mx-auto my-2 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (submitPromise = handleSubmit(event))}>
			<!-- Header -->
			<div
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class="text-xl text-[var(--color-info)]">Marketing Material</h1>
				<div class="flex items-center gap-2 text-end">
					{#if downloadPromise}
						{#await downloadPromise}
							<button type="button" class="table-btn variant-filled-secondary gap-1" disabled>
								<Icon icon="meteor-icons:download" class="h-5" />
								Downloading...
							</button>
						{:then}
							<button
								type="button"
								class="table-btn variant-filled-secondary gap-1"
								onclick={() => (downloadPromise = handleDownload())}
								disabled={!marketingState.hasMarketingMaterial}
							>
								<Icon icon="meteor-icons:download" class="h-5" />
							</button>
						{:catch}
							<button
								type="button"
								class="table-btn variant-filled-secondary gap-1"
								onclick={() => (downloadPromise = handleDownload())}
								disabled={!marketingState.hasMarketingMaterial}
							>
								<Icon icon="meteor-icons:download" class="h-5" />
							</button>
						{/await}
					{:else}
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={() => (downloadPromise = handleDownload())}
							disabled={!marketingState.hasMarketingMaterial}
						>
							<Icon icon="meteor-icons:download" class="h-5" />
						</button>
					{/if}
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" class="h-5" />
					</button>
					<a
						href={tenantRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-light-red)]"
					>
						<Icon icon="material-symbols:close-rounded" class="h-5" />
					</a>
				</div>
			</div>

			<!-- Page View Selection -->
			<div class="border-b border-[var(--color-outline)] bg-[var(--color-secondary)] px-5 py-4">
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h3 class="text-base font-semibold text-[var(--color-info)]">PDF Page View</h3>
						<p class="text-sm text-[var(--color-muted)]">
							Select the number of pages for your marketing material PDF
						</p>
					</div>
					<div class="flex gap-3">
						<button
							type="button"
							onclick={() => (marketingState.pageView = 1)}
							disabled={marketingState.disabled}
							class="inline-flex items-center gap-2 rounded-md border-2 px-4 py-2 text-sm font-medium transition-all {marketingState.pageView ===
							1
								? 'border-[var(--color-blue)] bg-[var(--color-accent)] text-[var(--color-info)]'
								: 'border-[var(--color-outline)] bg-[var(--color-primary)] text-[var(--color-info)] hover:bg-[var(--color-secondary)]'} disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon icon="material-symbols:page-info-outline" class="h-5 w-5" />
							<span>1 Page</span>
						</button>
						<button
							type="button"
							onclick={() => (marketingState.pageView = 2)}
							disabled={marketingState.disabled}
							class="inline-flex items-center gap-2 rounded-md border-2 px-4 py-2 text-sm font-medium transition-all {marketingState.pageView ===
							2
								? 'border-[var(--color-blue)] bg-[var(--color-accent)] text-[var(--color-info)]'
								: 'border-[var(--color-outline)] bg-[var(--color-primary)] text-[var(--color-info)] hover:bg-[var(--color-secondary)]'} disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon icon="material-symbols:pages-outline" class="h-5 w-5" />
							<span>2 Pages</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Sections -->
			<div class="flex flex-col space-y-4 px-4 py-4">
				<LogosSection {marketingState} {data} {getImageUrl} {onLogoSelected} />
				<HeaderSection {marketingState} />
				<IntroductionSection {marketingState} />
				<BenefitsSection {marketingState} />
				<UserInterfaceSection {marketingState} />
				<FooterSection {marketingState} />
				<ImagesSection {marketingState} {data} {getImageUrl} {onImageSelected} />
				<QRSection {marketingState} {data} {getImageUrl} {onQRCodeSelected} />
				<ColorsSection {marketingState} />
				<FontsSection {marketingState} />
				<SizesSection {marketingState} />
			</div>

			<hr class="border-[0.5px] border-t border-[var(--color-outline)]" />

			<!-- Submit Button -->
			<div class="button-container my-4">
				{#if submitPromise}
					{#await submitPromise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submitting
						</button>
					{:then}
						<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
					{/await}
				{:else}
					<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
				{/if}
			</div>
		</form>
	</div>
</div>