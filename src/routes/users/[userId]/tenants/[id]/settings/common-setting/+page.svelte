<script lang="ts">
	import ExpandableSettings from '$lib/components/tenant-setting.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from '../$types';
	import { page } from '$app/state';
	import { commonUISettings } from './common-setting.types';

	/////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let commonSetting = $state(data.settings);

	const userId = page.params.userId;
	const tenantRoute = `/users/${userId}/tenants`;
	let promise = $state();
	function handleCommonSettingSubmit(event, updated) {
		event.preventDefault();
		console.log('New settings:', updated);
		commonSetting = updated;
		// Call your API here
	}

	let disabled = $state(true);
	let edit = $derived(disabled);
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
			<form onsubmit={() => handleCommonSettingSubmit(event, commonSetting)}>
				<table class="table-c">
					<thead>
						<tr>
							<th>
								<div class="flex justify-between">
									<h1 class="py-2 text-lg">Common Setting</h1>

									<a href={tenantRoute} class="cancel-btn">
										<Icon icon="material-symbols:close-rounded" />
									</a>
								</div>
							</th></tr
						>
					</thead>
					<tbody>
						<ExpandableSettings
							groupedSettings={commonUISettings}
							bind:commonSetting
							{edit}
							{tenantRoute}
						/>
					</tbody>
				</table>
			</form>
		</div>
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
