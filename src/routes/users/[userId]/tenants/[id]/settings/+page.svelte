<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { UserInterfacesSchema } from '$lib/validation/tenant.settings.schema';

	/////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let commonSettings = $state(data.commonSettings);
	let errors: Record<string, string> = $state({});

	let disabled = $state(true);
	let promise = $state();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;

	const handleEditClick = async () => {
		disabled = !disabled;
		// if (disabled) {
		// if (disabled) {
		// 	addToast({
		// 		message: 'Edit mode enabled',
		// 		type: 'info',
		// 		timeout: 3000
		// 	});
		// 	disabled = false;
		// } else {
		// 	addToast({
		// 		message: 'Settings saved successfully',
		// 		type: 'success',
		// 		timeout: 3000
		// 	});
		// 	disabled = true;
		// }
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		console.log('I am in settings page', commonSettings.Wellness);
		try {
			if (disabled) {
				addToast({
					message: 'Nothing to edit !',
					type: 'warning',
					timeout: 3000
				});
				return;
			}

			errors = {};

			const validationResult = UserInterfacesSchema.safeParse(commonSettings.UserInterfaces);
			console.log(validationResult);

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
				toastMessage(response);
				disabled = true;
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

<div class="my-8 px-5 py-2">
	<div class="mx-auto">
		<div class="border border-[var(--color-outline)]">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<div
					class="flex items-center justify-between rounded-t-lg bg-[var(--color-primary)] px-5 py-6"
				>
					<h2 class=" text-gray-800l text-lg font-semibold text-[var(--color-info)] ">
						Integrations
					</h2>
					<div class="flex items-center gap-2 text-end">
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={handleEditClick}
						>
							<Icon icon="material-symbols:edit-outline" />
							<!-- <span>{disabled ? 'Edit' : 'Save'}</span> -->
						</button>
						<a
							href={tenantRoute}
							class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
						>
							<Icon icon="material-symbols:close-rounded" class=" h-5" />
						</a>
					</div>
				</div>

				<div
					class="flex w-full justify-center bg-[var(--color-secondary)] px-4 py-5 sm:px-6 md:px-10 lg:px-20"
				>
					<div
						class="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:gap-x-10"
					>
						{#each Object.entries(commonSettings.UserInterfaces) as [key, value]}
							{#if key === 'ChatBot'}
								<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<!-- Left: App Icon -->
										<Icon icon="tabler:message-chatbot" class="hidden h-5 w-5 md:block" />

										<!-- Middle: Name & Description -->
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Chatbot</span>
											<p class="text-sm">AI-powered chatbot for automated patient interaction.</p>
										</div>
										<!-- Right: Toggle + Optional Edit -->
										<div class="flex items-center">
											<input
												type="checkbox"
												name="patientApp"
												class="checkbox checkbox-primary scale-125 cursor-pointer"
												{disabled}
												bind:checked={commonSettings.UserInterfaces[key]}
											/>
										</div>
									</div>
								</div>
							{:else if key === 'Followup'}
								<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<!-- Left: App Icon -->
										<Icon icon="carbon:task-tools" class="hidden h-5 w-5 md:block" />

										<!-- Middle: Name & Description -->
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Followup</span>
											<p class="text-sm">Automated follow-up and reminder system.</p>
										</div>
										<!-- Right: Toggle + Optional Edit -->
										<div class="flex items-center">
											<input
												type="checkbox"
												name="followup"
												{disabled}
												bind:checked={commonSettings.UserInterfaces[key]}
												class="checkbox checkbox-primary scale-125 cursor-pointer"
											/>
										</div>
									</div>
								</div>
							{:else if key === 'Forms'}
								<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<!-- Left: App Icon -->
										<Icon icon="mdi:form-select" class="hidden h-5 w-5 md:block" />

										<!-- Middle: Name & Description -->
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Forms</span>
											<p class="text-sm">Digital forms for data collection and surveys.</p>
										</div>
										<!-- Right: Toggle + Optional Edit -->
										<div class="flex items-center">
											<input
												type="checkbox"
												name="forms"
												{disabled}
												bind:checked={commonSettings.UserInterfaces[key]}
												class="checkbox checkbox-primary scale-125 cursor-pointer"
											/>
										</div>
									</div>
								</div>
							{:else if key === 'PatientApp'}
								<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<!-- Left: App Icon -->
										<Icon icon="fluent:phone-tablet-20-regular" class="hidden h-5 w-5 md:block" />

										<!-- Middle: Name & Description -->
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Patient App</span>
											<p class="text-sm">
												Mobile application for patient self-service and health management.
											</p>
										</div>
										<!-- Right: Toggle + Optional Edit -->
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
								<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
									<div class="flex items-center justify-between gap-3">
										<!-- Left: App Icon -->
										<Icon icon="mdi:account-circle-outline" class="hidden h-5 w-5 md:block" />

										<!-- Middle: Name & Description -->
										<div class="flex flex-grow flex-col">
											<span class="text-sm font-medium">Patient Portal</span>
											<p class="text-sm">Web-based portal for patient access to health records.</p>
										</div>
										<!-- Right: Toggle + Optional Edit -->
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
				</div>

				<hr class="border-[0.5px] border-t border-[var(--color-outline)]" />

				<div class="button-container my-4">
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
