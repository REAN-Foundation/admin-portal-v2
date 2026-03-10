<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
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
		SEVERITY_OPTIONS,
		VITAL_PREDEFINED_RANGES,
		VITAL_UNITS,
		SUPPORTED_LANGUAGE_CODES
	} from '$lib/types/tenant.settings.types';
	import Button from '$lib/components/button/button.svelte';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;
	console.log('vitalsThresholds',data.vitalsThresholds)
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

	let isEditing = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');
	let expandedVitals: Record<string, boolean> = $state({});
	let expandedCategories: Record<string, boolean> = $state({});

	let hasUnsavedChanges = $derived(
		isEditing && JSON.stringify($state.snapshot(vitalsThresholds)) !== originalSnapshot
	);

	// Inline validation errors: keyed by field identifier
	let fieldErrors: Record<string, string> = $state({});

	// New vital form state
	let showAddVitalForm = $state(false);
	let newVitalType = $state<VitalType>('Pulse');

	const availableVitalTypes = $derived(
		VITAL_TYPES.filter((vt) => !vitalsThresholds[vt])
	);

	beforeNavigate(({ cancel }) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				cancel();
			}
		}
	});

	///////////////////////////////////////////////////////////////////////////
	// Validation helpers
	///////////////////////////////////////////////////////////////////////////

	const NUMERIC_PATTERN = /^\d+(\.\d{1,2})?$/;

	const validateNumericField = (fieldKey: string, value: string): boolean => {
		if (value === '' || value === 'null') {
			delete fieldErrors[fieldKey];
			fieldErrors = { ...fieldErrors };
			return true;
		}
		if (!NUMERIC_PATTERN.test(value)) {
			fieldErrors = { ...fieldErrors, [fieldKey]: 'Must be a non-negative number (up to 2 decimals).' };
			return false;
		}
		const digitCount = value.replace(/[^0-9]/g, '').length;
		if (digitCount > 5) {
			fieldErrors = { ...fieldErrors, [fieldKey]: 'Value must not exceed 5 digits.' };
			return false;
		}
		delete fieldErrors[fieldKey];
		fieldErrors = { ...fieldErrors };
		return true;
	};

	const validateDuplicatePriorities = (vitalType: string, categories: ThresholdCategory[]): void => {
		const seen = new Map<number, number[]>();
		categories.forEach((cat, i) => {
			const existing = seen.get(cat.Priority) || [];
			existing.push(i);
			seen.set(cat.Priority, existing);
		});

		categories.forEach((_, i) => {
			const key = `${vitalType}-${i}-priority-dup`;
			delete fieldErrors[key];
		});

		for (const [, indices] of seen) {
			if (indices.length > 1) {
				for (const i of indices) {
					const key = `${vitalType}-${i}-priority-dup`;
					fieldErrors[key] = 'Priority must be unique within this vital category.';
				}
			}
		}
		fieldErrors = { ...fieldErrors };
	};

	const validateDuplicateCategoryNames = (vitalType: string, categories: ThresholdCategory[]): void => {
		const seen = new Map<string, number[]>();
		categories.forEach((cat, i) => {
			const normalized = cat.Category.trim().toLowerCase();
			if (!normalized) return;
			const existing = seen.get(normalized) || [];
			existing.push(i);
			seen.set(normalized, existing);
		});

		categories.forEach((_, i) => {
			const key = `${vitalType}-${i}-catname-dup`;
			delete fieldErrors[key];
		});

		for (const [, indices] of seen) {
			if (indices.length > 1) {
				for (const i of indices) {
					const key = `${vitalType}-${i}-catname-dup`;
					fieldErrors[key] = 'Category name must be unique.';
				}
			}
		}
		fieldErrors = { ...fieldErrors };
	};

	const validateMinMax = (
		vitalType: string,
		catIndex: number,
		rangeName: string,
		min: number | null | undefined,
		max: number | null | undefined
	): void => {
		const key = `${vitalType}-${catIndex}-${rangeName}-minmax`;
		if (min != null && max != null && min > max) {
			fieldErrors = { ...fieldErrors, [key]: 'Min must be less than or equal to Max.' };
		} else {
			delete fieldErrors[key];
			fieldErrors = { ...fieldErrors };
		}
	};

	const validateAlertMessage = (
		vitalType: string,
		catIndex: number,
		langCode: string,
		message: string
	): boolean => {
		const key = `${vitalType}-${catIndex}-alert-${langCode}`;
		if (!message || message.trim().length === 0) {
			fieldErrors = { ...fieldErrors, [key]: 'Alert message is required when a language is selected.' };
			return false;
		}
		delete fieldErrors[key];
		fieldErrors = { ...fieldErrors };
		return true;
	};

	const clearAlertMessageError = (vitalType: string, catIndex: number, langCode: string): void => {
		const key = `${vitalType}-${catIndex}-alert-${langCode}`;
		delete fieldErrors[key];
		fieldErrors = { ...fieldErrors };
	};

	const blockInvalidKeys = (e: KeyboardEvent) => {
		if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
			return;
		}
		if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
			return;
		}
		if (e.key === '.') {
			return;
		}
		if (!/^\d$/.test(e.key)) {
			e.preventDefault();
		}
	};

	// Derived: check if there are any validation errors
	const hasValidationErrors = $derived(Object.keys(fieldErrors).length > 0);

	///////////////////////////////////////////////////////////////////////////
	// Handlers
	///////////////////////////////////////////////////////////////////////////

	const handleToggleEdit = () => {
		isEditing = true;
		originalSnapshot = JSON.stringify($state.snapshot(vitalsThresholds));
		addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
	};

	const handleCancelEdit = () => {
		isEditing = false;
		showAddVitalForm = false;
		fieldErrors = {};
		// Reset to original data
		vitalsThresholds = normalizeThresholds(data.vitalsThresholds);
		addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
	};

	const toggleVitalExpanded = (vitalType: string) => {
		expandedVitals[vitalType] = !expandedVitals[vitalType];
	};

	const toggleCategoryExpanded = (key: string) => {
		expandedCategories[key] = !expandedCategories[key];
	};

	const buildPredefinedRanges = (vitalType: VitalType): Record<string, RangeDefinition> => {
		const names = VITAL_PREDEFINED_RANGES[vitalType] || ['Value'];
		const ranges: Record<string, RangeDefinition> = {};
		for (const name of names) {
			ranges[name] = { Min: null, Max: null };
		}
		return ranges;
	};

	const handleAddVital = () => {
		if (!newVitalType || vitalsThresholds[newVitalType]) {
			addToast({ message: 'Vital type already exists or is invalid.', type: 'error', timeout: 3000 });
			return;
		}

		const newConfig: VitalThresholdConfig = {
			Enabled: false,
			Unit: VITAL_UNITS[newVitalType]?.[0] ?? '',
			Categories: [
				{
					Category: '',
					Severity: 'Normal',
					Ranges: buildPredefinedRanges(newVitalType),
					AlertMessage: { 'en': '' },
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
		// Clear related validation errors
		const keysToRemove = Object.keys(fieldErrors).filter(k => k.startsWith(vitalType));
		for (const k of keysToRemove) delete fieldErrors[k];
		fieldErrors = { ...fieldErrors };
		addToast({ message: `${VITAL_DISPLAY_NAMES[vitalType]} removed.`, type: 'success', timeout: 3000 });
	};

	const handleAddCategory = (vitalType: VitalType) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;

		const maxPriority = config.Categories.reduce((max, c) => Math.max(max, c.Priority), 0);
		const newCategory: ThresholdCategory = {
			Category: '',
			Severity: 'Normal',
			Ranges: buildPredefinedRanges(vitalType),
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
		// Re-validate priorities and category names after deletion
		validateDuplicatePriorities(vitalType, config.Categories);
		validateDuplicateCategoryNames(vitalType, config.Categories);
	};

	const handleDeleteAlertLanguage = (vitalType: VitalType, catIndex: number, langCode: string) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		const updated = { ...category.AlertMessage };
		delete updated[langCode];
		category.AlertMessage = updated;
		clearAlertMessageError(vitalType, catIndex, langCode);
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleChangeAlertLanguage = (
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
		// Transfer validation error from old language key to new language key
		clearAlertMessageError(vitalType, catIndex, oldLang);
		vitalsThresholds = { ...vitalsThresholds };
	};

	const handleAddAlertLanguage = (vitalType: VitalType, catIndex: number) => {
		const config = vitalsThresholds[vitalType];
		if (!config) return;
		const category = config.Categories[catIndex];
		const existingLangs = Object.keys(category.AlertMessage);
		// Find first language code not already used
		const available = SUPPORTED_LANGUAGE_CODES.find(lc => !existingLangs.includes(lc.code));
		if (!available) {
			addToast({ message: 'All supported language codes are already added.', type: 'info', timeout: 3000 });
			return;
		}
		category.AlertMessage = { ...category.AlertMessage, [available.code]: '' };
		vitalsThresholds = { ...vitalsThresholds };
	};

	const parseNullableNumber = (value: string): number | null => {
		if (value === '' || value === 'null') return null;
		const num = parseFloat(value);
		return isNaN(num) ? null : num;
	};

	const handleCategoryNameChange = (vitalType: string, config: VitalThresholdConfig) => {
		validateDuplicateCategoryNames(vitalType, config.Categories);
	};

	const handlePriorityChange = (vitalType: string, config: VitalThresholdConfig) => {
		validateDuplicatePriorities(vitalType, config.Categories);
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		isSubmitting = true;

		if (!isEditing) {
			addToast({ message: 'Nothing to edit!', type: 'info', timeout: 3000 });
			isSubmitting = false;
			return;
		}

		try {
			// Run all validations
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

				validateDuplicatePriorities(vitalType, config.Categories);
				validateDuplicateCategoryNames(vitalType, config.Categories);

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

					// Validate alert message text is not empty when language is selected
					for (const [langCode, message] of Object.entries(cat.AlertMessage)) {
						if (!validateAlertMessage(vitalType, i, langCode, message)) {
							addToast({
								message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: Alert message is required for language "${langCode}" in "${cat.Category}".`,
								type: 'error',
								timeout: 3000
							});
							return;
						}
					}

					// Validate numeric range values
					for (const [rangeName, range] of Object.entries(cat.Ranges)) {
						const minKey = `${vitalType}-${i}-${rangeName}-min`;
						const maxKey = `${vitalType}-${i}-${rangeName}-max`;
						const minVal = range.Min === null || range.Min === undefined ? '' : String(range.Min);
						const maxVal = range.Max === null || range.Max === undefined ? '' : String(range.Max);
						if (!validateNumericField(minKey, minVal) || !validateNumericField(maxKey, maxVal)) {
							addToast({
								message: `${VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}: Invalid numeric value in range "${rangeName}" for "${cat.Category}".`,
								type: 'error',
								timeout: 3000
							});
							return;
						}
						validateMinMax(vitalType, i, rangeName, range.Min, range.Max);
					}
				}
			}

			// Check if any validation errors remain
			if (hasValidationErrors) {
				addToast({
					message: 'Please fix all validation errors before submitting.',
					type: 'error',
					timeout: 3000
				});
				return;
			}

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
				fieldErrors = {};
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
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={handleSubmit}>
			<!-- Header -->
			<SettingsPageHeader
				title="Vital Alert Settings"
				description="Configure vital sign thresholds and alert rules."
				bind:isEditing
				{hasUnsavedChanges}
				closeHref={settingsRoute}
				onToggleEdit={handleToggleEdit}
				onCancelEdit={handleCancelEdit}
			/>

			<div class="flex flex-col space-y-3 px-5 py-4">
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
								<!-- Vital Header (Accordion) -->
								<div
									class="flex cursor-pointer items-center justify-between rounded-t-lg bg-[var(--color-secondary)] px-4 py-2.5"
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
											class="h-5 w-5 text-[var(--color-info)]"
										/>
										<span class="text-lg font-semibold text-[var(--color-info)]">
											{VITAL_DISPLAY_NAMES[vitalType as VitalType] ?? vitalType}
										</span>
										<span
											class="rounded-full border border-[var(--color-outline)] bg-[var(--color-accent)] px-2 py-0.5 text-xs text-[var(--color-info)]"
										>
											{config.Enabled ? 'Enabled' : 'Disabled'}
										</span>
										<span class="text-sm text-[var(--color-info)] opacity-70">
											({config.Unit || 'No unit'}) · {config.Categories?.length ?? 0} categories
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
									<div class="space-y-3 border-t border-[var(--color-outline)] px-4 py-3">
										<!-- Enabled & Unit -->
										<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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
												<select
													id="{vitalType}-unit"
													class="select flex-1"
													bind:value={config.Unit}
													disabled={!isEditing}
												>
													<option value="" disabled>Select unit</option>
													{#each (VITAL_UNITS[vitalType as VitalType] ?? []) as unit}
														<option value={unit}>{unit}</option>
													{/each}
													{#if config.Unit && !(VITAL_UNITS[vitalType as VitalType] ?? []).includes(config.Unit)}
														<option value={config.Unit}>{config.Unit}</option>
													{/if}
												</select>
											</div>
										</div>

										<!-- Categories Section -->
										<div class="space-y-2">
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
													class="rounded border border-[var(--color-outline)] bg-[var(--color-accent)]"
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
																class="h-4 w-4 text-[var(--color-info)]"
															/>
															<span class="font-medium text-[var(--color-info)]">
																{category.Category || `Category ${catIndex + 1}`}
															</span>
															<span class="text-xs text-[var(--color-info)] opacity-60">
																(Priority: {category.Priority}, Severity: {category.Severity})
															</span>
														</div>
														<div class="flex items-center gap-2">
															{#if category.SendAlert}
																<span
																	class="rounded-full border border-[var(--color-outline)] bg-[var(--color-accent)] px-2 py-0.5 text-xs text-[var(--color-info)]"
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
															class="space-y-3 border-t border-[var(--color-outline)] px-4 py-3"
														>
															<!-- Category Name & Severity - Grid -->
															<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
																<div class="flex flex-col gap-1">
																	<label
																		for="{catKey}-name"
																		class="text text-sm font-medium text-[var(--color-info)]"
																	>
																		Category Name <span class="text-red-700">*</span>
																	</label>
																	<input
																		id="{catKey}-name"
																		type="text"
																		class="input-field"
																		class:border-red-500={fieldErrors[`${vitalType}-${catIndex}-catname-dup`]}
																		placeholder="e.g. Normal Pulse"
																		bind:value={category.Category}
																		disabled={!isEditing}
																		onblur={() => handleCategoryNameChange(vitalType, config)}
																	/>
																	{#if fieldErrors[`${vitalType}-${catIndex}-catname-dup`]}
																		<p class="text-xs text-red-500">{fieldErrors[`${vitalType}-${catIndex}-catname-dup`]}</p>
																	{/if}
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

															<!-- Priority & SendAlert - Grid -->
															<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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
																		class:border-red-500={fieldErrors[`${vitalType}-${catIndex}-priority-dup`]}
																		min="1"
																		bind:value={category.Priority}
																		disabled={!isEditing}
																		onblur={() => handlePriorityChange(vitalType, config)}
																	/>
																	{#if fieldErrors[`${vitalType}-${catIndex}-priority-dup`]}
																		<p class="text-xs text-red-500">{fieldErrors[`${vitalType}-${catIndex}-priority-dup`]}</p>
																	{/if}
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

															<!-- Ranges (predefined, non-editable names) -->
															<div class="space-y-2">
																<span
																	class="text text-sm font-semibold text-[var(--color-info)]"
																>
																	Ranges <span class="text-red-700">*</span>
																</span>
																{#each Object.entries(category.Ranges) as [rangeName, range]}
																	{@const minKey = `${vitalType}-${catIndex}-${rangeName}-min`}
																	{@const maxKey = `${vitalType}-${catIndex}-${rangeName}-max`}
																	<div
																		class="flex flex-wrap items-start gap-3 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
																	>
																		<div class="flex flex-col gap-1">
																			<!-- svelte-ignore a11y_label_has_associated_control -->
																			<label class="text-xs text-[var(--color-info)] opacity-70">
																				Name
																			</label>
																			<input
																				type="text"
																				class="input-field w-32 bg-[var(--color-accent)]"
																				value={rangeName}
																				disabled
																				readonly
																			/>
																		</div>
																		<div class="flex flex-col gap-1">
																			<!-- svelte-ignore a11y_label_has_associated_control -->
																			<label class="text-xs text-[var(--color-info)] opacity-70">
																				Min
																			</label>
																			<input
																				type="text"
																				inputmode="numeric"
																				maxlength="5"
																				class="input-field w-24"
																				class:border-red-500={fieldErrors[minKey] || fieldErrors[`${vitalType}-${catIndex}-${rangeName}-minmax`]}
																				value={range.Min === null || range.Min === undefined
																					? ''
																					: range.Min}
																				placeholder="null"
																				disabled={!isEditing}
																				onkeydown={blockInvalidKeys}
																				oninput={(e) => {
																					const val = (e.target as HTMLInputElement).value;
																					validateNumericField(minKey, val);
																				}}
																				onblur={(e) => {
																					const val = (e.target as HTMLInputElement).value;
																					if (validateNumericField(minKey, val)) {
																						range.Min = parseNullableNumber(val);
																						vitalsThresholds = { ...vitalsThresholds };
																						validateMinMax(vitalType, catIndex, rangeName, range.Min, range.Max);
																					}
																				}}
																			/>
																			{#if fieldErrors[minKey]}
																				<p class="max-w-24 text-xs text-red-500">{fieldErrors[minKey]}</p>
																			{/if}
																			{#if fieldErrors[`${vitalType}-${catIndex}-${rangeName}-minmax`]}
																				<p class="max-w-24 text-xs text-red-500">{fieldErrors[`${vitalType}-${catIndex}-${rangeName}-minmax`]}</p>
																			{/if}
																		</div>
																		<div class="flex flex-col gap-1">
																			<!-- svelte-ignore a11y_label_has_associated_control -->
																			<label class="text-xs text-[var(--color-info)] opacity-70">
																				Max
																			</label>
																			<input
																				type="text"
																				inputmode="numeric"
																				maxlength="5"
																				class="input-field w-24"
																				class:border-red-500={fieldErrors[maxKey] || fieldErrors[`${vitalType}-${catIndex}-${rangeName}-minmax`]}
																				value={range.Max === null || range.Max === undefined
																					? ''
																					: range.Max}
																				placeholder="null"
																				disabled={!isEditing}
																				onkeydown={blockInvalidKeys}
																				oninput={(e) => {
																					const val = (e.target as HTMLInputElement).value;
																					validateNumericField(maxKey, val);
																				}}
																				onblur={(e) => {
																					const val = (e.target as HTMLInputElement).value;
																					if (validateNumericField(maxKey, val)) {
																						range.Max = parseNullableNumber(val);
																						vitalsThresholds = { ...vitalsThresholds };
																						validateMinMax(vitalType, catIndex, rangeName, range.Min, range.Max);
																					}
																				}}
																			/>
																			{#if fieldErrors[maxKey]}
																				<p class="max-w-24 text-xs text-red-500">{fieldErrors[maxKey]}</p>
																			{/if}
																		</div>
																	</div>
																{/each}
																{#if Object.keys(category.Ranges).length === 0}
																	<p class="text-sm italic text-[var(--color-info)] opacity-50">
																		No ranges defined.
																	</p>
																{/if}
															</div>

															<!-- Alert Messages -->
															<div class="space-y-2">
																<div class="flex items-center justify-between">
																	<span
																		class="text text-sm font-semibold text-[var(--color-info)]"
																	>
																		Alert Messages <span class="text-red-700">*</span>
																	</span>
																	{#if isEditing}
																		<button
																			type="button"
																			class="text-sm text-[var(--color-info)] hover:underline"
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
																	{@const alertKey = `${vitalType}-${catIndex}-alert-${langCode}`}
																	<div
																		class="flex flex-col gap-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
																	>
																		<div class="flex items-center gap-2">
																			<label class="text-xs text-[var(--color-info)] opacity-70">
																				Language
																			</label>
																			<select
																				class="select w-28"
																				value={langCode}
																				disabled={!isEditing}
																				onchange={(e) =>
																					handleChangeAlertLanguage(
																						vitalType as VitalType,
																						catIndex,
																						langCode,
																						(e.target as HTMLSelectElement).value
																					)}
																			>
																				{#each SUPPORTED_LANGUAGE_CODES as lc}
																					<option value={lc.code}>{lc.label}</option>
																				{/each}
																				<!-- Keep existing value visible if not in supported list -->
																				{#if !SUPPORTED_LANGUAGE_CODES.some(lc => lc.code === langCode)}
																					<option value={langCode}>{langCode}</option>
																				{/if}
																			</select>
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
																			class:border-red-500={fieldErrors[alertKey]}
																			rows="2"
																			value={message}
																			placeholder="Alert message for this language..."
																			disabled={!isEditing}
																			onchange={(e) => {
																				const val = (e.target as HTMLTextAreaElement).value;
																				category.AlertMessage[langCode] = val;
																				vitalsThresholds = {
																					...vitalsThresholds
																				};
																				validateAlertMessage(vitalType, catIndex, langCode, val);
																			}}
																			onblur={(e) => {
																				const val = (e.target as HTMLTextAreaElement).value;
																				validateAlertMessage(vitalType, catIndex, langCode, val);
																			}}
																		></textarea>
																		{#if fieldErrors[alertKey]}
																			<p class="text-xs text-red-500">{fieldErrors[alertKey]}</p>
																		{/if}
																	</div>
																{/each}
																{#if Object.keys(category.AlertMessage).length === 0}
																	<p class="text-sm italic text-[var(--color-info)] opacity-50">
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
			<div class="flex items-center justify-end gap-3 px-5 py-4">
				{#if isEditing}
					<Button type="button" variant="outline" size="md" text="Cancel" onclick={handleCancelEdit} />
				{/if}
				{#if isSubmitting}
					<Button type="submit" variant="primary" size="md" text="Saving..." disabled />
				{:else}
					<Button type="submit" variant="primary" size="md" text="Save Changes" disabled={!isEditing || hasValidationErrors} />
				{/if}
			</div>
		</form>
	</div>
</div>
