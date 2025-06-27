<script lang="ts">
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { ConsentSettings } from '$lib/types/tenant.settings.types';
	import { ConsentSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { languages } from '$lib/utils/language';

	///////////////////////////////////////////////////////////////////////////

	let {
		showCancelModel = false,
		onClose = $bindable(),
		form,
		consentSetting = $bindable(),
		tenantName,
		tenantCode
	} = $props();

	let promise = $state();
	let message = $state(consentSetting.Messages || []);
	let defualtLang = $state('');
	let defaultLangCode = $state('');
	let newMessage = $state({ LanguageCode: '', Content: '', WebsiteURL: '' });
	let showAddMessageForm = $state(false);
	let editingIndex: number | null = $state();
	let errors: Record<string, string> = $state({});

	function handleModalClose() {
		onClose();
		showAddMessageForm = false;
		editingIndex = null;
	}

	function addMessage() {
		if (!newMessage.LanguageCode || !newMessage.Content) {
			addToast({
				message: 'Language Code and Content are required.',
				type: 'error',
				timeout: 3000
			});
			return;
		}
		message.push({ ...newMessage });
		newMessage = { LanguageCode: '', Content: '', WebsiteURL: '' };
		showAddMessageForm = false;
	}

	function updateMessage() {
		if (editingIndex !== null) {
			message[editingIndex] = { ...newMessage };
			newMessage = { LanguageCode: '', Content: '', WebsiteURL: '' };
			editingIndex = null;
			showAddMessageForm = false;
		}
	}

	function deleteMessage(index: number) {
		message.splice(index, 1);
		addToast({
			message: 'Message deleted successfully.',
			type: 'success',
			timeout: 3000
		});
        showAddMessageForm = false;
		editingIndex = null;
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

			const validationResult = ConsentSettingsSchema.safeParse(consentSettingModel);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			consentSetting = validationResult.data;
			onClose();

			addToast({
				message: 'Consent settings updated successfully.',
				type: 'success',
				timeout: 3000
			});
            // showAddMessageForm = false;
		    // editingIndex = null;
		} catch (error) {
			toastMessage();
		}
	};
</script>

{#if showCancelModel}
	<div class="overlay">
		<div
			class="modal health-system-table-container relative max-h-[120vh] overflow-y-auto rounded bg-white p-4 shadow-lg"
		>
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th class="text">Chat Bot Setting</th>
							<th class="text-end">
								<button class="cancel-btn absolute top-2 right-2" onclick={handleModalClose}>
									<Icon icon="material-symbols:close-rounded" />
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td> Tenant Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.tenantName ? 'input-text-error' : ''}"
									name="chatbotName"
									placeholder="Enter name here..."
									bind:value={tenantName}
									disabled
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td> Tenant Code <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.tenantCode ? 'input-text-error' : ''}"
									name="tenantCode"
									placeholder="Enter tenant code here..."
									bind:value={tenantCode}
									disabled
								/>
								{#if errors?.TenantCode}
									<p class="text-error">{errors?.TenantCode}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td> Default Language <span class="text-red-700">*</span></td>
							<td>
								<select
									class="health-system-input"
									name="defaultLanguage"
									bind:value={defualtLang}
									onchange={onDefaultLangChange}
								>
									<option value="" disabled selected>Select a language</option>
									{#each languages as lang}
										<option value={lang.name}>{lang.name}</option>
									{/each}
								</select>
								{#if errors?.DefaultLanguage}
									<p class="text-error">{errors?.DefaultLanguage}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td
								><button
									type="button"
									class="health-system-btn variant-filled-secondary"
									onclick={() => (showAddMessageForm = true)}
								>
									Add Message
								</button></td
							>
						</tr>
						{#if showAddMessageForm}
							<tr>
								<td> Language Code <span class="text-red-700">*</span></td>
								<td>
									<select class="health-system-input" bind:value={newMessage.LanguageCode}>
										<option value="" disabled selected>Select code</option>
										{#each languages as lang}
											<option value={lang.code}>{lang.code}</option>
										{/each}
									</select>
								</td>
							</tr>
							<tr>
								<td> Content <span class="text-red-700">*</span></td>
								<td>
									<textarea
										name="content"
										class="health-system-input {form?.errors?.content ? 'input-text-error' : ''}"
										placeholder="Enter content"
										bind:value={newMessage.Content}
									></textarea>
								</td>
							</tr>
							<tr>
								<td> Website Url <span class="text-red-700"></span></td>
								<td>
									<input
										type="text"
										name="web url"
										class="health-system-input {form?.errors?.websiteURL ? 'input-text-error' : ''}"
										placeholder="Enter website URL"
										bind:value={newMessage.WebsiteURL}
									/>
								</td>
							</tr>

							<tr>
								<td>
									<button
										type="button"
										class="health-system-btn variant-filled-secondary"
										onclick={() => {
											if (editingIndex) {
												updateMessage();
											} else {
												addMessage();
											}
										}}
									>
										{editingIndex ? 'Update Message' : 'Save Message'}
									</button>
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
				{#if message.length > 0}
					<!-- Insert this just before the submit button div -->
					<div class="health-system-table-container mt-4 shadow">
						<table class="health-system-table w-full">
							<thead>
								<tr>
									<th>Sr</th>
									<th>Language Code</th>
									<th>Content</th>
									<th>Website URL</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{#each message as msg, index}
									<tr>
										<td>{index + 1}</td>
										<td>{msg.LanguageCode}</td>
										<td>{msg.Content}</td>
										<td>{msg.WebsiteURL}</td>
										<td class="flex flex-row space-x-2">
											<Icon
												icon="material-symbols:edit-outline"
												class="cursor-pointer"
												onclick={() => {
													showAddMessageForm = true;
													newMessage = { ...msg };
													editingIndex = index;
												}}
											/>
											<Icon
												icon="material-symbols:delete-outline"
												class="cursor-pointer text-red-600"
												onclick={() => deleteMessage(index)}
											/>
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
						<button type="submit" class="health-system-btn variant-filled-secondary">
							Submit
						</button>
					{/await}
				</div>
			</form>
		</div>
	</div>
{/if}
