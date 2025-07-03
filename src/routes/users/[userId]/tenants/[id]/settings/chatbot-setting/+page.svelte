<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { ChatBotSettingsSchema } from '$lib/validation/tenant.settings.schema.js';
	import type {
		ChatBotSettings,
		ConsentSettings,
		FaviconUploadModel,
		LogoUploadModel
	} from '$lib/types/tenant.settings.types.js';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';
	import Progressive from './progressive.update.svelte';
	import ExportSettingsDialog from './export-settings.dialog.svelte';

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
	let showExportDialog = $state(false);
	let isCreatingSecret = $state(false);

	let faviconUrl = chatBotSetting.ChatBot.Favicon;
	let logoUrl = chatBotSetting.ChatBot.OrganizationLogo;
	let logoUrlResult = $state('');
	let faviconUrlResult = $state('');

	// let disabled = $state(data.commonSettings.UserInterfaces.ChatBot);
	let disabled = $state(data.isChatBotEnabled);
	let edit = $state(false);
	let fileName = $state('');
	let logoName = $state('');

	const totalSteps = 3;
	let currentSection = $state(0);

	const handleEditClick = async () => {
		if (!disabled) {
			addToast({
				message: 'This setting is disabled. Please update it from the main settings.',
				type: 'info',
				timeout: 3000
			});
			return;
		}
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
	};

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		fileName = file.name;

		const fileCreateModel: FaviconUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

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

	const onLogoSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		logoName = file.name;

		const fileCreateModel: LogoUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		formData.append('logofile', file);
		formData.append('filename', file.name);
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		// let isConsentSaved = false;
		let isFaviconUploaded = false;
		let isLogoUploaded = false;
		// let isChatBotSaved = false;

		try {
			if (!edit) {
				addToast({
					message: 'Nothing to edit !',
					type: 'info',
					timeout: 3000
				});
				return;
			}

			//------------------------------LOGO UPLOAD---------------------------------

			if (formData.has('logofile')) {
				const fileRes = await fetch(`/api/server/tenants/settings/upload`, {
					method: 'POST',
					body: formData
				});

				const fileJson = await fileRes.json();

				if (fileJson.HttpCode === 200 || fileJson.HttpCode === 201) {
					logoUrl = fileJson.Data.FileResources[0].Url;

					isLogoUploaded = true;
				} else {
					addToast({ message: 'Logo upload failed.', type: 'error', timeout: 3000 });
					return;
				}
			} else {
				isLogoUploaded = true;
			}

			// ----------------------------- FAVICON UPLOAD -----------------------------
			if (formData.has('file')) {
				const fileRes = await fetch(`/api/server/tenants/upload`, {
					method: 'POST',
					body: formData
				});

				const fileJson = await fileRes.json();

				if (fileJson.HttpCode === 200 || fileJson.HttpCode === 201) {
					faviconUrl = fileJson.Data.FileResources[0].Url;

					isFaviconUploaded = true;
				} else {
					addToast({ message: 'Favicon upload failed.', type: 'error', timeout: 3000 });
					return;
				}
			} else {
				isFaviconUploaded = true; // no file, but treat as passed
			}

			// ----------------------------- CHATBOT SETTINGS -----------------------------
			const chatbotCreateModel: ChatBotSettings = {
				Name: chatBotSetting.ChatBot.Name,
				Description: chatBotSetting.ChatBot.Description,
				DefaultLanguage: chatBotSetting.ChatBot.DefaultLanguage,
				OrganizationName: chatBotSetting.ChatBot.OrganizationName,
				OrganizationLogo: logoUrl,
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
			Name: 'Message Channels',
			IconPath: 'mdi:message-outline',
			Description: 'Configure messaging platforms for chatbot communication.',
			WhatsApp: {
				Name: 'WhatsApp',
				IconPath: 'ic:twotone-whatsapp',
				Description: 'Connect with WhatsApp for messaging.'
			},
			Telegram: {
				Name: 'Telegram',
				IconPath: 'iconoir:telegram',
				Description: 'Connect with Telegram for messaging.'
			}
		},
		SupportChannels: {
			Name: 'Support Channels',
			IconPath: 'mdi:help-circle-outline',
			Description: 'Configure support platforms for customer assistance.',
			ClickUp: {
				Name: 'ClickUp',
				IconPath: 'lineicons:clickup',
				Description: 'Connect with ClickUp for task management.'
			},
			Slack: {
				Name: 'Slack',
				IconPath: 'basil:slack-outline',
				Description: 'Connect with Slack for team communication.'
			},
			Email: {
				Name: 'Email',
				IconPath: 'mdi:email-outline',
				Description: 'Connect with Email for notifications.'
			}
		},

		Personalization: {
			Name: 'Personalization',
			IconPath: 'mdi:account-circle-outline',
			Description: 'Enable personalized chatbot responses.'
		},
		LocationContext: {
			Name: 'Location Context',
			IconPath: 'mdi:map-marker-outline',
			Description: 'Use location data for contextual responses.'
		},
		Localization: {
			Name: 'Localization',
			IconPath: 'mdi:translate',
			Description: 'Support multiple languages and regions.'
		},
		RemindersMedication: {
			Name: 'Medication Reminders',
			IconPath: 'mdi:pill',
			Description: 'Send medication reminder notifications.'
		},
		QnA: {
			Name: 'Q&A',
			IconPath: 'mdi:help-circle-outline',
			Description: 'Enable question and answer functionality.'
		},
		Consent: {
			Name: 'Consent',
			IconPath: 'mdi:shield-check-outline',
			Description: 'Collect user consent and privacy agreements.'
		},
		WelcomeMessage: {
			Name: 'Welcome Message',
			IconPath: 'mdi:hand-wave-outline',
			Description: 'Send greeting messages to new users.'
		},
		Feedback: {
			Name: 'Feedback',
			IconPath: 'mdi:comment-outline',
			Description: 'Collect user feedback and ratings.'
		},
		ReminderAppointment: {
			Name: 'Appointment Reminders',
			IconPath: 'mdi:calendar-clock-outline',
			Description: 'Send appointment reminder notifications.'
		},
		AppointmentFollowup: {
			Name: 'Appointment Followup',
			IconPath: 'mdi:calendar-check-outline',
			Description: 'Follow up after appointments with users.'
		},
		ConversationHistory: {
			Name: 'Conversation History',
			IconPath: 'mdi:history',
			Description: 'Store and access previous conversations.'
		},
		Emojis: {
			Name: 'Emojis',
			IconPath: 'mdi:emoticon-happy-outline',
			Description: 'Use emojis in chatbot responses.'
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
		// if (edit === false && chatBotSetting.ChatBot.Consent === true && previousConsent === false) {
		// 	showCancelModel = true;
		// }
		// previousConsent = chatBotSetting.ChatBot.Consent;
	});

	async function getBotSecret() {
		showExportDialog = true;
	}
</script>

<div class="px-5 py-4">
	<div class="mx-auto">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<!-- Stepper -->

			<div class="w-full py-4">
				<div class="flex w-full items-start justify-between">
					<div class="flex flex-1 flex-col items-center">
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
						<div class="mt-2 text-center text-sm text-[var(--color-info)]">
							Step {currentSection + 1} of {totalSteps}
						</div>
					</div>
					<!-- Create Secret Button -->
					<button
						type="button"
						class="table-btn variant-filled-secondary ml-4"
						onclick={getBotSecret}
						disabled={isCreatingSecret}
					>
						<Icon icon="material-symbols:upload" class="mr-1" />
						{isCreatingSecret ? 'Creating...' : 'Create Secret'}
					</button>
				</div>
			</div>

			<!-- Heading -->

			<div
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class=" mx-1 text-xl text-[var(--color-info)]">Chatbot Settings</h1>
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
					chatBotUISettings={chatBotSettings}
					{onLogoSelected}
					{logoName}
				/>
			</div>
		</form>
	</div>
</div>
<!-- Export Settings Dialog -->
<ExportSettingsDialog
	open={showExportDialog}
	onclose={() => (showExportDialog = false)}
	{tenantId}
	{tenantCode}
/>
