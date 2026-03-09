<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { UserInterfacesSchema } from '$lib/validation/tenant.settings.schema';
	import SettingsPageHeader from '$lib/components/settings/settings-page-header.svelte';
	import SettingsSection from '$lib/components/settings/settings-section.svelte';
	import SettingsFooter from '$lib/components/settings/settings-footer.svelte';
	import { tenantSettingsStore } from '$lib/store/general.store';
	import { get } from 'svelte/store';

	/////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let commonSettings = $state(data.commonSettings);
	let errors: Record<string, string> = $state({});

	let isEditing = $state(false);
	let isSubmitting = $state(false);
	let originalSnapshot = $state('');

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;

	let hasUnsavedChanges = $derived(
		isEditing && JSON.stringify(commonSettings?.UserInterfaces) !== originalSnapshot
	);

	beforeNavigate((navigation) => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	const handleToggleEdit = () => {
		isEditing = true;
		originalSnapshot = JSON.stringify(commonSettings?.UserInterfaces);
		addToast({ message: 'Edit mode enabled.', type: 'info', timeout: 3000 });
	};

	const handleCancelEdit = () => {
		commonSettings.UserInterfaces = JSON.parse(originalSnapshot);
		isEditing = false;
		errors = {};
		addToast({ message: 'Edit mode disabled.', type: 'info', timeout: 3000 });
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		if (!isEditing) {
			addToast({ message: 'Nothing to edit !', type: 'warning', timeout: 3000 });
			return;
		}

		try {
			errors = {};
			isSubmitting = true;

			const validationResult = UserInterfacesSchema.safeParse(commonSettings.UserInterfaces);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/tenants/settings/${tenantId}/Common`, {
				method: 'PUT',
				body: JSON.stringify(commonSettings),
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				// Update tenant settings store so sidebar reacts immediately
				const currentSettings = get(tenantSettingsStore);
				if (currentSettings) {
					tenantSettingsStore.set({ ...currentSettings, Common: $state.snapshot(commonSettings) });
				}
				toastMessage(response);
				isEditing = false;
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="px-5 py-4">
	<div class="mx-auto my-6 border border-[var(--color-outline)]">
		<form onsubmit={handleSubmit}>
			<SettingsPageHeader
				title="Integrations"
				description="Enable or disable system integrations for this tenant."
				bind:isEditing
				{hasUnsavedChanges}
				closeHref={tenantRoute}
				onToggleEdit={handleToggleEdit}
				onCancelEdit={handleCancelEdit}
			/>

			<div class="px-5 py-5">
				<SettingsSection title="User Interfaces" description="Toggle which interfaces are available for this tenant.">
					<div
						class="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:gap-x-10"
					>
						{#each Object.entries(commonSettings.UserInterfaces) as [key, value]}
							{#if key === 'ChatBot'}
								<div class="border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<Icon icon="tabler:message-chatbot" class="hidden h-5 w-5 md:block" />
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Chatbot</span>
											<p class="text-sm opacity-70">AI-powered chatbot for automated patient interaction.</p>
										</div>
										<div class="flex items-center">
											<input
												type="checkbox"
												name="patientApp"
												class="checkbox checkbox-primary scale-125 cursor-pointer"
												disabled={!isEditing}
												bind:checked={commonSettings.UserInterfaces[key]}
											/>
										</div>
									</div>
								</div>
							{:else if key === 'Followup'}
								<div class="border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<Icon icon="carbon:task-tools" class="hidden h-5 w-5 md:block" />
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Followup</span>
											<p class="text-sm opacity-70">Automated follow-up and reminder system.</p>
										</div>
										<div class="flex items-center">
											<input
												type="checkbox"
												name="followup"
												disabled={!isEditing}
												bind:checked={commonSettings.UserInterfaces[key]}
												class="checkbox checkbox-primary scale-125 cursor-pointer"
											/>
										</div>
									</div>
								</div>
							{:else if key === 'PatientApp'}
								<div class="border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<Icon icon="fluent:phone-tablet-20-regular" class="hidden h-5 w-5 md:block" />
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Patient App</span>
											<p class="text-sm opacity-70">
												Mobile application for patient self-service and health management.
											</p>
										</div>
										<div class="flex items-center">
											<input
												type="checkbox"
												name="patientApp"
												disabled
												bind:checked={commonSettings.UserInterfaces[key]}
												class="checkbox checkbox-primary scale-125 cursor-pointer"
											/>
										</div>
									</div>
								</div>
							{:else if key === 'PatientPortal'}
								<div class="border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<Icon icon="mdi:account-circle-outline" class="hidden h-5 w-5 md:block" />
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Patient Portal</span>
											<p class="text-sm opacity-70">Web-based portal for patient access to health records.</p>
										</div>
										<div class="flex items-center">
											<input
												type="checkbox"
												name="patientPortal"
												disabled
												bind:checked={commonSettings.UserInterfaces[key]}
												class="checkbox checkbox-primary scale-125 cursor-pointer"
											/>
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</SettingsSection>
			</div>

			<SettingsFooter
				{isEditing}
				{isSubmitting}
				onCancel={handleCancelEdit}
			/>
		</form>
	</div>
</div>
