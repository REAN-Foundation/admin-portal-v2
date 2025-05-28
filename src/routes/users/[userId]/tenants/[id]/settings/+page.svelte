<script lang="ts">
	import type { PageServerData } from './$types';

	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';

	/////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	console.log('data =>', data);

	// let isPatientAppChecked = $state(data.settings.PatientApp);
	// let isChatbotChecked = $state(data.settings.ChatBot);
	// let isFormsChecked = $state(data.settings.Forms);

	let disabled = $state(true);
	let edit = $derived(disabled);
	let promise = $state();

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;

	// const breadCrumbs = [
	// 	{
	// 		name: 'Tenants',
	// 		path: tenantRoute
	// 	},
	// 	{
	// 		name: 'Settings',
	// 		path: viewRoute
	// 	}
	// ];

	// let tabs = ['Common Settings', 'Chatbot Settings', 'Forms Settings', 'Patient App Settings'];
	// let tabs = [
	// 	{ name: 'Common Settings', path: `${tenantRoute}/${tenantId}/settings/common-setting` },
	// 	{ name: 'Chatbot Settings', path: `${tenantRoute}/${tenantId}/settings/chatbot-setting` },
	// 	{ name: 'Forms Settings', path: `${tenantRoute}/${tenantId}/settings/form-setting` },
	// 	{ name: 'Patient App Settings', path:`${tenantRoute}/${tenantId}/settings/patient-app-setting` }
	// ];
	// let activeTab = $state('Common Settings');

	// function selectTab(tab) {
	// 	activeTab = tab;
	// }

	const handleSubmit = (e) => {};
</script>

<!-- <BreadCrumbs crumbs={breadCrumbs} /> -->

<div class="px-6 py-2">
	<!--	<div class=" border-b my-3">
	<div class="flex space-x-6 px-4 pt-4">
		{#each tabs as tab}
			<button
				class="pb-2 text-sm font-medium transition-colors duration-200"
				class:selected={activeTab === tab.name}
				onclick={() => selectTab(tab)}
			>
				<a href={tab.path}>
					<span
						class='text-gray-600 hover:text-black hover:border-b-2 hover:border-gray-400'
					>
						{tab.name}
					</span>
				</a>
			</button>
		{/each}
	</div>
</div> -->
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
						<tr>
							<td>
								<!-- {#if edit === true && isPatientAppChecked === true}
									<span class="tick ml-10 text-green-500">✔</span>
								{:else}
									<input
										type="checkbox"
										name="patientApp"
										{disabled}
										bind:checked={isPatientAppChecked}
										class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
									/>
								{/if} -->
							</td>
							<td>Patient App</td>
						</tr>
						<tr>
							<td>
								<!-- {#if edit === true && isChatbotChecked === true}
									<span class="tick ml-10 text-green-500">✔</span>
								{:else}
									<input
										type="checkbox"
										name="chatBot"
										{disabled}
										bind:checked={isChatbotChecked}
										class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
									/>
								{/if} -->
							</td>
							<td class="ml-4">Chat bot</td>
						</tr>
						<tr>
							<td>
								<!-- {#if edit === true && isFormsChecked === true}
									<span class="tick ml-10 text-green-500">✔</span>
								{:else}
									<input
										type="checkbox"
										name="form"
										{disabled}
										bind:checked={isFormsChecked}
										class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-10"
									/>
								{/if} -->
							</td>
							<td class="ml-4">Forms</td>
						</tr>
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
