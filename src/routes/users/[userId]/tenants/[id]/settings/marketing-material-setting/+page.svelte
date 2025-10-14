<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { MarketingMaterialSettingsSchema } from '$lib/validation/tenant.settings.schema.js';
	import type {
		MarketingMaterialSettings,
		MarketingMaterialUploadModel
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
		Logo: data.marketingMaterialSettings?.Logo || '',
		Title: data.marketingMaterialSettings?.Title || '',
		Subtitle: data.marketingMaterialSettings?.Subtitle || '',
		ProblemIntro: data.marketingMaterialSettings?.ProblemIntro || '',
		BotIntro: data.marketingMaterialSettings?.BotIntro || '',
		Features: data.marketingMaterialSettings?.Features || [],
		Conclusion: data.marketingMaterialSettings?.Conclusion || '',
		QrCode: data.marketingMaterialSettings?.QrCode || null
	});

	let logoUrl = $state(marketingMaterialSetting.Logo);
	let logoUrlResult = $state('');
	let fileName = $state('');
	let logoName = $state('');
	let qrCodeUrl = $state(marketingMaterialSetting.QrCode);
	let qrCodeUrlResult = $state('');
	let qrCodeName = $state('');
	let newFeature = $state('');

	let disabled = $state(true);
	let edit = $state(false);

	const handleEditClick = async () => {
		disabled = !disabled;
		edit = !edit;
	};

	const handleLogoUpload = async (event: Event) => {
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
		logoName = file.name;

		try {
			const response = await fetch(`/api/server/tenants/settings/${tenantId}/MarketingMaterial/logo`, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			if (result.HttpCode === 200 || result.HttpCode === 201) {
				logoUrlResult = result.Data.Url;
				marketingMaterialSetting.Logo = result.Data.Url;
				logoUrl = result.Data.Url;
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Logo upload failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Logo upload failed. Please try again.'
			});
		}
	};

	const handleQrCodeUpload = async (event: Event) => {
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
		qrCodeName = file.name;

		try {
			const response = await fetch(`/api/server/tenants/settings/${tenantId}/MarketingMaterial/qrcode`, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			if (result.HttpCode === 200 || result.HttpCode === 201) {
				qrCodeUrlResult = result.Data.Url;
				marketingMaterialSetting.QrCode = result.Data.Url;
				qrCodeUrl = result.Data.Url;
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('QR Code upload failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'QR Code upload failed. Please try again.'
			});
		}
	};

	const addFeature = () => {
		if (newFeature.trim()) {
			marketingMaterialSetting.Features = [...(marketingMaterialSetting.Features || []), newFeature.trim()];
			newFeature = '';
		}
	};

	const removeFeature = (index: number) => {
		marketingMaterialSetting.Features = marketingMaterialSetting.Features?.filter((_, i) => i !== index) || [];
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
				disabled = true;
				edit = false;
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
			const response = await fetch(`/api/server/tenants/settings/${tenantId}/MarketingMaterial/export`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

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
					Logo: '',
					Title: '',
					Subtitle: '',
					ProblemIntro: '',
					BotIntro: '',
					Features: [],
					Conclusion: '',
					QrCode: null
				};
				logoUrl = '';
				qrCodeUrl = null;
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

<div class="my-8 px-5 py-2">
	<div class="mx-auto">
		<div class="border border-[var(--color-outline)]">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<div
					class="flex items-center justify-between rounded-t-lg bg-[var(--color-primary)] px-5 py-6"
				>
					<h2 class="text-lg font-semibold text-[var(--color-info)]">
						Marketing material
					</h2>
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
							Edit
						</button>
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={handleDelete}
						>
							<Icon icon="material-symbols:delete-outline" />
							Delete
						</button>
						<a
							href={tenantRoute}
							class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
						>
							<Icon icon="material-symbols:close-rounded" class="h-5" />
						</a>
					</div>
				</div>

				<div class="flex flex-col space-y-4">
					<table class="table-c">
						<thead>
						</thead>
						<tbody>
							<!-- Logo -->
							<tr>
								<td>
									<label for="logo-upload" class="text-sm text-[var(--color-info)]">Logo</label>
								</td>
								<td>
									<input
										id="logo-upload"
										type="file"
										accept="image/*"
										onchange={handleLogoUpload}
										disabled={disabled}
										class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									/>
									{#if logoUrl}
										<div class="mt-2">
											<img src={logoUrl} alt="Logo" class="h-16 w-16 object-contain" />
										</div>
									{/if}
								</td>
							</tr>

							<!-- Title -->
							<tr>
								<td>
									<label for="title-input" class="text-sm text-[var(--color-info)]">Title</label>
								</td>
								<td>
									<input
										id="title-input"
										type="text"
										bind:value={marketingMaterialSetting.Title}
										placeholder="Enter Title here"
										disabled={disabled}
										class="w-full rounded border p-2 text-sm text-[var(--color-info)] {errors?.Title ? 'border-red-500' : ''}"
									/>
									{#if errors?.Title}
										<p class="text-error">{errors.Title}</p>
									{/if}
								</td>
							</tr>

							<!-- Subtitle -->
							<tr>
								<td>
									<label for="subtitle-input" class="text-sm text-[var(--color-info)]">Subtitle</label>
								</td>
								<td>
									<input
										id="subtitle-input"
										type="text"
										bind:value={marketingMaterialSetting.Subtitle}
										placeholder="Enter Subtitle"
										disabled={disabled}
										class="w-full rounded border p-2 text-sm text-[var(--color-info)] {errors?.Subtitle ? 'border-red-500' : ''}"
									/>
									{#if errors?.Subtitle}
										<p class="text-error">{errors.Subtitle}</p>
									{/if}
								</td>
							</tr>

							<!-- Problem Introduction -->
							<tr>
								<td>
									<label for="problem-intro-input" class="text-sm text-[var(--color-info)]">Problem Intro</label>
								</td>
								<td>
									<textarea
										id="problem-intro-input"
										bind:value={marketingMaterialSetting.ProblemIntro}
										placeholder="Enter problem introduction"
										disabled={disabled}
										rows="4"
										class="w-full rounded border p-2 text-sm text-[var(--color-info)] {errors?.ProblemIntro ? 'border-red-500' : ''}"
									></textarea>
									{#if errors?.ProblemIntro}
										<p class="text-error">{errors.ProblemIntro}</p>
									{/if}
								</td>
							</tr>

							<!-- Bot Introduction -->
							<tr>
								<td>
									<label for="bot-intro-input" class="text-sm text-[var(--color-info)]">Bot Intro</label>
								</td>
								<td>
									<textarea
										id="bot-intro-input"
										bind:value={marketingMaterialSetting.BotIntro}
										placeholder="Enter bot introduction"
										disabled={disabled}
										rows="4"
										class="w-full rounded border p-2 text-sm text-[var(--color-info)] {errors?.BotIntro ? 'border-red-500' : ''}"
									></textarea>
									{#if errors?.BotIntro}
										<p class="text-error">{errors.BotIntro}</p>
									{/if}
								</td>
							</tr>

							<!-- Features -->
							<tr>
								<td>
									<label for="feature-input" class="text-sm text-[var(--color-info)]">Features</label>
								</td>
								<td>
									<div class="space-y-2">
										<div class="flex gap-2">
											<input
												id="feature-input"
												type="text"
												bind:value={newFeature}
												placeholder="Enter feature"
												disabled={disabled}
												class="flex-1 rounded border p-2 text-sm text-[var(--color-info)]"
												onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
											/>
											<button
												type="button"
												onclick={addFeature}
												disabled={disabled}
												class="table-btn variant-filled-secondary"
											>
												Add
											</button>
										</div>
										{#if marketingMaterialSetting.Features && marketingMaterialSetting.Features.length > 0}
											<div class="space-y-1">
												{#each marketingMaterialSetting.Features as feature, index}
													<div class="flex items-center gap-2 rounded bg-gray-100 p-2">
														<span class="flex-1 text-sm">{feature}</span>
														{#if !disabled}
															<button
																type="button"
																onclick={() => removeFeature(index)}
																class="text-red-600 hover:text-red-800"
															>
																<Icon icon="material-symbols:close" class="h-4 w-4" />
															</button>
														{/if}
													</div>
												{/each}
											</div>
										{/if}
									</div>
								</td>
							</tr>

							<!-- Conclusion -->
							<tr>
								<td>
									<label for="conclusion-input" class="text-sm text-[var(--color-info)]">Conclusion</label>
								</td>
								<td>
									<textarea
										id="conclusion-input"
										bind:value={marketingMaterialSetting.Conclusion}
										placeholder="Enter conclusion"
										disabled={disabled}
										rows="4"
										class="w-full rounded border p-2 text-sm text-[var(--color-info)] {errors?.Conclusion ? 'border-red-500' : ''}"
									></textarea>
									{#if errors?.Conclusion}
										<p class="text-error">{errors.Conclusion}</p>
									{/if}
								</td>
							</tr>

							<!-- QR Code -->
							<tr>
								<td>
									<label for="qrcode-upload" class="text-sm text-[var(--color-info)]">QR Code</label>
								</td>
								<td>
									<input
										id="qrcode-upload"
										type="file"
										accept="image/*"
										onchange={handleQrCodeUpload}
										disabled={disabled}
										class="w-full rounded border p-2 text-sm text-[var(--color-info)]"
									/>
									{#if qrCodeUrl}
										<div class="mt-2">
											<img src={qrCodeUrl} alt="QR Code" class="h-16 w-16 object-contain" />
										</div>
									{/if}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<hr class="border-[0.5px] border-t border-[var(--color-outline)]" />

				<div class="button-container my-4">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submitting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
