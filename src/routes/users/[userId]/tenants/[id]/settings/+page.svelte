<script lang="ts">
	import type { PageServerData } from './$types';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { UserInterfacesSchema } from '$lib/validation/tenant.settings.schema';

	/////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let setttings = data.settings.Common;
	let errors: Record<string, string> = $state({});
	$inspect(setttings)

	// let disabled = $state(true);
	let disabled = $state(true);
	let promise = $state();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;
	// let disabled = $state(data.commonSettings.UserInterfaces.ChatBot);
	// let edit = $state(false);

	const toggleEdit = async () => {
		// if (disabled) {
		if (disabled) {
			addToast({
				message: 'Edit mode enabled',
				type: 'info',
				timeout: 3000
			});
			disabled = false;
		} else {
			addToast({
				message: 'Settings saved successfully',
				type: 'success',
				timeout: 3000
			});
			disabled = true;
		}
		// } else if (!disabled) {
		// 	addToast({
		// 		message: 'This setting is disabled. Please update it from the main settings.',
		// 		type: 'warning',
		// 		timeout: 3000
		// 	});
		// 	return;
		// }
	};
	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		console.log("I am in settings page",setttings);
		try {
			errors = {};

			// if (setttings.UserInterfaces.ChatBot === false) {
			// 	Object.keys(setttings.ChatBot).forEach((key) => {
			// 		setttings.ChatBot[key] = false;
			// 	});
			// }

			// if (setttings.UserInterfaces.Forms === false) {
			// 	Object.keys(setttings.Forms).forEach((key) => {
			// 		setttings.Forms[key] = false;
			// 	});
			// }

			// if (setttings.UserInterfaces.Followup === false) {
			// 	setttings.Followup.Source = 'None';
			// }

			const validationResult = UserInterfacesSchema.safeParse(setttings.UserInterfaces);
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
				body: JSON.stringify(setttings),
				headers: { 'content-type': 'application/json' }
			});
			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// disabled = false;
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
	<!-- <div class="mb-2 flex w-full flex-wrap justify-end gap-2">
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
		<div class="border border-zinc-200">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<div class="flex items-center justify-between rounded-t-lg bg-[#F2F3F5] px-5 py-6">
					<h2 class=" text-gray-800l text-lg font-semibold">Integrations</h2>
					<div class="flex items-center gap-2 text-end">
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1"
							onclick={toggleEdit}
						>
							<Icon icon="material-symbols:edit-outline" />
							<span>{disabled ? 'Edit' : 'Save'}</span>
						</button>
						<a
							href={tenantRoute}
							class="inline-flex items-center justify-center rounded-md border-[0.5px] !border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
						>
							<Icon icon="material-symbols:close-rounded" class=" h-5" />
						</a>
					</div>
				</div>

				<div class="flex flex-col space-y-4 px-5 py-4">
					{#each Object.entries(setttings.UserInterfaces) as [key, value]}
						{#if key === 'ChatBot'}
							<div class="flex items-center space-x-4">
								<input
									type="checkbox"
									name="patientApp"
									{disabled}
									bind:checked={setttings.UserInterfaces[key]}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
								/>
								<span>Chat Bot</span>
							</div>
						{:else if key === 'Followup'}
							<div class="flex items-center space-x-4">
								<input
									type="checkbox"
									name="followup"
									{disabled}
									bind:checked={setttings.UserInterfaces[key]}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
								/>
								<span>Follow-up</span>
							</div>
						{:else if key === 'Forms'}
							<div class="flex items-center space-x-4">
								<input
									type="checkbox"
									name="forms"
									{disabled}
									bind:checked={setttings.UserInterfaces[key]}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
								/>
								<span>Forms</span>
							</div>
						{:else if key === 'PatientApp'}
							<div class="flex items-center space-x-4">
								<input
									type="checkbox"
									name="patientApp"
									disabled
									bind:checked={setttings.UserInterfaces[key]}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
								/>
								<span>Patient App</span>
							</div>
						{:else if key === 'PatientPortal'}
							<div class="flex items-center space-x-4">
								<input
									type="checkbox"
									name="patientPortal"
									disabled
									bind:checked={setttings.UserInterfaces[key]}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
								/>
								<span>Patient Portal</span>
							</div>
						{/if}
					{/each}
				</div>

				<hr class="border-t border-[#F2F3F5]" />

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
