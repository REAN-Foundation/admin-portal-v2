<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { MarketingMaterialSettingsSchema } from '$lib/validation/tenant.settings.schema.js';
	import type {
		MarketingMaterialSettings,
		MarketingMaterialUploadModel,
		Feature
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

	let logoUrl = $derived(marketingMaterialSetting.Logo || '');
	let logoUrlResult = $state('');
	let fileName = $state('');
	let logoName = $state('');
	let qrCodeUrl = $derived(marketingMaterialSetting.QrCode || '');
	let qrCodeUrlResult = $state('');
	let qrCodeName = $state('');
	let newFeature: Feature = $state({
		Logo: '',
		Title: '',
		Description: ''
	});

	let disabled = $state(true);
	let edit = $state(false);
	let editingFeatureIndex = $state(-1);

	// Ensure Features array is always initialized
	$effect(() => {
		if (!marketingMaterialSetting.Features) {
			marketingMaterialSetting.Features = [];
		}
	});

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
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/MarketingMaterial/logo`,
				{
					method: 'POST',
					body: formData
				}
			);

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
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/MarketingMaterial/qrcode`,
				{
					method: 'POST',
					body: formData
				}
			);

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

	const handleNewFeatureLogoUpload = async (event: Event) => {
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
				newFeature.Logo = result.Data.Url;
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Feature logo upload failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Feature logo upload failed. Please try again.'
			});
		}
	};

	const handleFeatureLogoUpload = async (event: Event, featureIndex: number) => {
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
				// Update the specific feature's logo
				if (marketingMaterialSetting.Features && marketingMaterialSetting.Features[featureIndex]) {
					marketingMaterialSetting.Features[featureIndex].Logo = result.Data.Url;
				}
				toastMessage(result);
			} else {
				toastMessage(result);
			}
		} catch (error) {
			console.error('Feature logo upload failed:', error);
			toastMessage({
				Status: 'failure',
				HttpCode: 500,
				Message: 'Feature logo upload failed. Please try again.'
			});
		}
	};

	const addFeature = () => {
		if (newFeature.Title.trim() && newFeature.Description.trim()) {
			// Ensure Features array exists
			if (!marketingMaterialSetting.Features) {
				marketingMaterialSetting.Features = [];
			}
			marketingMaterialSetting.Features = [
				...marketingMaterialSetting.Features,
				{
					Logo: newFeature.Logo || '',
					Title: newFeature.Title.trim(),
					Description: newFeature.Description.trim()
				}
			];
			console.log('Added feature:', newFeature);
			console.log('Current features:', marketingMaterialSetting.Features);
			newFeature = {
				Logo: '',
				Title: '',
				Description: ''
			};
		}
	};

	const removeFeature = (index: number) => {
		marketingMaterialSetting.Features =
			marketingMaterialSetting.Features?.filter((_, i) => i !== index) || [];
		console.log('Removed feature at index:', index);
		console.log('Current features:', marketingMaterialSetting.Features);
	};

	const editFeature = (index: number) => {
		if (marketingMaterialSetting.Features && marketingMaterialSetting.Features[index]) {
			const feature = marketingMaterialSetting.Features[index];
			newFeature = {
				Logo: feature.Logo || '',
				Title: feature.Title,
				Description: feature.Description
			};
			editingFeatureIndex = index;
		}
	};

	const updateFeature = () => {
		if (editingFeatureIndex >= 0 && newFeature.Title.trim() && newFeature.Description.trim()) {
			if (marketingMaterialSetting.Features && marketingMaterialSetting.Features[editingFeatureIndex]) {
				marketingMaterialSetting.Features[editingFeatureIndex] = {
					Logo: newFeature.Logo || '',
					Title: newFeature.Title.trim(),
					Description: newFeature.Description.trim()
				};
				console.log('Updated feature at index:', editingFeatureIndex);
				console.log('Current features:', marketingMaterialSetting.Features);
			}
			// Reset form
			newFeature = {
				Logo: '',
				Title: '',
				Description: ''
			};
			editingFeatureIndex = -1;
		}
	};

	const cancelEdit = () => {
		newFeature = {
			Logo: '',
			Title: '',
			Description: ''
		};
		editingFeatureIndex = -1;
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
						<Icon icon="material-symbols:close-rounded" class="h-5" />
					</a>
				</div>
			</div>

			<div class="flex flex-col space-y-4">
				<table class="table-c">
					<thead> </thead>
					<tbody>

						<!-- Title -->
						<tr>
							<td>
								<label for="title-input" class="text-sm font-medium text-[var(--color-info)]"
									>Title</label
								>
							</td>
							<td>
								<input
									id="title-input"
									type="text"
									bind:value={marketingMaterialSetting.Title}
									placeholder="Enter Title here"
									{disabled}
									class="input-field"
								/>
								{#if errors?.Title}
									<p class="text-error">{errors.Title}</p>
								{/if}
							</td>
						</tr>

						<!-- Subtitle -->
						<tr>
							<td>
								<label for="subtitle-input" class="text-sm font-medium text-[var(--color-info)]"
									>Subtitle</label
								>
							</td>
							<td>
								<input
									id="subtitle-input"
									type="text"
									bind:value={marketingMaterialSetting.Subtitle}
									placeholder="Enter Subtitle"
									{disabled}
									class="input-field"
								/>
								{#if errors?.Subtitle}
									<p class="text-error">{errors.Subtitle}</p>
								{/if}
							</td>
						</tr>

						<!-- Bot Introduction -->
						<tr>
							<td>
								<label for="bot-intro-input" class="text-sm font-medium text-[var(--color-info)]"
									>Bot Description</label
								>
							</td>
							<td>
								<textarea
									id="bot-intro-input"
									bind:value={marketingMaterialSetting.BotIntro}
									placeholder="Enter bot introduction"
									{disabled}
									rows="4"
									class="input-field"
								></textarea>
								{#if errors?.BotIntro}
									<p class="text-error">{errors.BotIntro}</p>
								{/if}
							</td>
						</tr>

												<!-- Logo -->
						<tr>
							<td>
								<label for="logo-upload" class="text-sm font-medium text-[var(--color-info)]"
									>Logo</label
								>
							</td>
							<td>
								<input
									id="logo-upload"
									type="file"
									accept="image/*"
									onchange={handleLogoUpload}
									{disabled}
									class="input-field"
								/>
								{#if logoUrl}
									<div class="mt-2">
										<img src={logoUrl} alt="Logo" class="h-16 w-16 object-contain" />
									</div>
								{/if}
							</td>
						</tr>

						<!-- Features -->
						<tr>
							<td>
								<label for="features-section" class="text-sm font-medium text-[var(--color-info)]"
									>Features</label
								>
							</td>
							<td>
								<div id="features-section" class="space-y-4">
									<!-- Add/Edit Feature Form - Only show when in edit mode -->
									{#if edit}
									<div class="border border-[var(--color-outline)] rounded-lg p-4 space-y-3">
										<h4 class="text-sm font-medium text-[var(--color-info)]">
											{editingFeatureIndex >= 0 ? 'Edit Feature' : 'Add New Feature'}
										</h4>
										
										<!-- Feature Logo Upload -->
										<div class="space-y-1">
											<label for="feature-logo-upload" class="text-xs text-[var(--color-info)]">
												Feature Logo (Optional)
											</label>
											<input
												id="feature-logo-upload"
												type="file"
												accept="image/*"
												onchange={handleNewFeatureLogoUpload}
												{disabled}
												class="input-field"
											/>
											{#if newFeature.Logo}
												<div class="mt-2">
													<img src={newFeature.Logo} alt="Feature Logo Preview" class="h-12 w-12 object-contain" />
												</div>
											{/if}
										</div>

										<!-- Feature Title -->
										<div class="space-y-1">
											<label for="feature-title-input" class="text-xs text-[var(--color-info)]">
												Feature Title *
											</label>
											<input
												id="feature-title-input"
												type="text"
												bind:value={newFeature.Title}
												placeholder="Enter feature title"
												{disabled}
												class="input-field"
											/>
										</div>

										<!-- Feature Description -->
										<div class="space-y-1">
											<label for="feature-description-input" class="text-xs text-[var(--color-info)]">
												Feature Description *
											</label>
											<textarea
												id="feature-description-input"
												bind:value={newFeature.Description}
												placeholder="Enter feature description"
												{disabled}
												rows="3"
												class="input-field"
											></textarea>
										</div>

										<!-- Add/Update/Cancel Buttons -->
										<div class="flex justify-end gap-2">
											{#if editingFeatureIndex >= 0}
												<button
													type="button"
													onclick={cancelEdit}
													{disabled}
													class="table-btn variant-outline-secondary"
												>
													Cancel
												</button>
												<button
													type="button"
													onclick={updateFeature}
													{disabled}
													class="table-btn variant-filled-secondary"
												>
													Update Feature
												</button>
											{:else}
												<button
													type="button"
													onclick={addFeature}
													{disabled}
													class="table-btn variant-filled-secondary"
												>
													Add Feature
												</button>
											{/if}
										</div>
									</div>
									{:else}
										<div class="text-center py-4 text-slate-500 text-sm">
											<Icon icon="material-symbols:edit" class="h-8 w-8 mx-auto mb-2 opacity-50" />
											<p>Click "Edit" to add or modify features</p>
											{#if marketingMaterialSetting.Features && marketingMaterialSetting.Features.length > 0}
												<p class="text-xs mt-1 opacity-75">
													{marketingMaterialSetting.Features.length} feature{marketingMaterialSetting.Features.length !== 1 ? 's' : ''} configured
												</p>
											{/if}
										</div>
									{/if}

									<!-- Existing Features List -->
									{#if marketingMaterialSetting.Features && marketingMaterialSetting.Features.length > 0}
										<div class="space-y-3">
											<h4 class="text-sm font-medium text-[var(--color-info)]">Current Features</h4>
											{#each marketingMaterialSetting.Features as feature, index}
												<div class="border border-[var(--color-outline)] rounded-lg p-4 space-y-3">
													<div class="flex items-start justify-between">
														<div class="flex-1 space-y-2">
															<!-- Feature Logo Display -->
															{#if feature.Logo}
																<div class="flex items-center gap-2">
																	<img src={feature.Logo} alt="Feature Logo" class="h-8 w-8 object-contain" />
																	<span class="text-xs text-gray-500">Feature Logo</span>
																</div>
															{/if}

															<!-- Feature Title -->
															<div>
																<span class="text-xs text-[var(--color-info)] font-medium">Title</span>
																<p class="text-sm font-medium">{feature.Title}</p>
															</div>

															<!-- Feature Description -->
															<div>
																<span class="text-xs text-[var(--color-info)] font-medium">Description</span>
																<p class="text-sm text-gray-700">{feature.Description}</p>
															</div>
														</div>

														<!-- Action Buttons -->
														{#if !disabled}
															<div class="flex gap-1">
																<button
																	type="button"
																	onclick={() => editFeature(index)}
																	class="text-blue-600 hover:text-blue-800 p-1"
																	title="Edit feature"
																>
																	<Icon icon="material-symbols:edit" class="h-5 w-5" />
																</button>
																<button
																	type="button"
																	onclick={() => removeFeature(index)}
																	class="text-red-600 hover:text-red-800 p-1"
																	title="Remove feature"
																>
																	<Icon icon="material-symbols:close" class="h-5 w-5" />
																</button>
															</div>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									{:else}
										<div class="text-sm text-gray-500 italic text-center py-4">
											No features added yet. Add your first feature above.
										</div>
									{/if}
								</div>
							</td>
						</tr>

						<!-- Conclusion -->
						<tr>
							<td>
								<label for="conclusion-input" class="text-sm font-medium text-[var(--color-info)]"
									>Conclusion</label
								>
							</td>
							<td>
								<textarea
									id="conclusion-input"
									bind:value={marketingMaterialSetting.Conclusion}
									placeholder="Enter conclusion"
									{disabled}
									rows="4"
									class="input-field"
								></textarea>
								{#if errors?.Conclusion}
									<p class="text-error">{errors.Conclusion}</p>
								{/if}
							</td>
						</tr>

						<!-- QR Code -->
						<tr>
							<td>
								<label for="qrcode-upload" class="text-sm font-medium text-[var(--color-info)]"
									>QR Code</label
								>
							</td>
							<td>
								<input
									id="qrcode-upload"
									type="file"
									accept="image/*"
									onchange={handleQrCodeUpload}
									{disabled}
									class="input-field"
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
