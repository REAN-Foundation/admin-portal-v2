<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type {
		VitalsThresholds,
		VitalThresholdConfig,
		ThresholdCategory,
		RangeDefinition,
		VitalType
	} from '$lib/types/tenant.settings.types';
	import {
		VITAL_TYPES,
		VITAL_DISPLAY_NAMES,
		SEVERITY_OPTIONS
	} from '$lib/types/tenant.settings.types';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	// Normalize: ensure every vital config has a Categories array
	// and each category has Ranges (object) and AlertMessage (object)
	const normalizeThresholds = (raw: VitalsThresholds | undefined): VitalsThresholds => {
		const result = structuredClone(raw || {});
		for (const key of Object.keys(result) as VitalType[]) {
			const config = result[key];
			if (!config) continue;
			if (!Array.isArray(config.Categories)) {
				config.Categories = [];
			}
			for (const cat of config.Categories) {
				if (!cat.Ranges || typeof cat.Ranges !== 'object') {
					cat.Ranges = {};
				}
				if (!cat.AlertMessage || typeof cat.AlertMessage !== 'object') {
					cat.AlertMessage = {};
				}
			}
		}
		return result;
	};

	let vitalsThresholds: VitalsThresholds = $state(
		normalizeThresholds(data.vitalsThresholds)
	);

	console.log('data.vitalsThresholds', data.vitalsThresholds)
	let isEditing = $state(false);
	let promise = $state();
	let expandedVitals: Record<string, boolean> = $state({});
	let expandedCategories: Record<string, boolean> = $state({});

	// New vital form state
	let showAddVitalForm = $state(false);
	let newVitalType = $state<VitalType>('Pulse');

	const availableVitalTypes = $derived(
		VITAL_TYPES.filter((vt) => !vitalsThresholds[vt])
	);

	///////////////////////////////////////////////////////////////////////////
	// Handlers
	///////////////////////////////////////////////////////////////////////////

	const handleEditClick = () => {
		isEditing = !isEditing;
		if (isEditing) {
			addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
		} else {
			addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
			showAddVitalForm = false;
			// Reset to original data
			vitalsThresholds = normalizeThresholds(data.vitalsThresholds);
		}
	};

	const toggleVitalExpanded = (vitalType: string) => {
		expandedVitals[vitalType] = !expandedVitals[vitalType];
	};

	const toggleCategoryExpanded = (key: string) => {
		expandedCategories[key] = !expandedCategories[key];
	};

	const handleAddVital = () => {
		if (!newVitalType || vitalsThresholds[newVitalType]) {
			addToast({ message: 'Vital type already exists or is invalid.', type: 'error', timeout: 3000 });
			return;
		}

		const newConfig: VitalThresholdConfig = {
			Enabled: false,
			Unit: '',
			Categories: [
				{
					Category: '',
					Severity: 'Normal',
					Ranges: {},
					AlertMessage: { 'en-US': '' },
					SendAlert: false,
					Priority: 1
				}
			]
		};

		vitalsThresholds = { ...vitalsThresholds, [newVitalType]: newConfig };
		expandedVitals[newVitalType] = true;
		expandedCategories[`${newVitalType}-0`] = true;
		showAddVitalForm = false;
		addToast({ message: `${VITAL_DISPLAY_NAMES[newVitalType]} added.`, type: 'success', timeout: 3000 });
	};

	const handleDeleteVital = (vitalType: VitalType) => {
		const updated = { ...vitalsThresholds };
		delete updated[vitalType];
		vitalsThresholds = updated;
		addToast({ message: `${VITAL_DISPLAY_NAMES[vitalType]} removed.`, type: 'success', timeout: 3000 });
	};

	const handleAddCategory = (vitalType: VitalType) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;

		const maxPriority = config.Categories.reduce((max, c) => Math.max(max, c.Priority), 0);
		const newCategory: ThresholdCategory = {
			Category: '',
			Severity: 'Normal',
			Ranges: {},
			AlertMessage: { 'en-US': '' },
			SendAlert: false,
			Priority: maxPriority + 1
		};

		config.Categories = [...config.Categories, newCategory];
		vitalsThresholds = { ...vitalsThresholds };
		const catKey = `${vitalType}-${config.Categories.length - 1}`;
		expandedCategories[catKey] = true;
	};

	const handleDeleteCategory = (vitalType: VitalType, catIndex: number) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		if (config.Categories.length <= 1) {
			addToast({ message: 'At least one category is required.', type: 'error', timeout: 3000 });
			return;
		}
		config.Categories = config.Categories.filter((_, i) => i !== catIndex);
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleAddRange = (vitalType: VitalType, catIndex: number) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		const existingNames = Object.keys(category.Ranges);
		const newName = `Range${existingNames.length + 1}`;
		category.Ranges = { ...category.Ranges, [newName]: { Min: null, Max: null } };
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleDeleteRange = (vitalType: VitalType, catIndex: number, rangeName: string) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		const updated = { ...category.Ranges };
		delete updated[rangeName];
		category.Ranges = updated;
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleRenameRange = (
		vitalType: VitalType,
		catIndex: number,
		oldName: string,
		newName: string
	) => {
		if (!newName || newName === oldName) return;
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		if (category.Ranges[newName]) {
			addToast({ message: 'Range name already exists.', type: 'error', timeout: 3000 });
			return;
		}
		const updatedRanges: Record<string, RangeDefinition> = {};
		for (const [key, value] of Object.entries(category.Ranges)) {
			if (key === oldName) {
				updatedRanges[newName] = value;
			} else {
				updatedRanges[key] = value;
			}
		}
		category.Ranges = updatedRanges;
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleAddAlertLanguage = (vitalType: VitalType, catIndex: number) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		const existingLangs = Object.keys(category.AlertMessage);
		if (!existingLangs.includes('en-US')) {
			category.AlertMessage = { ...category.AlertMessage, 'en-US': '' };
		} else if (!existingLangs.includes('es-ES')) {
			category.AlertMessage = { ...category.AlertMessage, 'es-ES': '' };
		} else {
			addToast({ message: 'Add a custom language code.', type: 'info', timeout: 3000 });
			category.AlertMessage = { ...category.AlertMessage, '': '' };
		}
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleDeleteAlertLanguage = (vitalType: VitalType, catIndex: number, langCode: string) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		const updated = { ...category.AlertMessage };
		delete updated[langCode];
		category.AlertMessage = updated;
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleRenameAlertLanguage = (
		vitalType: VitalType,
		catIndex: number,
		oldLang: string,
		newLang: string
	) => {
		if (!newLang || newLang === oldLang) return;
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		if (category.AlertMessage[newLang] !== undefined) {
			addToast({ message: 'Language code already exists.', type: 'error', timeout: 3000 });
			return;
		}
		const updated: Record<string, string> = {};
		for (const [key, value] of Object.entries(category.AlertMessage)) {
			if (key === oldLang) {
				updated[newLang] = value;
			} else {
				updated[key] = value;
			}
		}
		category.AlertMessage = updated;
		vitalsThresholds = { ...vitalsThresholds };
	};

	const parseNullableNumber = (value: string): number | null => {
		if (value === '' || value === 'null') return null;
		const num = parseFloat(value);
		return isNaN(num) ? null : num;
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();

		if (!isEditing) {
			addToast({ message: 'Nothing to edit!', type: 'info', timeout: 3000 });
			return;
		}

		// Basic validation
		for (const [vitalType, config] of Object.entries(vitalsThresholds)) {
			if (!config) continue;
			if (!config.Unit || config.Unit.trim().length === 0) {
				addToast({
					message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: Unit is required.`,
					type: 'error',
					timeout: 3000
				});
				return;
			}
			for (let i = 0; i < config.Categories.length; i++) {
				const cat = config.Categories[i];
				if (!cat.Category || cat.Category.trim().length === 0) {
					addToast({
						message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: Category name is required for category ${i + 1}.`,
						type: 'error',
						timeout: 3000
					});
					return;
				}
				if (!cat.Severity || cat.Severity.trim().length === 0) {
					addToast({
						message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: Severity is required for "${cat.Category}".`,
						type: 'error',
						timeout: 3000
					});
					return;
				}
				if (Object.keys(cat.Ranges).length === 0) {
					addToast({
						message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: At least one range is required for "${cat.Category}".`,
						type: 'error',
						timeout: 3000
					});
					return;
				}
				if (Object.keys(cat.AlertMessage).length === 0) {
					addToast({
						message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: At least one alert message is required for "${cat.Category}".`,
						type: 'error',
						timeout: 3000
					});
					return;
				}
			}
		}

		try {
			const response = await fetch(
				`/api/server/tenants/settings/${tenantId}/VitalsThresholds`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(vitalsThresholds)
				}
			);

			const result = await response.json();

			if (response.ok && (result.HttpCode === 200 || result.HttpCode === 201)) {
				toastMessage(result);
				isEditing = false;
				showAddVitalForm = false;
				// Update original data reference
				data.vitalsThresholds = $state.snapshot(vitalsThresholds);
			} else if (result.Errors) {
				const firstError = Object.values(result.Errors)[0];
				addToast({
					message: (firstError as string) || result.Message || 'Validation failed.',
					type: 'error',
					timeout: 3000
				});
			} else {
				toastMessage(result);
			}
		} catch (err) {
			console.error('Error saving vitals thresholds:', err);
			toastMessage();
		}
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<!-- Header -->
			<div
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class="text-xl text-[var(--color-info)]">Vital Alert Settings</h1>
				<div class="flex items-center gap-2 text-end">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" />
					</button>
					<a
						href={settingsRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
					>
						<Icon icon="material-symbols:close-rounded" class="h-5" />
					</a>
				</div>
			</div>

			<div class="flex flex-col space-y-4 px-5 py-4">
				<!-- Add Vital Button -->
				{#if isEditing && availableVitalTypes.length > 0}
					{#if !showAddVitalForm}
						<div class="flex justify-end">
							<Button
								type="button"
								variant="primary"
								size="md"
								text="+ Add Vital"
								onclick={() => {
									newVitalType = availableVitalTypes[0];
									showAddVitalForm = true;
								}}
							/>
						</div>
					{:else}
						<div class="space-y-4 rounded-lg border border-[var(--color-outline)] p-4">
							<div class="flex flex-col gap-3 md:flex-row md:items-center">
								<label
									for="newVitalType"
									class="text mx-1 w-[30%] font-medium text-[var(--color-info)]"
								>
									Vital Type <span class="text-red-700">*</span>
								</label>
								<select
									id="newVitalType"
									class="select w-[70%]"
									bind:value={newVitalType}
								>
									{#each availableVitalTypes as vt}
										<option value={vt}>{VITAL_DISPLAY_NAMES[vt]}</option>
									{/each}
								</select>
							</div>
							<div class="flex justify-end gap-2">
								<Button
									type="button"
									variant="primary"
									size="md"
									text="Cancel"
									onclick={() => (showAddVitalForm = false)}
								/>
								<Button
									type="button"
									variant="primary"
									size="md"
									text="Add Vital"
									onclick={handleAddVital}
								/>
							</div>
						</div>
					{/if}
				{/if}

				<!-- Vitals List -->
				{#if Object.keys(vitalsThresholds).length > 0}
					{#each Object.entries(vitalsThresholds) as [vitalType, config]}
						{#if config}
							<div class="rounded-lg border border-[var(--color-outline)]">
								<!-- Vital Header -->
								<div
									class="flex cursor-pointer items-center justify-between bg-[var(--color-surface)] px-4 py-3"
									role="button"
									tabindex="0"
									onclick={() => toggleVitalExpanded(vitalType)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') toggleVitalExpanded(vitalType);
									}}
								>
									<div class="flex items-center gap-3">
										<Icon
											icon={expandedVitals[vitalType]
												? 'material-symbols:expand-more'
												: 'material-symbols:chevron-right'}
											class="h-5 w-5"
										/>
										<span class="text-lg font-semibold text-[var(--color-info)]">
											{VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}
										</span>
										<span
											class="rounded-full px-2 py-0.5 text-xs {config.Enabled
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-600'}"
										>
											{config.Enabled ? 'Enabled' : 'Disabled'}
										</span>
										<span class="text-sm text-gray-500">
											({config.Unit || 'No unit'}) &middot; {config.Categories?.length ?? 0} categories
										</span>
									</div>
									{#if isEditing}
										<button
											type="button"
											class="text-red-600 hover:text-red-800"
											onclick={(e) => {
												e.stopPropagation();
												handleDeleteVital(vitalType as VitalType);
											}}
											title="Delete vital"
										>
											<Icon icon="material-symbols:delete-outline" class="h-5 w-5" />
										</button>
									{/if}
								</div>

								<!-- Vital Body (Expanded) -->
								{#if expandedVitals[vitalType]}
									<div class="space-y-4 border-t border-[var(--color-outline)] px-4 py-4">
										<!-- Enabled & Unit -->
										<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div class="flex items-center gap-3">
												<label
													for="{vitalType}-enabled"
													class="text font-medium text-[var(--color-info)]"
												>
													Enabled
												</label>
												<input
													id="{vitalType}-enabled"
													type="checkbox"
													class="checkbox checkbox-primary"
													bind:checked={config.Enabled}
													disabled={!isEditing}
												/>
											</div>
											<div class="flex items-center gap-3">
												<label
													for="{vitalType}-unit"
													class="text font-medium text-[var(--color-info)]"
												>
													Unit <span class="text-red-700">*</span>
												</label>
												<input
													id="{vitalType}-unit"
													type="text"
													class="input-field flex-1"
													placeholder="e.g. bpm, mmHg, mg/dL"
													bind:value={config.Unit}
													disabled={!isEditing}
												/>
											</div>
										</div>

										<!-- Categories Section -->
										<div class="space-y-3">
											<div class="flex items-center justify-between">
												<h3 class="text-base font-semibold text-[var(--color-info)]">
													Threshold Categories
												</h3>
												{#if isEditing}
													<Button
														type="button"
														variant="secondary"
														size="sm"
														text="+ Add Category"
														onclick={() =>
															handleAddCategory(vitalType as VitalType)}
													/>
												{/if}
											</div>

											{#each (config.Categories ?? []) as category, catIndex}
												{@const catKey = `${vitalType}-${catIndex}`}
												<div
													class="rounded border border-[var(--color-outline)] bg-white"
												>
													<!-- Category Header -->
													<div
														class="flex cursor-pointer items-center justify-between px-3 py-2"
														role="button"
														tabindex="0"
														onclick={() => toggleCategoryExpanded(catKey)}
														onkeydown={(e) => {
															if (e.key === 'Enter' || e.key === ' ')
																toggleCategoryExpanded(catKey);
														}}
													>
														<div class="flex items-center gap-2">
															<Icon
																icon={expandedCategories[catKey]
																	? 'material-symbols:expand-more'
																	: 'material-symbols:chevron-right'}
																class="h-4 w-4"
															/>
															<span class="font-medium text-[var(--color-info)]">
																{category.Category || `Category ${catIndex + 1}`}
															</span>
															<span class="text-xs text-gray-500">
																(Priority: {category.Priority}, Severity: {category.Severity})
															</span>
														</div>
														<div class="flex items-center gap-2">
															{#if category.SendAlert}
																<span
																	class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
																>
																	Alert
																</span>
															{/if}
															{#if isEditing}
																<button
																	type="button"
																	class="text-red-600 hover:text-red-800"
																	onclick={(e) => {
																		e.stopPropagation();
																		handleDeleteCategory(
																			vitalType as VitalType,
																			catIndex
																		);
																	}}
																	title="Delete category"
																>
																	<Icon
																		icon="material-symbols:delete-outline"
																		class="h-4 w-4"
																	/>
																</button>
															{/if}
														</div>
													</div>

													<!-- Category Body (Expanded) -->
													{#if expandedCategories[catKey]}
														<div
															class="space-y-4 border-t border-[var(--color-outline)] px-4 py-3"
														>
															<!-- Category Name & Severity -->
															<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
																<div class="flex flex-col gap-1">
																	<label
																		for="{catKey}-name"
																		class="text text-sm font-medium text-[var(--color-info)]"
																	>
																		Category Name <span class="text-red-700"
																			>*</span
																		>
																	</label>
																	<input
																		id="{catKey}-name"
																		type="text"
																		class="input-field"
																		placeholder="e.g. Normal Pulse"
																		bind:value={category.Category}
																		disabled={!isEditing}
																	/>
																</div>
																<div class="flex flex-col gap-1">
																	<label
																		for="{catKey}-severity"
																		class="text text-sm font-medium text-[var(--color-info)]"
																	>
																		Severity <span class="text-red-700">*</span>
																	</label>
																	<select
																		id="{catKey}-severity"
																		class="select"
																		bind:value={category.Severity}
																		disabled={!isEditing}
																	>
																		{#each SEVERITY_OPTIONS as sev}
																			<option value={sev}>{sev}</option>
																		{/each}
																	</select>
																</div>
															</div>

															<!-- Priority & SendAlert -->
															<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
																<div class="flex flex-col gap-1">
																	<label
																		for="{catKey}-priority"
																		class="text text-sm font-medium text-[var(--color-info)]"
																	>
																		Priority <span class="text-red-700">*</span>
																	</label>
																	<input
																		id="{catKey}-priority"
																		type="number"
																		class="input-field"
																		min="1"
																		bind:value={category.Priority}
																		disabled={!isEditing}
																	/>
																</div>
																<div class="flex items-center gap-3 pt-5">
																	<label
																		for="{catKey}-sendAlert"
																		class="text text-sm font-medium text-[var(--color-info)]"
																	>
																		Send Alert
																	</label>
																	<input
																		id="{catKey}-sendAlert"
																		type="checkbox"
																		class="checkbox checkbox-primary"
																		bind:checked={category.SendAlert}
																		disabled={!isEditing}
																	/>
																</div>
															</div>

															<!-- Ranges -->
															<div class="space-y-2">
																<div class="flex items-center justify-between">
																	<span
																		class="text text-sm font-semibold text-[var(--color-info)]"
																	>
																		Ranges <span class="text-red-700">*</span>
																	</span>
																	{#if isEditing}
																		<button
																			type="button"
																			class="text-sm text-blue-600 hover:underline"
																			onclick={() =>
																				handleAddRange(
																					vitalType as VitalType,
																					catIndex
																				)}
																		>
																			+ Add Range
																		</button>
																	{/if}
																</div>
																{#each Object.entries(category.Ranges) as [rangeName, range]}
																	<div
																		class="flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2"
																	>
																		<div class="flex flex-col gap-1">
																			<label class="text-xs text-gray-500">
																				Name
																			</label>
																			<input
																				type="text"
																				class="input-field w-32"
																				value={rangeName}
																				disabled={!isEditing}
																				onchange={(e) =>
																					handleRenameRange(
																						vitalType as VitalType,
																						catIndex,
																						rangeName,
																						(e.target as HTMLInputElement).value
																					)}
																			/>
																		</div>
																		<div class="flex flex-col gap-1">
																			<label class="text-xs text-gray-500">
																				Min
																			</label>
																			<input
																				type="text"
																				class="input-field w-24"
																				value={range.Min === null || range.Min === undefined
																					? ''
																					: range.Min}
																				placeholder="null"
																				disabled={!isEditing}
																				onchange={(e) => {
																					range.Min = parseNullableNumber(
																						(e.target as HTMLInputElement).value
																					);
																					vitalsThresholds = {
																						...vitalsThresholds
																					};
																				}}
																			/>
																		</div>
																		<div class="flex flex-col gap-1">
																			<label class="text-xs text-gray-500">
																				Max
																			</label>
																			<input
																				type="text"
																				class="input-field w-24"
																				value={range.Max === null || range.Max === undefined
																					? ''
																					: range.Max}
																				placeholder="null"
																				disabled={!isEditing}
																				onchange={(e) => {
																					range.Max = parseNullableNumber(
																						(e.target as HTMLInputElement).value
																					);
																					vitalsThresholds = {
																						...vitalsThresholds
																					};
																				}}
																			/>
																		</div>
																		{#if isEditing}
																			<button
																				type="button"
																				class="mt-4 text-red-600 hover:text-red-800"
																				onclick={() =>
																					handleDeleteRange(
																						vitalType as VitalType,
																						catIndex,
																						rangeName
																					)}
																				title="Delete range"
																			>
																				<Icon
																					icon="material-symbols:close-rounded"
																					class="h-4 w-4"
																				/>
																			</button>
																		{/if}
																	</div>
																{/each}
																{#if Object.keys(category.Ranges).length === 0}
																	<p class="text-sm italic text-gray-400">
																		No ranges defined. Click "+ Add Range" to add
																		one.
																	</p>
																{/if}
															</div>

															<!-- Alert Messages -->
															<div class="space-y-2">
																<div class="flex items-center justify-between">
																	<span
																		class="text text-sm font-semibold text-[var(--color-info)]"
																	>
																		Alert Messages <span class="text-red-700"
																			>*</span
																		>
																	</span>
																	{#if isEditing}
																		<button
																			type="button"
																			class="text-sm text-blue-600 hover:underline"
																			onclick={() =>
																				handleAddAlertLanguage(
																					vitalType as VitalType,
																					catIndex
																				)}
																		>
																			+ Add Language
																		</button>
																	{/if}
																</div>
																{#each Object.entries(category.AlertMessage) as [langCode, message]}
																	<div
																		class="flex flex-col gap-1 rounded border border-gray-200 bg-gray-50 p-2"
																	>
																		<div class="flex items-center gap-2">
																			<label class="text-xs text-gray-500">
																				Language Code
																			</label>
																			<input
																				type="text"
																				class="input-field w-24"
																				value={langCode}
																				placeholder="e.g. en-US"
																				disabled={!isEditing}
																				onchange={(e) =>
																					handleRenameAlertLanguage(
																						vitalType as VitalType,
																						catIndex,
																						langCode,
																						(e.target as HTMLInputElement).value
																					)}
																			/>
																			{#if isEditing}
																				<button
																					type="button"
																					class="text-red-600 hover:text-red-800"
																					onclick={() =>
																						handleDeleteAlertLanguage(
																							vitalType as VitalType,
																							catIndex,
																							langCode
																						)}
																					title="Delete language"
																				>
																					<Icon
																						icon="material-symbols:close-rounded"
																						class="h-4 w-4"
																					/>
																				</button>
																			{/if}
																		</div>
																		<textarea
																			class="input-field text-sm"
																			rows="2"
																			value={message}
																			placeholder="Alert message for this language..."
																			disabled={!isEditing}
																			onchange={(e) => {
																				category.AlertMessage[langCode] = (
																					e.target as HTMLTextAreaElement
																				).value;
																				vitalsThresholds = {
																					...vitalsThresholds
																				};
																			}}
																		></textarea>
																	</div>
																{/each}
																{#if Object.keys(category.AlertMessage).length === 0}
																	<p class="text-sm italic text-gray-400">
																		No alert messages. Click "+ Add Language" to add
																		one.
																	</p>
																{/if}
															</div>
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				{:else}
					<div class="py-8 text-center text-[var(--color-info)]">
						<Icon
							icon="mdi:heart-pulse"
							class="mx-auto mb-4 h-12 w-12 opacity-50"
						/>
						<p>No vitals thresholds configured yet.</p>
						{#if isEditing}
							<p class="text-sm opacity-75">
								Click "+ Add Vital" above to start configuring vitals thresholds.
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<hr class="border-t border-[0.5px] border-[var(--color-outline)]" />
			<div class="button-container my-4">
				{#await promise}
					<Button type="submit" variant="primary" size="md" text="Submitting..." disabled />
				{:then data}
					<Button
						type="submit"
						variant="primary"
						size="md"
						text="Submit"
						disabled={!isEditing}
					/>
				{/await}
			</div>
		</form>
	</div>
</div>
