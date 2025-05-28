<script lang="ts">
	import Icon from '@iconify/svelte';
	import Icons from './icons.svelte';
	import InfoIcon from './infoIcon.svelte';

	let { groupedSettings, onSubmit, commonSetting = $bindable(), edit, tenantRoute } = $props();

	$inspect(groupedSettings, 'commonSetting');
	let settingsCopy = $state({});
	let disabled = $state(true);
	let openTab: string | null = $state(null);

	let promise = $state();

	function deepCopy(obj: any) {
		return JSON.parse(JSON.stringify(obj));
	}

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}

	function toggleEdit() {
		disabled = !disabled;
		if (disabled) {
			settingsCopy = deepCopy(groupedSettings);
		}
	}

	function handleFormSubmit(event) {
		event.preventDefault();
		onSubmit(commonSetting);
	}
	
	function submit() {
		const payload: Record<string, Record<string, boolean>> = {};
		for (const group in settingsCopy) {
			payload[group] = {};
			for (const key in settingsCopy[group]) {
				payload[group][key] = settingsCopy[group][key].value;
			}
		}
		onSubmit(payload);
		disabled = true;
	}

	function getSettingMeta(group: string, key: string) {
		return (
			groupedSettings?.[group]?.[key] || {
				Name: key,
				IconPath: '',
				InfoText: key
			}
		);
	}

	const iconPaths = {
		Clinical: '/tenant-setting/common-setting/clinical.svg#icon',
		External: '/tenant-setting/common-setting/external.svg#icon',
		Wellness: '/tenant-setting/common-setting/external.svg#icon',
		EHR: '/tenant-setting/common-setting/ehr.svg#icon',

		Affiliations: '/tenant-setting/common-setting/external.svg#icon',
		Analysis: '/tenant-setting/common-setting/external.svg#icon',
		Community: '/tenant-setting/common-setting/external.svg#icon',

		Educational: '/tenant-setting/common-setting/external.svg#icon',
		General: '/tenant-setting/common-setting/external.svg#icon',
		Miscellaneous: '/tenant-setting/common-setting/external.svg#icon',
		Research: '/tenant-setting/common-setting/external.svg#icon'
	};
</script>

<!-- <div class="space-y-4 p-4">
	<div class="flex justify-between">
		<h2 class="text-lg font-semibold">Common Settings</h2>
		<div class="flex items-center gap-2">
			{#if !disabled}
				<button class="table-btn variant-filled-primary" onclick={submit}>Save</button>
			{/if}
			<button class="table-btn variant-filled-secondary" onclick={toggleEdit}>
				{disabled ? 'Edit' : 'Cancel'}
			</button>
		</div>
	</div> -->

<div class="mx-auto">
	<div class="table-container">
		<form onsubmit={handleFormSubmit}>
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
					{#each Object.entries(commonSetting) as [groupName, groupItems]}
						{#if groupName !== 'UserInterfaces'}
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
											<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
										</span>
									</button>

									{#if openTab === groupName}
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
															<!-- {groupItems[key].value}
								{JSON.stringify(value)} -->
															<!-- {value.Enabled} -->
															<label class="flex items-center gap-2">
																<input
																	type="checkbox"
																	class="checkbox checkbox-primary"
																	disabled={edit}
																	bind:checked={commonSetting[groupName][key].Enabled}
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
