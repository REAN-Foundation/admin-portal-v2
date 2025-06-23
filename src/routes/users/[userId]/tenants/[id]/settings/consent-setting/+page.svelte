<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { ConsentSettings } from '$lib/types/tenant.settings.types';
	import { ConsentSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { languages } from '$lib/utils/language';
	import type { PageServerData } from '../$types';
	import MessageModal from './message.modal.svelte';
	import { page } from '$app/state';

	///////////////////////////////////////////////////////////////////////////

    let { data, form } = $props();

    $inspect(data, "Consecnt setting data")
	const userId = page.params.userId;
	const tenantId = page.params.id;
    let tenantName = $state(data.tenantName || '');
    let tenantCode = $state(data.tenantCode || '');
	let defualtLang = $state(data.consentSettings.DefaultLanguage);
    let consentSetting: ConsentSettings = $state(data.consentSettings)
	let checkConsent = $state(data.chatbotSettings);
	

	let edit = $state(false);
	let promise = $state();
	let message = $state(data.consentSettings.Messages || []);
	let defaultLangCode = $state('');
	let newMessage = $state({ LanguageCode: '', Content: '', WebsiteURL: '' });
	let showAddMessageForm = $state(false);
	let editingIndex: number | null = $state();
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
					message: 'Edit mode enabled',
					type: 'info',
					timeout: 3000
				});
			} else {
				addToast({
					message: 'Settings saved successfully',
					type: 'success',
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
		const defaultLangCode = languages.find(l => l.name === defualtLang)?.code;
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
			

			addToast({
				message: 'Consent settings updated successfully.',
				type: 'success',
				timeout: 3000
			});
		} catch (error) {
			toastMessage();
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
	<div class="mx-auto">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div class="table-container">
				<!-- Heading -->
				<div class="flex items-center justify-between !rounded-b-none border bg-[#F2F3F5] px-5 py-6">
					<h1 class="mx-1 text-xl">Consent Settings</h1>
					<div class="flex items-center gap-2 text-end">
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={toggleEdit}
						>
							<Icon icon="material-symbols:edit-outline" />
							<span>{edit ? 'Save' : 'Edit'}</span>
						</button>
						<a
							href="../"
							class="inline-flex items-center justify-center rounded-md border-[0.5px] !border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
						>
							<Icon icon="material-symbols:close-rounded" class="h-5" />
						</a>
					</div>
				</div>

				<!-- Content -->
				<div class="px-5 py-6">
					<div class="space-y-4">
						<div class="my-4 flex flex-col md:flex-row md:items-center">
							<label class="mx-1 mb-2 block w-[30%] text-sm font-medium text-gray-700" for="tenantName">Tenant Name <span class="text-red-700">*</span></label>
							<input
								type="text"
								class="input-field w-[70%] {errors?.tenantName ? 'input-text-error' : ''}"
								name="tenantName"
								placeholder="Enter name here..."
								bind:value={tenantName}
								disabled={!edit}
							/>
							{#if errors?.Name}
								<p class="text-error">{errors?.Name}</p>
							{/if}
						</div>
						<div class="my-4 flex flex-col md:flex-row md:items-center">
							<label class="mx-1 mb-2 block w-[30%] text-sm font-medium text-gray-700" for="tenantCode">Tenant Code <span class="text-red-700">*</span></label>
							<input
								type="text"
								class="input-field w-[70%] {errors?.tenantCode ? 'input-text-error' : ''}"
								name="tenantCode"
								placeholder="Enter tenant code here..."
								bind:value={tenantCode}
								disabled={!edit}
							/>
							{#if errors?.TenantCode}
								<p class="text-error">{errors?.TenantCode}</p>
							{/if}
						</div>
						<div class="my-4 flex flex-col md:flex-row md:items-center">
							<label class="mx-1 mb-2 block w-[30%] text-sm font-medium text-gray-700" for="defaultLanguage">Default Language <span class="text-red-700">*</span></label>
							<select
								class="input-field w-[70%]"
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
						<div class="my-4 flex flex-col md:flex-row md:items-center">
							<div class="w-[30%]"></div>
							<div class="w-[70%] flex justify-end">
								<button
									type="button"
									class="health-system-btn variant-filled-secondary"
									onclick={openAddMessageModal}
									disabled={!edit}
								>
									Add Message +
								</button>
							</div>
						</div>
					</div>

					{#if message.length > 0}
						<div class="health-system-table-container mt-4 shadow">
							<table class="health-system-table w-full">
								<thead>
									<tr>
										<th>Sr</th>
										<th>Language </th>
										<th>Content</th>
										<th>Website URL</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{#each message as msg, index}
										<tr>
											<td>{index + 1}</td>
											<td>{languages.find(l => l.code === msg.LanguageCode)?.name || msg.LanguageCode}</td>
											<td>{msg.Content}</td>
											<td>{msg.WebsiteURL}</td>
											<td>
												<div class="flex flex-row space-x-2">
													<Icon
														icon="material-symbols:edit-outline"
														class="cursor-pointer {!edit ? 'opacity-50 cursor-not-allowed' : ''}"
														onclick={() => edit && openEditMessageModal(index)}
													/>
													<Icon
														icon="material-symbols:delete-outline"
														class="cursor-pointer text-red-600 {(!edit || msg.LanguageCode === (languages.find(l => l.name === defualtLang)?.code)) ? 'opacity-50 cursor-not-allowed' : ''}"
														onclick={() => edit && msg.LanguageCode !== (languages.find(l => l.name === defualtLang)?.code) && deleteMessage(index)}
													/>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
					<div class="mt-2 text-right">
						{#await promise}
							<button type="submit" class="upload-btn variant-filled-secondary" disabled>
								Submiting
							</button>
						{:then data}
							<button type="submit" class="health-system-btn variant-filled-secondary" disabled={!edit} title={!edit ? 'Enable edit mode to submit changes' : ''}>
								Submit
							</button>
						{/await}
					</div>
				</div>
			</div>
		</form>
		<MessageModal
			isOpen={showMessageModal}
			onClose={() => { showMessageModal = false; editingMessageIndex = null; }}
			onSave={handleSaveMessage}
			message={modalMessage}
			isEdit={isEditMessage}
			allMessages={message}
			editingIndex={editingMessageIndex}
		/>
	</div>
</div>
