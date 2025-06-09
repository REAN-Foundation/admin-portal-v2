<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Icons from '$lib/components/icons.svelte';
	import InfoIcon from '$lib/components/infoIcon.svelte';
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
	import { languages } from '$lib/utils/language.js';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';
	import type { ProfileFileUploadModel } from '$lib/types/profile.types.js';
	import Progressive from './progressive.update.svelte';
	///////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	$inspect('data', data);
	let errors: Record<string, string> = $state({});
	let chatBotSetting = $state({ ChatBot: data.settings });

	let promise = $state();
	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantCode = $state(data.tenantCode);
	const tenantName = $state(data.tenantName);
	const tenantRoute = `/users/${userId}/tenants`;
	let showCancelModel = $state(false);
	let consentSetting = $state();
	let previousConsent = $derived(chatBotSetting.ChatBot.Consent);

	$inspect('chatbot setting', chatBotSetting);
	let faviconUrl = $derived(chatBotSetting.ChatBot.Favicon);
	let fileName = $state(undefined);
	let selectFile = $state(undefined);

	let openTab: string | null = $state(null);

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}

	let disabled = $state(true);
	let edit = $derived(disabled);
	async function uploadFile(event: Event) {
		if (formData.has('file')) {
			try {
				const res = await fetch(`/api/server/tenants/upload`, {
					method: 'POST',
					body: formData
				});
				const response = await res.json();

				console.log('response from api endpoint', response);
				if (response.HttpCode === 201 || response.HttpCode === 200) {
					toastMessage(response);
					// edit = true;
					// return;
				}
				if (response.Errors) {
					errors = response?.Errors || {};
				} else {
					toastMessage(response);
				}
			} catch (error) {
				toastMessage();
			}
		}
	}
	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];

		const fileCreateModel: FaviconUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);
		console.log('validation result of file', fileValidationResult);

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

		try {
			errors = {};
			const consentSettingModel: ConsentSettings = {
				TenantId: tenantId,
				TenantCode: tenantCode,
				TenantName: tenantName,
				DefaultLanguage: consentSetting.DefaultLanguage,
				Messages: consentSetting.Messages
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

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Consent`, {
				method: 'PUT',
				body: JSON.stringify(consentSettingModel),
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// edit = true;
				// return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}

		// console.log('faviconUrl', faviconUrl);

		// if (formData.has('file')) {
		// 	const res = await fetch(`/api/server/tenants/upload`, {
		// 		method: 'POST',
		// 		body: formData
		// 	});
		// 	const response = await res.json();
		// 	// const uploadFileData = uploadFile(event);
		// 	faviconUrl = response.Data.FileResources[0].Url;
		// // 	try {
		// // 		const res = await fetch(`/api/server/tenants/upload`, {
		// // 			method: 'POST',
		// // 			body: formData
		// // 		});
		// // 		const response = await res.json();

		// // 		console.log('response from api endpoint', response);
		// // 		if (response.HttpCode === 201 || response.HttpCode === 200) {
		// // 			toastMessage(response);
		// // 			// edit = true;
		// // 			// return;
		// // 		}
		// // 		if (response.Errors) {
		// // 			errors = response?.Errors || {};
		// // 		} else {
		// // 			toastMessage(response);
		// // 		}
		// // 	} catch (error) {
		// // 		toastMessage();
		// // 	}
		// }

		try {
			errors = {};
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

			const validationResult = ChatBotSettingsSchema.safeParse(chatbotCreateModel);
			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/ChatBot`, {
				method: 'PUT',
				body: JSON.stringify(chatbotCreateModel),
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				edit = true;
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};
	const iconPaths = {
		MessageChannels: '/tenant-setting/chatbot/message_channel.svg#icon',
		SupportChannels: '/tenant-setting/chatbot/support_channel.svg#icon'
	};

	let chatBotSettings: {
		MessageChannels: {
			WhatsApp: {
				Name: 'Whats App';
				IconPath: '/tenant-setting/chatbot/whatsapp.svg#icon';
			};
			Telegram: {
				Name: 'Telegram';
				IconPath: '/tenant-setting/chatbot/telegram.svg#icon';
			};
		};
		SupportChannels: {
			ClickUp: {
				Name: 'Click Up';
				IconPath: '/tenant-setting/chatbot/clickup.svg#icon';
			};
			Slack: {
				Name: 'Slack';
				IconPath: '/tenant-setting/chatbot/slack.svg#icon';
			};
			Email: {
				Name: 'Email';
				IconPath: '/tenant-setting/chatbot/email.svg#icon';
			};
		};
	};

	function getSettingMeta(group: string, key: string) {
		return (
			chatBotSettings?.[group]?.[key] || {
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

	function onCloseModal() {
		showCancelModel = false;
	}

	// const upload = async (imgBase64, file) => {
	// 	const data = {};
	// 	console.log(imgBase64);

	// 	// const imgData = imgBase64.split(',');
	// 	// data['image'] = imgData[1];

	// 	if (!file) return;

	// 	const formData = new FormData();
	// 	formData.append('file', file);

	// 	const res = await fetch(`/api/server/tenants/upload`, {
	// 		method: 'POST',
	// 		body: formData
	// 	});

	// 	const response = await res.json();
	// 	console.log('response from api endpoint', response);

	// 	if (response.Status === 'success' && response.HttpCode === 201) {
	// 		return { success: true, resourceId: response.Data?.id, response };
	// 	}
	// 	if (response.Errors) {
	// 		errors = response?.Errors || {};
	// 		// showMessage(response.Message, 'error');
	// 		return response;
	// 	} else {
	// 		// showMessage(response.Message, 'error');
	// 		return { success: false, error: response.Message };
	// 	}
	// };

	const formData = new FormData();
</script>

<ConsentModel
	{showCancelModel}
	onClose={() => (showCancelModel = false)}
	{form}
	bind:consentSetting
	{tenantName}
	{tenantCode}
/>

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<div class="flex items-center justify-between p-2">
					<h1 class=" text-xl">ChatBot Setting</h1>
					<div class="flex items-center gap-2 text-end">
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={() => {
								disabled = !disabled;
								edit = disabled;
							}}
						>
							<Icon icon="material-symbols:edit-outline" />
							<span>Edit</span>
						</button>
						<a href={tenantRoute} class="health-system-btn variant-soft-secondary">
							<Icon icon="material-symbols:close-rounded" class=" h-5" />
						</a>
					</div>
				</div>
				<div>
					<Progressive
						bind:chatBotSetting
						{edit}
						{iconPaths}
						{getSettingMeta}
						{showCancelModel}
						{onFileSelected}
					/>
				</div>
			</form>
		</div>
	</div>
</div>
