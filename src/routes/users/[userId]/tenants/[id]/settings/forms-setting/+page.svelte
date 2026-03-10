<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import Icons from '$lib/components/icons.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import type { FormsSettings } from '$lib/types/tenant.settings.types';
	import { FormsSettingsSchema } from '$lib/validation/tenant.settings.schema';
	import { formsUISettings } from './forms-setting.types';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';
	import SettingsFooter from '$lib/components/settings/settings-footer.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const settingsRoute = `/users/${userId}/tenants/${tenantId}/settings`;

	let formSetting = $state({ Forms: data.settings });
	let errors: Record<string, string> = $state({});
	let openTab: string | null = $state(null);

	let disabled = $state(data.isFormsEnabled);
	let edit = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');

	let hasUnsavedChanges = $derived(
		edit && JSON.stringify($state.snapshot(formSetting)) !== originalSnapshot
	);

	beforeNavigate((navigation) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	const handleToggleEdit = () => {
		if (!disabled) {
			addToast({
				message: 'This setting is disabled. Please update it from the main settings.',
				type: 'warning',
				timeout: 3000
			});
			return;
		}
		edit = true;
		originalSnapshot = JSON.stringify($state.snapshot(formSetting));
		addToast({
			message: 'Edit mode enabled.',
			type: 'info',
			timeout: 3000
		});
	};

	const handleCancelEdit = () => {
		formSetting = JSON.parse(originalSnapshot);
		edit = false;
		errors = {};
		addToast({
			message: 'Edit mode disabled.',
			type: 'info',
			timeout: 3000
		});
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
					type: 'warning',
					timeout: 3000
				});
				return;
			}
			isSubmitting = true;
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
				isSubmitting = false;
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
				isSubmitting = false;
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
			isSubmitting = false;
		} catch (error) {
			toastMessage();
			isSubmitting = false;
		}
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto">
		<div class=" mx-auto my-6 border border-[var(--color-outline)]">
			<form onsubmit={async (event) => handleSubmit(event)}>
				<SettingsPageHeader
					title="Forms Settings"
					description="Configure form integrations and features."
					isEditing={edit}
					featureEnabled={disabled}
					{hasUnsavedChanges}
					closeHref={settingsRoute}
					onToggleEdit={handleToggleEdit}
					onCancelEdit={handleCancelEdit}
				/>

				<div class="flex flex-col space-y-4 px-4 py-4">
					{#each Object.entries(formSetting.Forms) as [groupName, groupItems]}
						{#if groupName == 'Integrations'}
							<div
								class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
									openTab === groupName ? 'border-hover ' : ''
								} `}
							>
								<button
									type="button"
									onclick={() => toggleTab(groupName)}
									class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
											transition-all duration-100 ease-in-out  ${
												openTab === groupName
													? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
													: `border-hover rounded bg-[var(--color-secondary)]`
											}
										`}
								>
									<div class="flex flex-1 items-center gap-2">
										<Icons
											cls="my-2 stroke-2 "
											h="80%"
											w="80%"
											iconPath={iconPaths[groupName] ?? ''}
										/>
										<div class=" text-start">
											<p class="text-md font-medium text-[var(--color-info)]">Integrations</p>

											<p class=" text-sm text-[var(--color-info)]">
												Connect with external form platforms and data collection services.
											</p>
										</div>
									</div>

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
									<div
										class="flex w-full justify-center bg-[var(--color-secondary)] px-4 py-5 sm:px-6 md:px-10 lg:px-20"
									>
										<div
											class="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:gap-x-10"
										>
											{#each Object.entries(groupItems) as [key, value]}
												{@const meta = getSettingMeta(groupName, key)}

												<div
													class=" border-hover rounded-xl border bg-[var(--color-secondary)] p-4 text-[var(--color-info)]"
												>
													<div class="flex items-center justify-between gap-3">
														<Icon
															icon={meta.Path}
															class="hidden h-5 w-5 text-[var(--color-info)] md:block"
														/>

														<div class="flex flex-grow flex-col">
															<span class="text-sm font-medium text-[var(--color-info)]"
																>{meta?.Name ?? key}</span
															>
															<p class="text-sm text-[var(--color-info)]">
																{meta.Description}
															</p>
														</div>

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
								<div class=" border-hover my-2 rounded-xl border p-6 text-[var(--color-info)]">
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
				<SettingsFooter isEditing={edit} {isSubmitting} onCancel={handleCancelEdit} />
			</form>
		</div>
	</div>
</div>
