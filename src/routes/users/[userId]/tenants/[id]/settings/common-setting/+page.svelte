<script lang="ts">
	import ExpandableSettings from '$lib/components/tenant-setting.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import { commonUISettings } from './common-setting.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { CommonSettingsSchema } from '$lib/validation/tenant.settings.schema';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let commonSetting = $state(data.settings);

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;
	let promise = $state();
	let errors: Record<string, string> = $state({});

	function handleCommonSettingSubmit(event, commonSetting) {
		event.preventDefault();
		// commonSetting = updated;
		// console.log('New settings:common Setting ', commonSetting);
		// console.log('New settings:updated ', updated);
	}

	const handleSubmit = async (event: Event, commonSetting) => {
		event.preventDefault();
		// commonSetting = updated;
		// console.log('New settings:common Setting ', commonSetting);
		// console.log("New settings:updated ", updated);
		try {
			errors = {};
			// const chatbotCreateModel: ChatBotSettings = {
			// 	Name: commonSetting.ChatBot.Name,
			// 	Description: commonSetting.ChatBot.Description,
			// 	DefaultLanguage: commonSetting.ChatBot.DefaultLanguage,
			// 	OrganizationName: commonSetting.ChatBot.OrganizationName,
			// 	OrganizationLogo: commonSetting.ChatBot.OrganizationLogo,
			// 	OrganizationWebsite: commonSetting.ChatBot.OrganizationWebsite,
			// 	Favicon: commonSetting.ChatBot.Favicon,
			// 	MessageChannels: {
			// 		WhatsApp: commonSetting.ChatBot.MessageChannels?.WhatsApp,
			// 		Telegram: commonSetting.ChatBot.MessageChannels?.Telegram
			// 	},
			// 	SupportChannels: {
			// 		ClickUp: commonSetting.ChatBot.SupportChannels?.ClickUp,
			// 		Slack: commonSetting.ChatBot.SupportChannels?.Slack,
			// 		Email: commonSetting.ChatBot.SupportChannels?.Email
			// 	},
			// 	Personalization: commonSetting.ChatBot.Personalization,
			// 	Localization: commonSetting.ChatBot.Localization,
			// 	LocationContext: commonSetting.ChatBot.LocationContext,
			// 	RemindersMedication: commonSetting.ChatBot.RemindersMedication,
			// 	ReminderAppointment: commonSetting.ChatBot.ReminderAppointment,
			// 	QnA: commonSetting.ChatBot.QnA,
			// 	Consent: commonSetting.ChatBot.Consent,
			// 	WelcomeMessage: commonSetting.ChatBot.WelcomeMessage,
			// 	Feedback: commonSetting.ChatBot.Feedback,
			// 	AppointmentFollowup: commonSetting.ChatBot.AppointmentFollowup,
			// 	ConversationHistory: commonSetting.ChatBot.ConversationHistory,
			// 	Emojis: commonSetting.ChatBot.Emojis
			// };

			// const validationResult = CommonSettingsSchema.safeParse(commonSetting);
			// console.log('This is validation result', validationResult);
			// if (!validationResult.success) {
			// 	errors = Object.fromEntries(
			// 		Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
			// 			key,
			// 			val?.[0] || 'This field is required'
			// 		])
			// 	);
			// 	return;
			// }

			const updated = { Common: JSON.stringify(commonSetting,null,2) };
			console.log('New settings:updated ', updated);

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Common`, {
				method: 'PUT',
				body: JSON.stringify({Common:commonSetting}),
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

	let disabled = $state(true);
	let edit = $derived(disabled);
</script>

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<button
			class="table-btn variant-filled-secondary gap-1"
			onclick={() => {
				disabled = !disabled;
				edit = disabled;
			}}
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</button>
	</div>

	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={() => handleSubmit(event, commonSetting)}>
				<table class="table-c">
					<thead>
						<tr>
							<th>
								<div class="flex justify-between">
									<h1 class="py-2 text-lg">Common Setting</h1>

									<a href={tenantRoute} class="cancel-btn">
										<Icon icon="material-symbols:close-rounded" />
									</a>
								</div>
							</th></tr
						>
					</thead>
					<tbody>
						<ExpandableSettings groupedSettings={commonUISettings} bind:commonSetting {edit} />
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
