<script lang="ts">
	import type { PageServerData } from './$types';

	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { UserInterfacesSchema } from '$lib/validation/tenant.settings.schema';

	/////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	console.log('data =>', data);

	let setttings = data.settings.Common;
	let errors: Record<string, string> = $state({});
	let disabled = $state(true);
	let edit = $derived(disabled);
	let promise = $state();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		try {
			errors = {};

			const validationResult = UserInterfacesSchema.safeParse(setttings);

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
</script>

<div class="px-6 py-2">
	<div class="mb-2 flex w-full flex-wrap justify-end gap-2">
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
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Integrations</th>
							<th class="text-end">
								<a href={tenantRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" class="" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each Object.entries(setttings.UserInterfaces) as [key, value]}
							<tr>
								<td>
									{#if key === 'ChatBot'}
										<input
											type="checkbox"
											name="patientApp"
											{disabled}
											bind:checked={setttings.UserInterfaces[key]}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
										/>
										<span>Chat Bot</span>
									{:else if key === 'Followup'}
										<input
											type="checkbox"
											name="followup"
											{disabled}
											bind:checked={setttings.UserInterfaces[key]}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
										/>
										<span>Follow-up</span>
									{:else if key === 'Forms'}
										<input
											type="checkbox"
											name="forms"
											{disabled}
											bind:checked={setttings.UserInterfaces[key]}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
										/>
										<span>Forms</span>
									{:else if key === 'PatientApp'}
										<input
											type="checkbox"
											name="patientApp"
											disabled
											bind:checked={setttings.UserInterfaces[key]}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
										/>
										<span>Patient App</span>
									{:else if key === 'PatientPortal'}
										<input
											type="checkbox"
											name="patientPortal"
											disabled
											bind:checked={setttings.UserInterfaces[key]}
											class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
										/>
										<span>Patient Portal</span>
									{/if}
								</td>
							</tr>
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
