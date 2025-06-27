<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import Icons from '$lib/components/icons.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { FormsSettings } from '$lib/types/tenant.settings.types';
	import { FormsSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { formsUISettings } from './forms-setting.types';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants/${tenantId}/settings/forms-setting`;

	let formSetting = $state({ Forms: data.settings });
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let openTab: string | null = $state(null);

	let disabled = $state(data.isFormsEnabled);
	let edit = $state(false);

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
		// if (disabled) {
		// 	if (edit) {
		// 		addToast({
		// 			message: 'Settings saved successfully',
		// 			type: 'success',
		// 			timeout: 3000
		// 		});
		// 		edit = false;
		// 	} else {
		// 		edit = true;
		// 		addToast({
		// 			message: 'Edit mode enabled',
		// 			type: 'info',
		// 			timeout: 3000
		// 		});
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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			console.log('edit', edit);
			if (!edit) {
				addToast({
					message: 'Nothing to edit !',
					type: 'info',
					timeout: 3000
				});
				return;
			}
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
				toastMessage(response);
				edit = false;
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
	<!-- <div class="flex flex-wrap justify-end gap-2 py-2">
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
	</div> -->

	<div class="mx-auto">
		<div class=" mx-auto my-6 border !border-zinc-200">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<div
					class="flex items-center justify-between !rounded-b-none border bg-[#F2F3F5] px-5 py-6"
				>
					<h1 class=" text-xl">Forms Settings</h1>
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

				<div class="flex flex-col space-y-4 px-4 py-4">
					{#each Object.entries(formSetting.Forms) as [groupName, groupItems]}
						{#if groupName == 'Integrations'}
							<div
								class={`my-2 flex w-full flex-col rounded-md border !border-zinc-100 bg-white !p-0 py-2 transition-colors duration-200 ${
									openTab === groupName ? 'border-hover ' : ''
								} `}
							>
								<button
									type="button"
									onclick={() => toggleTab(groupName)}
									class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-gray-700
											transition-all duration-100 ease-in-out  ${
												openTab === groupName
													? 'rounded-b-none bg-[#F2F2F2] text-black'
													: `border-hover rounded bg-white`
											} 
										`}
								>
									<div class="flex flex-1 items-center gap-2">
										<Icons
											cls="stroke-slate-800 my-2 stroke-2 fill-none"
											h="80%"
											w="80%"
											iconPath={iconPaths[groupName] ?? ''}
										/>
										<div class=" text-start">
											<p class="text-md font-medium">Integrations</p>

											<p class=" text-sm">Connect with external form platforms and data collection services.</p>
										</div>
									</div>

									<!-- <span class:rotate-180={openTab === groupName} class="transition-transform duration-300"> -->
									<span
										class="transition-transform duration-300"
										class:rotate-90={openTab === groupName}
									>
										<Icon
											icon="icon-park-outline:down"
											rotate={35}
											width="16"
											height="16"
											class="h-5 w-5"
										/>
									</span>
								</button>

								{#if openTab === groupName}
									<div class="flex w-full justify-center px-4 py-5 sm:px-6 md:px-10 lg:px-20">
										<div
											class="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:gap-x-10"
										>
											{#each Object.entries(groupItems) as [key, value]}
												{@const meta = getSettingMeta(groupName, key)}

												<!-- <div class="flex items-center gap-3"> -->
												<!-- {#if edit === true && formSetting.Forms[groupName][key] === true}
														<span class="text-green-500">✅</span>
													{:else if edit === true && formSetting.Forms[groupName][key] !== true}
														<span class="text-sm">❌</span>
													{:else}
														<label class="flex items-center gap-2">
															<input
																type="checkbox"
																class="checkbox checkbox-primary"
																disabled={edit}
																bind:checked={formSetting.Forms[groupName][key]}
															/>
														</label>
													{/if} -->
												<!-- <Icons
														cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none my-2"
														h="70%"
														w="70%"
														iconPath={meta?.IconPath}
													/> -->
												<!-- <span>{meta?.Name ?? key}</span>
												</div> -->

												<div class=" border-hover rounded-xl border p-4 text-gray-700">
													<div class="flex items-center justify-between gap-3">
														<!-- Left: App Icon -->
														<!-- <Icon icon="mdi:vector-link" class="hidden h-5 w-5 md:block" /> -->
														<Icon icon={meta.Path} class="hidden h-5 w-5 md:block" />

														<!-- Middle: Name & Description -->
														<div class="flex flex-grow flex-col">
															<span class="text-sm font-medium">{meta?.Name ?? key}</span>
															<p class="text-sm">
																<!-- short description for {meta?.Name ?? key}. -->
                                                                 {meta.Description}
															</p>
														</div>

														<!-- Right: Toggle + Optional Edit -->
														<div class="flex items-center">
															<input
																type="checkbox"
																class="checkbox checkbox-primary scale-125 cursor-pointer"
																bind:checked={formSetting.Forms[groupName][key]}
																disabled={!edit}
															/>
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					{/each}

					<div class=" grid gap-4 md:grid-cols-2">
						{#each Object.entries(formSetting.Forms) as [groupName, groupItems]}
							{#if typeof groupItems === 'boolean'}
								<!-- <div class="flex items-center gap-2 px-1">
								{#if edit === true && groupItems === true}
									<span class="text-green-500">✅</span>
								{:else if edit === true && groupItems !== true}
									<span>❌</span>
								{:else}
									<input
										type="checkbox"
										class="checkbox checkbox-primary"
										disabled={!edit}
										bind:checked={formSetting.Forms[groupName]}
									/>
								{/if}
								<Icons
									cls="stroke-slate-800 my-2 stroke-2 fill-none"
									h="80%"
									w="80%"
									iconPath={iconPaths[groupName] ?? ''}
								/>
								<div class=" text-start">
									<p class="text-md font-medium">{groupName}</p>

									<p class=" text-sm">Settings under {groupName}</p>
								</div>
							</div> -->

								<!-- <div class="flex items-center justify-end gap-2">
								<InfoIcon
									cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none my-2"
									h="80%"
									w="80%"
									iconPath="/tenant-setting/info.svg#icon"
									title={`Settings under ${groupName}`}
								/>
							</div> -->

								<div class=" border-hover rounded-xl border p-4 text-gray-700">
									<div class="flex items-center justify-between gap-3">
										<!-- Left: App Icon -->
										<Icon icon={formsUISettings[groupName].Path} class="h-5 w-5" />

										<!-- Middle: Name & Description -->
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">{formsUISettings[groupName].Name}</span>
											<p class="text-sm">
												{formsUISettings[groupName].Description}
											</p>
										</div>

										<!-- Right: Toggle + Optional Edit -->
										<div class="flex items-center">
											<input
												type="checkbox"
												class="checkbox checkbox-primary scale-125 cursor-pointer"
												bind:checked={formSetting.Forms[groupName]}
												disabled={!edit}
											/>
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
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
