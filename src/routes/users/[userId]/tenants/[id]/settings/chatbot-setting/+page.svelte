<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';

	let { data, form } = $props();
	console.log('this is data of followup setting', data);
	let errors: Record<string, string> = $state({});

	let chatBotSetting = $state(data.settings);
	let promise = $state();
	const userId = page.params.userId;
	const tenantRoute = `/users/${userId}/tenants`;
	// $inspect('This is commonSetting from data', JSON.stringify(commonSetting, null, 2));

	function handleSettingsSubmit(updated) {
		console.log('New settings:', updated);
		chatBotSetting = updated;
		// Call your API here
	}

    let botName = $state(undefined);
    let description = $state(undefined);
    let defaultLanguage = $state(undefined);
    
	let disabled = $state(true);
	let edit = $derived(disabled);
	const handleSubmit = async (event: Event) => {
		// try {
		// 	event.preventDefault();
		// 	errors = {};
		// 	const healthSystemCreateModel: HealthSystemCreateModel = {
		// 		Name: healthSystemName,
		// 		Tags: keywords
		// 	};
		// 	const validationResult = createOrUpdateSchema.safeParse(healthSystemCreateModel);
		// 	if (!validationResult.success) {
		// 		errors = Object.fromEntries(
		// 			Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
		// 				key,
		// 				val?.[0] || 'This field is required'
		// 			])
		// 		);
		// 		return;
		// 	}
		// 	const res = await fetch(`/api/server/health-systems`, {
		// 		method: 'POST',
		// 		body: JSON.stringify(healthSystemCreateModel),
		// 		headers: { 'content-type': 'application/json' }
		// 	});
		// 	const response = await res.json();
		// 	if (response.HttpCode === 201 || response.HttpCode === 200) {
		// 		toastMessage(response);
		// 		goto(`${healthSystemsRoute}/${response?.Data?.HealthSystem?.id}/view`);
		// 		return;
		// 	}
		// 	if (response.Errors) {
		// 		errors = response?.Errors || {};
		// 	} else {
		// 		toastMessage(response);
		// 	}
		// } catch (error) {
		// 	toastMessage();
		// }
	};
</script>

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Chat Bot Setting</th>
							<th class="text-end">
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
									class="health-system-input {form?.errors?.botName ? 'input-text-error' : ''}"
									name="botName"
									placeholder="Enter name here..."
									bind:value={botName}
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr class="">
							<td>Description</td>
							<td>
								<textarea
									bind:value={description}
									name="description"
									placeholder="Enter description here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Default Language <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.defaultLanguage
										? 'input-text-error'
										: ''}"
									name="defaultLanguage"
									placeholder="Enter name here..."
									bind:value={defaultLanguage}
								/>
								{#if errors?.DefaultLanguage}
									<p class="text-error">{errors?.DefaultLanguage}</p>
								{/if}
							</td>
						</tr>
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
