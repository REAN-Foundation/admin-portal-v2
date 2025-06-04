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
	import type { ChatBotSettings, ConsentSettings } from '$lib/types/tenant.settings.types.js';
	import ConsentModel from '$routes/users/[userId]/tenants/[id]/settings/chatbot-setting/consent.modal.svelte';
	///////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

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
	let previousConsent = chatBotSetting.ChatBot.Consent;

	let openTab: string | null = $state(null);

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}
	let disabled = $state(true);
	let edit = $derived(disabled);

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
		try {
			errors = {};
			const chatbotCreateModel: ChatBotSettings = {
				Name: chatBotSetting.ChatBot.Name,
				Description: chatBotSetting.ChatBot.Description,
				DefaultLanguage: chatBotSetting.ChatBot.DefaultLanguage,
				OrganizationName: chatBotSetting.ChatBot.OrganizationName,
				OrganizationLogo: chatBotSetting.ChatBot.OrganizationLogo,
				OrganizationWebsite: chatBotSetting.ChatBot.OrganizationWebsite,
				Favicon: chatBotSetting.ChatBot.Favicon,
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
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th class="w-[30%]">Chat Bot Setting</th>
							<th class="w-[70%] text-end">
								<a href={tenantRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input"
									name="chatbotName"
									placeholder="Enter name here..."
									bind:value={chatBotSetting.ChatBot.Name}
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Organization Name </td>
							<td>
								<input
									type="text"
									class="health-system-input"
									name="organiztionName"
									placeholder="Enter organiztion name here..."
									bind:value={chatBotSetting.ChatBot.OrganizationName}
								/>
								{#if errors?.OrganiztionName}
									<p class="text-error">{errors?.OrganiztionName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Organization Logo </td>
							<td>
								<input
									type="text"
									class="health-system-input"
									name="organizationLogo"
									placeholder="Enter organization logo here..."
									bind:value={chatBotSetting.ChatBot.OrganizationLogo}
								/>
								{#if errors?.OrganizationLogo}
									<p class="text-error">{errors?.OrganizationLogo}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Organization Website</td>
							<td>
								<input
									type="text"
									class="health-system-input"
									name="organizationWebsite"
									placeholder="Enter organization ebsite here..."
									bind:value={chatBotSetting.ChatBot.OrganizationWebsite}
								/>
								{#if errors?.OrganizationWebsite}
									<p class="text-error">{errors?.OrganizationWebsite}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Favicon </td>
							<td>
								<input
									type="text"
									class="health-system-input"
									name="favicon"
									placeholder="Enter favicon here..."
									bind:value={chatBotSetting.ChatBot.Favicon}
								/>
								{#if errors?.Favicon}
									<p class="text-error">{errors?.Favicon}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
							<td>
								<textarea
									bind:value={chatBotSetting.ChatBot.Description}
									name="description"
									placeholder="Enter description here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Default Language </td>
							<td>
								<input
									type="text"
									class="health-system-input"
									name="defaultLanguage"
									placeholder="Enter default language here..."
									bind:value={chatBotSetting.ChatBot.DefaultLanguage}
								/>
								{#if errors?.DefaultLanguage}
									<p class="text-error">{errors?.DefaultLanguage}</p>
								{/if}
							</td>
						</tr>

						{#each Object.entries(chatBotSetting.ChatBot) as [groupName, groupItems]}
							{#if typeof groupItems === 'boolean'}
								<tr>
									<td>
										<div class="flex items-center gap-2">
											{#if edit === true && groupItems === true}
												<span class="text-green-500">✅</span>
											{:else if edit === true && groupItems === false}
												<span>❌</span>
											{:else}
												<input
													type="checkbox"
													class="checkbox checkbox-primary"
													disabled={edit}
													bind:checked={chatBotSetting.ChatBot[groupName]}
												/>
											{/if}

											<Icons
												cls="stroke-slate-800 my-2 stroke-2 fill-none"
												h="80%"
												w="80%"
												iconPath="/tenant-setting/chatbot/whatsapp.svg#icon"
											/>
											<span class="text-base">{groupName}</span>
										</div>
									</td>

									<td>
										<div class="flex items-center justify-end gap-2">
											{#if groupName === 'Consent' && groupItems === true && edit === true}
												<Icon
													icon="material-symbols:edit-outline"
													onclick={() => (showCancelModel = true)}
												/>
											{/if}

											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none my-2"
												h="80%"
												w="80%"
												iconPath="/tenant-setting/info.svg#icon"
												title="Settings under Whatsapp"
											/>
										</div>
									</td>
								</tr>
							{/if}
						{/each}

						{#each Object.entries(chatBotSetting.ChatBot) as [groupName, groupItems]}
							{#if groupName === 'MessageChannels' || groupName === 'SupportChannels'}
								<tr>
									<td colspan="2">
										<button
											type="button"
											onclick={() => toggleTab(groupName)}
											class={`sidebar-item flex w-full items-center justify-between rounded-md px-4 py-2 transition-colors duration-200 ${
												openTab === groupName ? 'bg-slate-100 ' : ''
											}`}
										>
											<div class="flex flex-1 items-center gap-2">
												<Icons
													cls="stroke-slate-800 my-2 stroke-2 fill-none"
													h="80%"
													w="80%"
													iconPath={iconPaths[groupName] ?? ''}
												/>
												<span class="text-base">
													{#if groupName === 'MessageChannels'}
														<span>Message Channels</span>
													{:else if groupName === 'SupportChannels'}
														<span>Support Channels</span>
													{/if}
												</span>
											</div>

											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none my-2"
												h="80%"
												w="80%"
												iconPath="/tenant-setting/info.svg#icon"
												title={`Settings under ${groupName}`}
											/>
											<!-- <span class:rotate-180={openTab === groupName} class="transition-transform duration-300"> -->
											<span
												class="transition-transform duration-300"
												class:rotate-180={openTab === groupName}
											>
												<Icon
													icon="icon-park-outline:down"
													width="16"
													height="16"
													class="h-5 w-5"
												/>
											</span>
										</button>

										{#if openTab === groupName}
											<div class="flex w-full justify-center py-5">
												<div class="mx-20 grid w-full grid-cols-2 gap-x-10 gap-y-6 lg:grid-cols-2">
													{#each Object.entries(groupItems) as [key, value]}
														{@const meta = getSettingMeta(groupName, key)}

														<div class="flex items-center gap-3">
															{#if edit === true && chatBotSetting.ChatBot[groupName][key] === true}
																<span class="text-green-500">✅</span>
															{:else if edit === true && chatBotSetting.ChatBot[groupName][key] !== true}
																<span>❌</span>
															{:else}
																<label class="flex items-center gap-2">
																	<input
																		type="checkbox"
																		class="checkbox checkbox-primary"
																		disabled={edit}
																		bind:checked={chatBotSetting.ChatBot[groupName][key]}
																	/>
																</label>
															{/if}
															<Icons
																cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none my-2"
																h="70%"
																w="70%"
																iconPath={meta?.IconPath}
															/>
															<span>{meta?.Name ?? key}</span>
														</div>
													{/each}
												</div>
											</div>
										{/if}
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
