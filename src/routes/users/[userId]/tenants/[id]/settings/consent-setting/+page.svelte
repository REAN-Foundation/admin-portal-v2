<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { ConsentSettings } from '$lib/types/tenant.settings.types';
	import { ConsentSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { languages } from '$lib/utils/language';
	import MessageModal from './message.modal.svelte';
	import { page } from '$app/state';
	import Button from '$lib/components/button/button.svelte';
	import SettingsPageWrapper from '../components/SettingsPageWrapper.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	let tenantName = $state(data.tenantResponse?.Data?.Tenant?.Name || '');
	let tenantCode = $state(data.tenantResponse?.Data?.Tenant?.Code || '');
	let defaultLang = $state(data.consentSettings?.DefaultLanguage || 'English');
	let consentSetting: ConsentSettings = $state(data.consentSettings);
	let checkConsent = $state(data.chatbotSettings);
	let edit = $state(false);
	let isSubmitting = $state(false);
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;
	let message = $state(data.consentSettings?.Messages || []);
	let errors: Record<string, string> = $state({});
	let showMessageModal = $state(false);
	let isEditMessage = $state(false);
	let editingMessageIndex: number | null = $state(null);
	let modalMessage = $state({ LanguageCode: '', Content: '', WebsiteURL: '' });

	const toggleEdit = async () => {
		if (checkConsent) {
			if (!edit) {
				edit = true;
				addToast({
					message: 'Edit mode enabled.',
					type: 'info',
					timeout: 3000
				});
			} else {
				addToast({
					message: 'Edit mode disabled.',
					type: 'info',
					timeout: 3000
				});
				edit = false;
			}
		} else if (checkConsent === false) {
			addToast({
				message: 'This setting is disabled. Please update it from the main settings.',
				type: 'warning',
				timeout: 3000
			});
			return;
		}
	};

	function deleteMessage(index: number) {
		const defaultLangCode = languages.find((l) => l.name === defaultLang)?.code;
		if (message[index].LanguageCode === defaultLangCode) {
			addToast({
				message: 'Cannot delete the message for the default language.',
				type: 'warning',
				timeout: 3000
			});
			return;
		}
		message.splice(index, 1);
		message = [...message];
		addToast({
			message: 'Message deleted successfully.',
			type: 'success',
			timeout: 3000
		});
	}

	function onDefaultLangChange(event: Event) {
		const selected = (event.target as HTMLSelectElement).value;
		defaultLang = selected;
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			if (!edit) {
				addToast({
					message: 'Nothing to edit!',
					type: 'info',
					timeout: 3000
				});
				return;
			}

			isSubmitting = true;

			const defaultLangCode = languages.find((l) => l.name === defaultLang)?.code;
			const hasDefaultLangMessage = message.some((msg) => msg.LanguageCode === defaultLangCode);
			if (!hasDefaultLangMessage) {
				addToast({
					message: `A message for the default language (${defaultLang}) is required.`,
					type: 'error',
					timeout: 3000
				});
				isSubmitting = false;
				return;
			}

			const consentSettingModel: ConsentSettings = {
				TenantName: tenantName,
				TenantCode: tenantCode,
				DefaultLanguage: defaultLang,
				Messages: message
			};

			const validationResult = ConsentSettingsSchema.safeParse(consentSettingModel);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				isSubmitting = false;
				return;
			}

			const chatBotRes = await fetch(`/api/server/tenants/settings/${tenantId}/Consent`, {
				method: 'PUT',
				body: JSON.stringify(consentSettingModel),
				headers: { 'content-type': 'application/json' }
			});

			consentSetting = validationResult.data;

			addToast({
				message: 'Consent settings updated successfully.',
				type: 'success',
				timeout: 3000
			});
			edit = false;
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

	function handleSaveMessage(msg: typeof modalMessage) {
		if (isEditMessage && editingMessageIndex !== null) {
			message[editingMessageIndex] = { ...msg };
		} else {
			message.push({ ...msg });
		}
		message = [...message];
	}
</script>

<SettingsPageWrapper
	title="Consent Settings"
	description="Manage consent messages and privacy settings"
	icon="material-symbols:verified-user-outline"
	disabled={!edit}
	onEditClick={toggleEdit}
	onSubmit={handleSubmit}
	backLink={settingsRoute}
	{isSubmitting}
>
	<!-- Form Fields -->
	<div class="space-y-6">
		<!-- Tenant Info Section -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="form-group">
				<label class="block text-sm font-medium text-[var(--color-info)] mb-2" for="tenantName">
					Tenant Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="tenantName"
					class="input-field w-full {errors?.tenantName ? 'input-text-error' : ''}"
					placeholder="Enter name here..."
					bind:value={tenantName}
					readonly
				/>
				{#if errors?.Name}
					<p class="text-red-500 text-sm mt-1">{errors?.Name}</p>
				{/if}
			</div>

			<div class="form-group">
				<label class="block text-sm font-medium text-[var(--color-info)] mb-2" for="tenantCode">
					Tenant Code <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="tenantCode"
					class="input-field w-full {errors?.tenantCode ? 'input-text-error' : ''}"
					placeholder="Enter tenant code here..."
					bind:value={tenantCode}
					readonly
				/>
				{#if errors?.TenantCode}
					<p class="text-red-500 text-sm mt-1">{errors?.TenantCode}</p>
				{/if}
			</div>
		</div>

		<!-- Default Language -->
		<div class="form-group">
			<label class="block text-sm font-medium text-[var(--color-info)] mb-2" for="defaultLanguage">
				Default Language <span class="text-red-500">*</span>
			</label>
			<select
				id="defaultLanguage"
				class="select w-full md:w-1/2"
				bind:value={defaultLang}
				onchange={onDefaultLangChange}
				disabled={!edit}
			>
				<option value="" disabled selected>Select a language</option>
				{#each languages as lang}
					<option value={lang.name}>{lang.name}</option>
				{/each}
			</select>
			{#if errors?.DefaultLanguage}
				<p class="text-red-500 text-sm mt-1">{errors?.DefaultLanguage}</p>
			{/if}
		</div>

		<!-- Messages Section -->
		<div class="messages-section">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-medium text-[var(--color-info)]">Consent Messages</h3>
				<Button
					variant="primary"
					size="sm"
					text="Add Message"
					onclick={() => openAddMessageModal()}
					disabled={!edit}
				/>
			</div>

			{#if message.length > 0}
				<div class="overflow-x-auto rounded-lg border border-[var(--color-outline)]">
					<table class="w-full text-sm">
						<thead class="bg-[var(--color-primary)]">
							<tr>
								<th class="px-4 py-3 text-left font-medium text-[var(--color-info)]">Language</th>
								<th class="px-4 py-3 text-left font-medium text-[var(--color-info)]">Content</th>
								<th class="px-4 py-3 text-left font-medium text-[var(--color-info)]">Website URL</th>
								<th class="px-4 py-3 text-center font-medium text-[var(--color-info)]">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[var(--color-outline)]">
							{#each message as msg, index}
								{@const isDefaultLang = msg.LanguageCode === languages.find((l) => l.name === defaultLang)?.code}
								<tr class="bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] transition-colors">
									<td class="px-4 py-3 text-[var(--color-info)]">
										<div class="flex items-center gap-2">
											{languages.find((l) => l.code === msg.LanguageCode)?.name || msg.LanguageCode}
											{#if isDefaultLang}
												<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Default</span>
											{/if}
										</div>
									</td>
									<td class="px-4 py-3 text-[var(--color-info)] max-w-xs truncate">{msg.Content}</td>
									<td class="px-4 py-3 text-[var(--color-info)] max-w-xs truncate">{msg.WebsiteURL}</td>
									<td class="px-4 py-3">
										<div class="flex items-center justify-center gap-2">
											<button
												type="button"
												class="p-1.5 rounded hover:bg-blue-100 transition-colors {!edit ? 'opacity-50 cursor-not-allowed' : ''}"
												onclick={() => edit && openEditMessageModal(index)}
												disabled={!edit}
											>
												<Icon icon="material-symbols:edit-outline" class="h-5 w-5 text-blue-600" />
											</button>
											<button
												type="button"
												class="p-1.5 rounded hover:bg-red-100 transition-colors {!edit || isDefaultLang ? 'opacity-50 cursor-not-allowed' : ''}"
												onclick={() => edit && !isDefaultLang && deleteMessage(index)}
												disabled={!edit || isDefaultLang}
											>
												<Icon icon="material-symbols:delete-outline" class="h-5 w-5 text-red-600" />
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center py-12 bg-[var(--color-primary)] rounded-lg border border-dashed border-[var(--color-outline)]">
					<Icon icon="mdi:message-text-outline" class="h-12 w-12 mx-auto text-[var(--color-info)] opacity-40 mb-3" />
					<p class="text-[var(--color-info)] opacity-70">No consent messages configured yet.</p>
					{#if edit}
						<p class="text-sm text-[var(--color-info)] opacity-50 mt-1">Click "Add Message" to create your first consent message.</p>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Info Banner -->
		<div class="p-4 rounded-lg bg-blue-50 border border-blue-200">
			<div class="flex items-start gap-3">
				<Icon icon="mdi:information-outline" class="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
				<div>
					<p class="text-sm text-blue-800">
						<strong>Note:</strong> Consent messages are displayed to users before they interact with the chatbot.
						Make sure to provide a message for the default language at minimum.
					</p>
				</div>
			</div>
		</div>
	</div>
</SettingsPageWrapper>

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
