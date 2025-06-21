<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import {
		ChatBotSettingsSchema,
		ConsentSettingsSchema
	} from '$lib/validation/tenant.settings.schema.js';
	import type {
		ChatBotSettings,
		ConsentSettings,
		FaviconUploadModel
	} from '$lib/types/tenant.settings.types.js';
	import ConsentModel from '$routes/users/[userId]/tenants/[id]/settings/chatbot-setting/consent.modal.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';
	import Progressive from './progressive.update.svelte';

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
	let chatBotSetting = $state({
		ChatBot: data.chatbotSettings
	});
	let consentSetting: ConsentSettings = $state(data.consentSettings || {});
	let showCancelModel = $state(false);

	let previousConsent = $derived(chatBotSetting.ChatBot.Consent);
	let faviconUrl = $derived(chatBotSetting.ChatBot.Favicon);
	// let disabled = $state(data.commonSettings.UserInterfaces.ChatBot);
	let disabled = $state(data.isChatBotEnabled);
	let edit = $state(false);
	let fileName = $state('')

	const totalSteps = 3;
	let currentSection = $state(0);

	const handleEditClick = async () => {
        if (!disabled) {
            addToast({
                message: 'This setting is disabled. Please update it from the main settings.',
                type: 'warning',
                timeout: 3000
            });
            return;
        }
        edit = !edit;
		// if (disabled) {
		// 	if (!edit) {
		// 		edit = true;
		// 		addToast({
		// 			message: 'Edit mode enabled',
		// 			type: 'info',
		// 			timeout: 3000
		// 		});
		// 	} else {
		// 		addToast({
		// 			message: 'Settings saved successfully',
		// 			type: 'success',
		// 			timeout: 3000
		// 		});
		// 		edit = false;
		// 	}
		// } else if (disabled === false) {
		// 	addToast({
		// 		message: 'This setting is disabled. Please update it from the main settings.',
		// 		type: 'warning',
		// 		timeout: 3000
		// 	});
		// 	return;
		// }
	};

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		fileName = file.name

		const fileCreateModel: FaviconUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		console.log("validation result", fileValidationResult);
		
		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		formData.append('file', file);
		formData.append('filename', file.name);
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		// let isConsentSaved = false;
		let isFaviconUploaded = false;
		// let isChatBotSaved = false;

		try {
            if (!edit) {
                addToast({
                    message: 'Nothing to edit !',
                    type: 'warning',
                    timeout: 3000
                });
                return;
            }
			// ----------------------------- CONSENT SETTINGS -----------------------------
			// const consentSettingModel: ConsentSettings = {
			// 	TenantId: tenantId,
			// 	TenantCode: tenantCode,
			// 	TenantName: tenantName,
			// 	DefaultLanguage: consentSetting.DefaultLanguage,
			// 	Messages: consentSetting.Messages
			// };

			// const consentValidation = ConsentSettingsSchema.safeParse(consentSettingModel);
			// if (!consentValidation.success) {
			// 	errors = Object.fromEntries(
			// 		Object.entries(consentValidation.error.flatten().fieldErrors).map(([key, val]) => [
			// 			key,
			// 			val?.[0] || 'This field is required'
			// 		])
			// 	);
			// 	return;
			// }

			// const consentRes = await fetch(`/api/server/tenants/settings/${tenantId}/Consent`, {
			// 	method: 'PUT',
			// 	body: JSON.stringify(consentSettingModel),
			// 	headers: { 'content-type': 'application/json' }
			// });

			// const consentJson = await consentRes.json();
			// if (consentJson.HttpCode === 200 || consentJson.HttpCode === 201) {
			// 	isConsentSaved = true;
			// } else if (consentJson.Errors) {
			// 	errors = consentJson.Errors;
			// 	addToast({ message: 'Consent settings failed.', type: 'error', timeout: 3000 });
			// 	return;
			// }

			// ----------------------------- FAVICON UPLOAD -----------------------------
			// if (formData.has('file')) {
			// 	const fileRes = await fetch(`/api/server/tenants/upload`, {
			// 		method: 'POST',
			// 		body: formData
			// 	});

			// 	const fileJson = await fileRes.json();

			// 	if (fileJson.HttpCode === 200 || fileJson.HttpCode === 201) {
			// 		faviconUrl = fileJson.Data.FileResources[0].Url;
			// 		isFaviconUploaded = true;
			// 	} else {
			// 		addToast({ message: 'Favicon upload failed.', type: 'error', timeout: 3000 });
			// 		return;
			// 	}
			// } else {
			// 	isFaviconUploaded = true; // no file, but treat as passed
			// }

			// ----------------------------- CHATBOT SETTINGS -----------------------------
			const chatbotCreateModel: ChatBotSettings = {
				Name: chatBotSetting.ChatBot.Name,
				Description: chatBotSetting.ChatBot.Description,
				DefaultLanguage: chatBotSetting.ChatBot.DefaultLanguage,
				OrganizationName: chatBotSetting.ChatBot.OrganizationName,
				OrganizationLogo: chatBotSetting.ChatBot.OrganizationLogo,
				OrganizationWebsite: chatBotSetting.ChatBot.OrganizationWebsite,
				Favicon: faviconUrl,
				MessageChannels: {
					WhatsApp: chatBotSetting.ChatBot.MessageChannels?.WhatsApp,
					Telegram: chatBotSetting.ChatBot.MessageChannels?.Telegram
				},
				SupportChannels: {
					ClickUp: chatBotSetting.ChatBot.SupportChannels?.ClickUp,
					Slack: chatBotSetting.ChatBot.SupportChannels?.Slack,
					Email: chatBotSetting.ChatBot.SupportChannels?.Email
				},
				Personalization: chatBotSetting.ChatBot.Personalization,
				Localization: chatBotSetting.ChatBot.Localization,
				LocationContext: chatBotSetting.ChatBot.LocationContext,
				RemindersMedication: chatBotSetting.ChatBot.RemindersMedication,
				ReminderAppointment: chatBotSetting.ChatBot.ReminderAppointment,
				QnA: chatBotSetting.ChatBot.QnA,
				Consent: chatBotSetting.ChatBot.Consent,
				WelcomeMessage: chatBotSetting.ChatBot.WelcomeMessage,
				Feedback: chatBotSetting.ChatBot.Feedback,
				AppointmentFollowup: chatBotSetting.ChatBot.AppointmentFollowup,
				ConversationHistory: chatBotSetting.ChatBot.ConversationHistory,
				Emojis: chatBotSetting.ChatBot.Emojis
			};

			const chatBotValidation = ChatBotSettingsSchema.safeParse(chatbotCreateModel);
			if (!chatBotValidation.success) {
				errors = Object.fromEntries(
					Object.entries(chatBotValidation.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const chatBotRes = await fetch(`/api/server/tenants/settings/${tenantId}/ChatBot`, {
				method: 'PUT',
				body: JSON.stringify(chatbotCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const chatBotJson = await chatBotRes.json();
			if (chatBotJson.HttpCode === 200 || chatBotJson.HttpCode === 201) {
                toastMessage(chatBotJson);
				edit = false;
			} else if (chatBotJson.Errors) {
				errors = chatBotJson.Errors;
				addToast({ message: 'ChatBot settings failed.', type: 'error', timeout: 3000 });
				return;
			}

			// ----------------------------- FINAL TOAST -----------------------------
			// if (isFaviconUploaded && isChatBotSaved) {
			// 	console.log('All settings saved successfully.');
			// 	//
			// 	toastMessage(chatBotJson);
			// 	edit = true;
			// }
		} catch (err) {
			console.error('Submit Error:', err);
			addToast({ message: 'Unexpected error occurred.', type: 'error', timeout: 3000 });
		}
	};

	const iconPaths = {
		MessageChannels: '/tenant-setting/chatbot/message_channel.svg#icon',
		SupportChannels: '/tenant-setting/chatbot/support_channel.svg#icon'
	};

	const chatBotSettings = {
		MessageChannels: {
			WhatsApp: {
				Name: 'Whats App',
				IconPath: 'ic:twotone-whatsapp'
			},
			Telegram: {
				Name: 'Telegram',
				IconPath: 'iconoir:telegram'
			}
		},
		SupportChannels: {
			ClickUp: {
				Name: 'Click Up',
				IconPath: 'lineicons:clickup'
			},
			Slack: {
				Name: 'Slack',
				IconPath: 'basil:slack-outline'
			},
			Email: {
				Name: 'Email',
				IconPath: 'line-md:email'
			}
		}
	} as const;

	function getSettingMeta(group: keyof typeof chatBotSettings, key: string) {
		const setting = chatBotSettings?.[group]?.[key];

		return (
			setting || {
				Name: key,
				IconPath: '',
				InfoText: key
			}
		);
	}

	$effect(() => {
		if (edit === false && chatBotSetting.ChatBot.Consent === true && previousConsent === false) {
			showCancelModel = true;
		}

		previousConsent = chatBotSetting.ChatBot.Consent;
	});
</script>

<ConsentModel
	{showCancelModel}
	onClose={() => (showCancelModel = false)}
	{form}
	bind:consentSetting
	{tenantName}
	{tenantCode}
/>

<div class="px-5 py-4">
	<div class="mx-auto">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<!-- Stepper -->

			<div class="w-full py-4">
				<div class="flex w-full items-center">
					{#each Array(totalSteps) as _, index}
						<!-- Step circle -->
						<div
							class={`step-number 
					${
						index < currentSection
							? 'step-completed'
							: index === currentSection
								? 'stepper-active'
								: 'stepper-inactive'
					}`}
						>
							{index < currentSection ? index + 1 : index + 1}
						</div>

						<!-- Line between steps -->
						{#if index < totalSteps - 1}
							<div
								class="mx-1 h-0.5 flex-1 bg-gray-300"
								class:bg-blue-600={index < currentSection - 1}
							></div>
						{/if}
					{/each}
				</div>

				<!-- Step label -->
				<div class="mt-2 text-center text-sm text-gray-600">
					Step {currentSection + 1} of {totalSteps}
				</div>
			</div>

			<div class="table-container">
				<!-- Heading -->

				<div
					class="flex items-center justify-between !rounded-b-none border bg-[#F2F3F5] px-5 py-6"
				>
					<h1 class=" mx-1 text-xl">Chatbot Settings</h1>
					<div class="flex items-center gap-2 text-end">
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={handleEditClick}
						>
							<Icon icon="material-symbols:edit-outline" />
							<!-- <span>{edit ? 'Save' : 'Edit'}</span> -->
						</button>
						<a
							href={tenantRoute}
							class="inline-flex items-center justify-center rounded-md border-[0.5px] !border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
						>
							<Icon icon="material-symbols:close-rounded" class=" h-5" />
						</a>
					</div>
				</div>

				<!-- content -->
				<div>
					<Progressive
						bind:chatBotSetting
						{edit}
						{iconPaths}
						{getSettingMeta}
						bind:showCancelModel
						{onFileSelected}
						bind:currentSection
						{fileName}
					/>
				</div>
			</div>
		</form>
	</div>
</div>
