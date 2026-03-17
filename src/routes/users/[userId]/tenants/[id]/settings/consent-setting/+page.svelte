<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { ConsentSettings } from '$lib/types/tenant.settings.types';
	import { ConsentSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { languages } from '$lib/utils/language';
	import MessageModal from './message.modal.svelte';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';
	import SettingsSection from '$lib/components/settings/settings-section.svelte';
	import SettingsFooter from '$lib/components/settings/settings-footer.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	let tenantName = $state(data.tenantResponse?.Data?.Tenant?.Name || '');
	let tenantCode = $state(data.tenantResponse?.Data?.Tenant?.Code || '');
	let defualtLang = $state(data.consentSettings?.DefaultLanguage || 'English');
	let consentSetting: ConsentSettings = $state(data.consentSettings);
	let checkConsent = $state(data.chatbotSettings);
	let edit = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;
	let message = $state(data.consentSettings?.Messages || []);
	let defaultLangCode = $state('');
	let errors: Record<string, string> = $state({});
	let showMessageModal = $state(false);
	let isEditMessage = $state(false);
	let editingMessageIndex: number | null = $state(null);
	let modalMessage = $state({ LanguageCode: '', Content: '', WebsiteURL: '' });

	let hasUnsavedChanges = $derived(
		edit && (JSON.stringify({ defualtLang, message: $state.snapshot(message) }) !== originalSnapshot)
	);

	beforeNavigate((navigation) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	const handleToggleEdit = () => {
		if (!checkConsent) {
			addToast({
				message: 'This setting is disabled. Please update it from the main settings.',
				type: 'warning',
				timeout: 3000
			});
			return;
		}
		edit = true;
		originalSnapshot = JSON.stringify({ defualtLang, message: $state.snapshot(message) });
		addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
	};

	const handleCancelEdit = () => {
		const snapshot = JSON.parse(originalSnapshot);
		defualtLang = snapshot.defualtLang;
		message = snapshot.message;
		edit = false;
		errors = {};
		addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
	};

	function deleteMessage(index: number) {
		const defaultLangCode = languages.find((l) => l.name === defualtLang)?.code;
		if (message[index].LanguageCode === defaultLangCode) {
			addToast({
				message: 'Cannot delete the message for the default language.',
				type: 'warning',
				timeout: 3000
			});
			return;
		}
		message.splice(index, 1);
		addToast({
			message: 'Message deleted successfully.',
			type: 'success',
			timeout: 3000
		});
	}

	function onDefaultLangChange(event: Event) {
		const selected = (event.target as HTMLSelectElement).value;
		defualtLang = selected;
		defaultLangCode = languages.find((l) => l.name === selected)?.code ?? '';
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
			isSubmitting = true;

			const defaultLangCode = languages.find((l) => l.name === defualtLang)?.code;
			const hasDefaultLangMessage = message.some((msg) => msg.LanguageCode === defaultLangCode);
			if (!hasDefaultLangMessage) {
				addToast({
					message: `A message for the default language (${defualtLang}) is required.`,
					type: 'error',
					timeout: 3000
				});
				return;
			}

			const consentSettingModel: ConsentSettings = {
				TenantName: tenantName,
				TenantCode: tenantCode,
				DefaultLanguage: defualtLang,
				Messages: message
			};

			console.log('Consent Setting Model:', consentSettingModel);
			const validationResult = ConsentSettingsSchema.safeParse(consentSettingModel);
			console.log('Validation Result:', validationResult);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const chatBotRes = await fetch(`/api/server/tenants/settings/${tenantId}/Consent`, {
				method: 'PUT',
				body: JSON.stringify(consentSettingModel),
				headers: { 'content-type': 'application/json' }
			});

			consentSetting = validationResult.data;
			edit = false;
			originalSnapshot = '';

			addToast({
				message: 'Consent settings updated successfully.',
				type: 'success',
				timeout: 3000
			});
		} catch (error) {
			toastMessage();
		} finally {
			isSubmitting = false;
		}
	};

	function openAddMessageModal() {
		isEditMessage = false;
		modalMessage = { LanguageCode: '', Content: '', WebsiteURL: '' };
		showMessageModal = true;
	}

	function openEditMessageModal(index: number) {
		isEditMessage = true;
		editingMessageIndex = index;
		modalMessage = { ...message[index] };
		showMessageModal = true;
	}

	function handleSaveMessage(msg) {
		if (isEditMessage && editingMessageIndex !== null) {
			message[editingMessageIndex] = { ...msg };
		} else {
			message.push({ ...msg });
		}
	}
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => handleSubmit(event)}>
			<SettingsPageHeader
				title="Consent Settings"
				description="Configure consent messages and default language preferences."
				isEditing={edit}
				featureEnabled={!!checkConsent}
				{hasUnsavedChanges}
				closeHref={settingsRoute}
				onToggleEdit={handleToggleEdit}
				onCancelEdit={handleCancelEdit}
			/>
			<div class="flex flex-col space-y-4 px-5 py-4">
				<SettingsSection title="Consent Details" description="Basic tenant consent configuration.">
					<div class="hidden">
						<label
							class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
							for="tenantName">Tenant Name <span class="text-red-700">*</span></label
						>
						<input
							type="text"
							class="input-field w-[70%] {errors?.tenantName ? 'input-text-error' : ''}"
							name="tenantName"
							placeholder="Enter name here..."
							bind:value={tenantName}
							readOnly
						/>
						{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
						{/if}
					</div>
					<div class="hidden">
						<label
							class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
							for="tenantCode">Tenant Code <span class="text-red-700">*</span></label
						>
						<input
							type="text"
							class="input-field w-[70%] {errors?.tenantCode ? 'input-text-error' : ''}"
							name="tenantCode"
							placeholder="Enter tenant code here..."
							bind:value={tenantCode}
							readOnly
						/>
						{#if errors?.TenantCode}
							<p class="text-error">{errors?.TenantCode}</p>
						{/if}
					</div>
					<div class="my-4 flex flex-col md:flex-row md:items-center">
						<label
							class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
							for="defaultLanguage">Default Language <span class="text-red-700">*</span></label
						>
						<select
							class=" select w-[70%]"
							name="defaultLanguage"
							bind:value={defualtLang}
							onchange={onDefaultLangChange}
							disabled={!edit}
						>
							<option value="" disabled selected>Select a language</option>
							{#each languages as lang}
								<option value={lang.name}>{lang.name}</option>
							{/each}
						</select>
						{#if errors?.DefaultLanguage}
							<p class="text-error">{errors?.DefaultLanguage}</p>
						{/if}
					</div>
					<div class="mt-4 flex flex-col md:flex-row md:items-center justify-end">
						<Button
							variant="primary"
							size="sm"
							text="Add Message"
							onclick={() => openAddMessageModal()}
							disabled={!edit}
						/>
					</div>
				</SettingsSection>

				<SettingsSection title="Consent Messages" description="Manage consent messages in different languages.">
					{#if message.length > 0}
						<div class="health-system-table-container my-4 shadow">
							<table class="health-system-table w-full">
								<thead>
									<tr>
										<th>Language </th>
										<th>Content</th>
										<th>Website URL</th>
									</tr>
								</thead>
								<tbody>
									{#each message as msg, index}
										<tr>
											<td
												>{languages.find((l) => l.code === msg.LanguageCode)?.name ||
													msg.LanguageCode}</td
											>
											<td>{msg.Content}</td>
											<td>{msg.WebsiteURL}</td>
											<td>
												<div class="flex flex-row space-x-2">
													<Icon
														icon="material-symbols:edit-outline"
														class="cursor-pointer {!edit ? 'cursor-not-allowed opacity-50' : ''}"
														onclick={() => edit && openEditMessageModal(index)}
													/>
													<Icon
														icon="material-symbols:delete-outline"
														class="cursor-pointer text-red-600 {!edit ||
														msg.LanguageCode === languages.find((l) => l.name === defualtLang)?.code
															? 'cursor-not-allowed opacity-50'
															: ''}"
														onclick={() =>
															edit &&
															msg.LanguageCode !==
																languages.find((l) => l.name === defualtLang)?.code &&
															deleteMessage(index)}
													/>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</SettingsSection>
			</div>

			<SettingsFooter isEditing={edit} {isSubmitting} onCancel={handleCancelEdit} />
		</form>
	</div>
</div>
<MessageModal
	isOpen={showMessageModal}
	onClose={() => {
		showMessageModal = false;
		editingMessageIndex = null;
	}}
	onSave={handleSaveMessage}
	message={modalMessage}
	isEdit={isEditMessage}
	allMessages={message}
	editingIndex={editingMessageIndex}
/>
