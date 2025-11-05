<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { CustomSettings, CustomSetting } from '$lib/types/tenant.settings.types.js';
	import { CustomSettingDataType } from '$lib/types/tenant.settings.types.js';

	///////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;
	let customSettings: CustomSettings = $state(data.customSettings || {});
	let isEditing = $state(false);
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

	const handleEditClick = () => {
		isEditing = !isEditing;
		if (isEditing) {
			addToast({
					message: 'Edit mode enabled.',
					type: 'info',
					timeout: 3000
				});
			// Initialize edit values by converting arrays/objects to JSON strings
			Object.keys(customSettings).forEach(key => {
				const setting = customSettings[key];
				if (setting.DataType === CustomSettingDataType.Array || setting.DataType === CustomSettingDataType.Object) {
					editValues[key] = JSON.stringify(setting.Value ?? null, null, 2);
				}
			});
		} else {
			addToast({
					message: 'Edit mode disabled.',
					type: 'info',
					timeout: 3000
				});
			showAddForm = false;
			resetNewSettingForm();
			editValues = {};
		}
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
			<div class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6">
				<h1 class="text-xl text-[var(--color-info)]">Custom Settings</h1>
				<div class="flex items-center gap-2 text-end">
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

			<div class="flex flex-col space-y-4 px-5 py-4">
				{#if isEditing}
					<div class="my-4 flex flex-col md:flex-row md:items-center">
						<div class="w-[30%]"></div>
						<div class="flex w-[70%] justify-end">
							<button
								type="button"
								class="health-system-btn variant-filled-secondary"
								onclick={() => (showAddForm = !showAddForm)}
							>
								{showAddForm ? 'Cancel Add' : 'Add Setting +'}
							</button>
						</div>
					</div>

					{#if showAddForm}
						<div class="space-y-4 border border-[var(--color-outline)] rounded-lg p-4">
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
									<!-- <div class="w-[70%]"> -->
										<textarea
											id="settingValue"
											class="input-field w-[70%]"
											rows="6"
											placeholder={newSettingDataType === CustomSettingDataType.Array 
												? 'Enter array in JSON format, e.g.:\n["item1", "item2", "item3"]\nor:\n[1, 2, 3]' 
												: 'Enter object in JSON format, e.g.:\n{"key1": "value1",\n "key2": "value2"}'}
											bind:value={newSettingValue}
										></textarea>
									<!-- </div> -->
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
									<button
										type="button"
										class="health-system-btn variant-filled-secondary"
										onclick={() => {
											showAddForm = false;
											resetNewSettingForm();
										}}
									>
										Cancel
									</button>
									<button
										type="button"
										class="health-system-btn variant-filled-primary"
										onclick={handleAddSetting}
									>
										Add Setting
									</button>
								</div>
							</div>
						</div>
					{/if}
				{/if}

				{#if Object.keys(customSettings).length > 0}
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
				{:else}
					<div class="text-center py-8 text-[var(--color-info)]">
						<Icon icon="material-symbols:settings-outline" class="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No custom settings configured yet.</p>
						{#if isEditing}
							<p class="text-sm opacity-75">Click "Add Setting" above to create your first custom setting.</p>
						{/if}
					</div>
				{/if}
			</div>

			<hr class="border-t border-[0.5px] border-[var(--color-outline)]" />
			<div class="button-container my-4">
				{#await promise}
					<button type="submit" class="table-btn variant-soft-secondary" disabled>
						Submitting
					</button>
				{:then data}
					<button type="submit" class="table-btn variant-soft-secondary" disabled={!isEditing}>
						Submit
					</button>
				{/await}
			</div>
		</form>
	</div>
</div>
