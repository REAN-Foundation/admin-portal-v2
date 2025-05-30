<script lang="ts">
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import Icons from '$lib/components/icons.svelte';
	import InfoIcon from '$lib/components/infoIcon.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { FormsSettings } from '$lib/types/tenant.settings.types';
	import { FormsSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { formsUISettings } from './forms-setting.types';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let formSetting = $state({ Forms: data.settings });

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants/${tenantId}/settings/forms-setting`;
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let openTab: string | null = $state(null);
	let disabled = $state(true);
	let edit = $derived(disabled);

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}

	function getSettingMeta(group: string, key: string) {
		return (
			formsUISettings?.[group]?.[key] || {
				Name: key,
				IconPath: '',
				InfoText: key
			}
		);
	}

	const iconPaths = {
		Integrations: '/tenant-setting/form//integration.svg#icon',
		OfflineSupport: '/tenant-setting/form/offline.svg#icon',
		FieldApp: '/tenant-setting/form/field_app.svg#icon'
	};

	const handleFormSettingSubmit = async (event: Event) => {
		try {
			event.preventDefault();

			const formSettingUpdateModel: FormsSettings = {
				Integrations: formSetting.Forms.Integrations,
				OfflineSupport: formSetting.Forms.OfflineSupport,
				FieldApp: formSetting.Forms.FieldApp
			};

			const validationResult = FormsSettingsSchema.safeParse(formSettingUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Forms`, {
				method: 'PUT',
				body: JSON.stringify(formSettingUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				edit = disabled;
				toastMessage(response);
				disabled = true;
				edit = disabled;
				goto(`${tenantRoute}`);
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
			<form onsubmit={() => handleFormSettingSubmit(event)}>
				<table class="table-c">
					<thead>
						<tr>
							<th>
								<div class="flex justify-between">
									<h1 class="py-2 text-lg">Forms</h1>

									<a href={tenantRoute} class="cancel-btn">
										<Icon icon="material-symbols:close-rounded" />
									</a>
								</div>
							</th></tr
						>
					</thead>
					<tbody>
						{#each Object.entries(formSetting.Forms) as [groupName, groupItems]}
							{#if groupName == 'Integrations'}
								<tr>
									<td>
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
												<span class="text-base">{groupName}</span>
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
															{#if edit === true && value === true}
																<span class="text-green-500">✅</span>
															{:else if edit === true && value !== true}
																<span>❌</span>
															{:else}
																<label class="flex items-center gap-2">
																	<input
																		type="checkbox"
																		class="checkbox checkbox-primary"
																		disabled={edit}
																		bind:checked={formSetting.Forms[groupName][key]}
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
							{:else}
								<tr>
									<td>
										<div
											class="sidebar-item flex w-full items-center justify-between rounded-md bg-slate-100 px-4 py-2"
										>
											<div class="flex flex-1 items-center gap-2">
												{#if edit === true && groupItems === true}
													<span class="text-green-500">✅</span>
												{:else if edit === true && groupItems !== true}
													<span>❌</span>
												{:else}
													<label class="flex items-center gap-2">
														<input
															type="checkbox"
															class="checkbox checkbox-primary"
															disabled={edit}
															bind:checked={formSetting.Forms[groupName]}
														/>
													</label>
												{/if}
												<Icons
													cls="stroke-slate-800 my-2 stroke-2 fill-none"
													h="80%"
													w="80%"
													iconPath={iconPaths[groupName] ?? ''}
												/>
												<span class="text-base">{groupName}</span>
											</div>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none my-2"
												h="80%"
												w="80%"
												iconPath="/tenant-setting/info.svg#icon"
												title={`Settings under ${groupName}`}
											/>
										</div>

										<div class="flex w-full justify-center py-5">
											<div class="mx-20 grid w-full grid-cols-2 gap-x-10 gap-y-6 lg:grid-cols-2">
												{#each Object.entries(groupItems) as [key, value]}
													{@const meta = getSettingMeta(groupName, key)}
													<div class="flex items-center gap-3">
														{#if edit === true && value.Enabled === true}
															<span class="text-green-500">✅</span>
														{:else if edit === true && value.Enabled !== true}
															<span>❌</span>
														{:else}
															<label class="flex items-center gap-2">
																<input
																	type="checkbox"
																	class="checkbox checkbox-primary"
																	disabled={edit}
																	bind:checked={formSetting.Forms[groupName][key]}
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
									</td>
								</tr>
							{/if}
						{/each}
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
