<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { CustomSettings, CustomSetting } from '$lib/types/tenant.settings.types.js';
	import { CustomSettingDataType } from '$lib/types/tenant.settings.types.js';
	import Button from '$lib/components/button/button.svelte';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';
	import SettingsSection from '$lib/components/settings/settings-section.svelte';
	import SettingsFooter from '$lib/components/settings/settings-footer.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;
	let customSettings: CustomSettings = $state(data.customSettings || {});
	let isEditing = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let newSettingKey = $state('');
	let newSettingName = $state('');
	let newSettingDescription = $state('');
	let newSettingDataType = $state<CustomSettingDataType>(CustomSettingDataType.String);
	let newSettingValue = $state('');
	let showAddForm = $state(false);
	// Store stringified versions of array/object values for editing
	let editValues: Record<string, string> = $state({});

	let hasUnsavedChanges = $derived(isEditing && JSON.stringify(customSettings) !== originalSnapshot);

	beforeNavigate((navigation) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
				navigation.cancel();
			}
		}
	});

	const dataTypeOptions = [
		{ value: CustomSettingDataType.String, label: 'String' },
		{ value: CustomSettingDataType.Number, label: 'Number' },
		{ value: CustomSettingDataType.Boolean, label: 'Boolean' },
		{ value: CustomSettingDataType.Object, label: 'Object' },
		{ value: CustomSettingDataType.Array, label: 'Array' }
	];

	const getEditValue = (key: string, setting: CustomSetting): string => {
		if (setting.DataType === CustomSettingDataType.Array || setting.DataType === CustomSettingDataType.Object) {
			if (!editValues[key]) {
				editValues[key] = JSON.stringify(setting.Value ?? null, null, 2);
			}
			return editValues[key];
		}
		return '';
	};

	const handleToggleEdit = () => {
		isEditing = true;
		originalSnapshot = JSON.stringify($state.snapshot(customSettings));
		editValues = {};
		Object.keys(customSettings).forEach(key => {
			const setting = customSettings[key];
			if (setting.DataType === CustomSettingDataType.Array || setting.DataType === CustomSettingDataType.Object) {
				editValues[key] = JSON.stringify(setting.Value ?? null, null, 2);
			}
		});
		addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
	};

	const handleCancelEdit = () => {
		customSettings = JSON.parse(originalSnapshot);
		isEditing = false;
		showAddForm = false;
		resetNewSettingForm();
		editValues = {};
		addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
	};

	const resetNewSettingForm = () => {
		newSettingKey = '';
		newSettingName = '';
		newSettingDescription = '';
		newSettingDataType = CustomSettingDataType.String;
		newSettingValue = '';
	};

	const parseAndValidateValue = (
		value: string,
		dataType: CustomSettingDataType,
		settingKey?: string
	): any => {
		try {
			switch (dataType) {
				case CustomSettingDataType.Number:
					const numberValue = parseFloat(value);
					if (isNaN(numberValue)) {
						const errorMessage = settingKey
							? `${settingKey}: Invalid number format`
							: 'Invalid number format';
						addToast({
							message: errorMessage,
							type: 'error',
							timeout: 3000
						});
						throw new Error('Invalid number format');
					}
					return numberValue;

				case CustomSettingDataType.Boolean:
					return value.toLowerCase() === 'true';

				case CustomSettingDataType.Object:
					const objectValue = JSON.parse(value);
					if (Array.isArray(objectValue)) {
						const errorMessage = settingKey
							? `${settingKey}: Object type expects a JSON object, not an array`
							: 'Object type expects a JSON object, not an array';
						addToast({
							message: errorMessage,
							type: 'error',
							timeout: 3000
						});
						throw new Error('Invalid object format');
					}
					return objectValue;

				case CustomSettingDataType.Array:
					const arrayValue = JSON.parse(value);
					if (!Array.isArray(arrayValue)) {
						const errorMessage = settingKey
							? `${settingKey}: Array type expects a JSON array, not an object`
							: 'Array type expects a JSON array, not an object';
						addToast({
							message: errorMessage,
							type: 'error',
							timeout: 3000
						});
						throw new Error('Invalid array format');
					}
					return arrayValue;

				default:
					return value;
			}
		} catch (error) {
			if (error instanceof SyntaxError) {
				const errorMessage = settingKey
					? `Invalid JSON format for ${settingKey}. Please fix before saving.`
					: 'Invalid JSON format for object/array';
				addToast({
					message: errorMessage,
					type: 'error',
					timeout: 3000
				});
			}
			throw error;
		}
	};

	const handleAddSetting = () => {
		if (!newSettingKey || !newSettingName) {
			addToast({
				message: 'Please fill in all required fields',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		if (customSettings[newSettingKey]) {
			addToast({
				message: 'Setting key already exists',
				type: 'error',
				timeout: 3000
			});
			return;
		}

		let parsedValue: any;
		try {
			parsedValue = parseAndValidateValue(newSettingValue, newSettingDataType);
		} catch (error) {
			return;
		}

		const newSetting: CustomSetting = {
			Name: newSettingName,
			Description: newSettingDescription,
			DataType: newSettingDataType,
			Value: parsedValue
		};

		customSettings = { ...customSettings, [newSettingKey]: newSetting };
		if (newSettingDataType === CustomSettingDataType.Array || newSettingDataType === CustomSettingDataType.Object) {
			editValues[newSettingKey] = JSON.stringify(parsedValue ?? null, null, 2);
		}
		resetNewSettingForm();
		showAddForm = false;
		addToast({
			message: 'Setting added successfully',
			type: 'success',
			timeout: 3000
		});
	};

	const handleDeleteSetting = (key: string) => {
		delete customSettings[key];
		addToast({
			message: 'Setting deleted successfully',
			type: 'success',
			timeout: 3000
		});
	};

	const parseAndValidateEditValues = (settingsToSave: CustomSettings) => {
		Object.keys(editValues).forEach(key => {
			const setting = settingsToSave[key];
			if (setting && (setting.DataType === CustomSettingDataType.Array || setting.DataType === CustomSettingDataType.Object)) {
				try {
					const parsed = parseAndValidateValue(editValues[key], setting.DataType, key);
					setting.Value = parsed;
				} catch (error) {
					throw error;
				}
			}
		});
	};

	const handleSubmit = async (event: Event) => {
		try {
			isSubmitting = true;
			event.preventDefault();
			const settingsToSave = { ...customSettings };
			parseAndValidateEditValues(settingsToSave);

			const response = await fetch(`/api/server/tenants/settings/${tenantId}/CustomSettings`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(settingsToSave)
			});

			if (response.ok) {
				addToast({
					message: 'Custom settings updated successfully',
					type: 'success',
					timeout: 3000
				});
				isEditing = false;
				showAddForm = false;
			} else {
				const errorData = await response.json();
				addToast({
					message: errorData.Message || 'Failed to save settings',
					type: 'error',
					timeout: 3000
				});
			}
		} catch (error) {
			console.error('Error saving custom settings:', error);
			addToast({
				message: 'Failed to save settings',
				type: 'error',
				timeout: 3000
			});
		} finally {
			isSubmitting = false;
		}
	};
	const getInputType = (dataType: CustomSettingDataType) => {
		switch (dataType) {
			case CustomSettingDataType.Number:
				return 'number';
			case CustomSettingDataType.Boolean:
				return 'checkbox';
			default:
				return 'text';
		}
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<!-- Heading -->
			<SettingsPageHeader
				title="Custom Settings"
				description="Manage tenant-specific custom configuration values."
				bind:isEditing
				{hasUnsavedChanges}
				closeHref={settingsRoute}
				onToggleEdit={handleToggleEdit}
				onCancelEdit={handleCancelEdit}
			/>

			<div class="flex flex-col space-y-4 px-5 py-4">
				{#if isEditing && !showAddForm}
					<div class="my-4 flex flex-col md:flex-row md:items-center">
						<div class="w-[30%]"></div>
						<div class="flex w-[70%] justify-end">
							<Button
								type="button"
								variant="primary"
								size="md"
								text="Add Setting"
								onclick={() => (showAddForm = true)}
							/>
						</div>
					</div>
				{/if}

				{#if isEditing}
					{#if showAddForm}
						<SettingsSection title="Add New Setting">
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label for="settingKey" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">
									Setting Key <span class="text-red-700">*</span>
								</label>
								<input
									id="settingKey"
									type="text"
									class="input-field w-[70%]"
									placeholder="Enter the setting key here..."
									bind:value={newSettingKey}
								/>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label for="settingName" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">
									Name <span class="text-red-700">*</span>
								</label>
								<input
									id="settingName"
									type="text"
									class="input-field w-[70%]"
									placeholder="Enter name here..."
									bind:value={newSettingName}
								/>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label for="settingDescription" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">
									Description
								</label>
								<textarea
									id="settingDescription"
									class="input-field w-[70%]"
									placeholder="Enter description here..."
									bind:value={newSettingDescription}
								></textarea>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label for="settingDataType" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">
									Data Type <span class="text-red-700">*</span>
								</label>
								<select
									id="settingDataType"
									class="select w-[70%]"
									bind:value={newSettingDataType}
								>
									{#each dataTypeOptions as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label for="settingValue" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">
									Value <span class="text-red-700">*</span>
								</label>
								{#if newSettingDataType === CustomSettingDataType.Boolean}
									<select
										id="settingValue"
										class="select w-[70%]"
										bind:value={newSettingValue}
									>
										<option value="true">True</option>
										<option value="false">False</option>
									</select>
								{:else if newSettingDataType === CustomSettingDataType.Object || newSettingDataType === CustomSettingDataType.Array}
									<textarea
										id="settingValue"
										class="input-field w-[70%]"
										rows="6"
										placeholder={newSettingDataType === CustomSettingDataType.Array
											? 'Enter array in JSON format, e.g.:\n["item1", "item2", "item3"]\nor:\n[1, 2, 3]'
											: 'Enter object in JSON format, e.g.:\n{"key1": "value1",\n "key2": "value2"}'}
										bind:value={newSettingValue}
									></textarea>
								{:else}
									<input
										id="settingValue"
										type={getInputType(newSettingDataType)}
										class="input-field w-[70%]"
										placeholder="Enter value here"
										bind:value={newSettingValue}
									/>
								{/if}
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<div class="w-[30%]"></div>
								<div class="flex w-[70%] justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										size="md"
										text="Cancel"
										onclick={() => {
											showAddForm = false;
											resetNewSettingForm();
										}}
									/>
									<Button
										type="button"
										variant="primary"
										size="md"
										text="Add Setting"
										onclick={handleAddSetting}
									/>
								</div>
							</div>
						</SettingsSection>
					{/if}
				{/if}

				{#if Object.keys(customSettings).length > 0}
					<SettingsSection title="Configured Settings" description="View and manage existing custom settings.">
						<div class="health-system-table-container my-4 shadow">
							<table class="health-system-table w-full">
								<thead>
									<tr>
										<th>Key</th>
										<th>Name</th>
										<th>Description</th>
										<th>Data Type</th>
										<th>Value</th>
										{#if isEditing}
											<th>Actions</th>
										{/if}
									</tr>
								</thead>
								<tbody>
									{#each Object.entries(customSettings) as [key, setting]}
										<tr>
											<td>{key}</td>
											<td>{setting.Name}</td>
											<td>{setting.Description || 'Not specified'}</td>
											<td>
											{setting.DataType}
											</td>
											<td>
												{#if setting.DataType === CustomSettingDataType.Boolean}
													<select
														class="select"
														bind:value={setting.Value}
														disabled={!isEditing}
													>
														<option value={true}>True</option>
														<option value={false}>False</option>
													</select>
												{:else if setting.DataType === CustomSettingDataType.Object || setting.DataType === CustomSettingDataType.Array}
													{#if isEditing}
														{@const editValue = getEditValue(key, setting)}
														<textarea
															class="input-field font-mono text-sm"
															rows="6"
															bind:value={editValues[key]}
															placeholder={setting.DataType === CustomSettingDataType.Array
																? 'Enter array in JSON format, e.g.: ["item1", "item2"]'
																: 'Enter object in JSON format, e.g.: {"key": "value"}'}
														></textarea>
													{:else}
														<textarea
															class="input-field font-mono text-sm"
															rows="6"
															value={JSON.stringify(setting.Value ?? null, null, 2)}
															disabled
															placeholder={setting.DataType === CustomSettingDataType.Array
																? 'Enter array in JSON format, e.g.: ["item1", "item2"]'
																: 'Enter object in JSON format, e.g.: {"key": "value"}'}
														></textarea>
													{/if}
												{:else}
													<input
														type={getInputType(setting.DataType)}
														class="input-field"
														bind:value={setting.Value}
														disabled={!isEditing}
													/>
												{/if}
											</td>
											{#if isEditing}
												<td>
													<div class="flex flex-row space-x-2">
														<Icon
															icon="material-symbols:delete-outline"
															class="cursor-pointer text-red-600"
															onclick={() => handleDeleteSetting(key)}
														/>
													</div>
												</td>
											{/if}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</SettingsSection>
				{:else}
					<SettingsSection>
						<div class="text-center py-8 text-[var(--color-info)]">
							<Icon icon="material-symbols:settings-outline" class="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>No custom settings configured yet.</p>
							{#if isEditing}
								<p class="text-sm opacity-75">Click "Add Setting" above to create your first custom setting.</p>
							{/if}
						</div>
					</SettingsSection>
				{/if}
			</div>

			<SettingsFooter {isEditing} {isSubmitting} onCancel={handleCancelEdit} />
		</form>
	</div>
</div>
