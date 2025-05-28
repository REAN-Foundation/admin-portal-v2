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
		<form>
			<table class="table-c">
				<thead>
					<tr>
						<th> Common Setting </th>

						<th class="text-end">
							<a href={tenantRoute} class="cancel-btn">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(commonSetting) as [groupName, groupItems]}
						{#if groupName !== 'UserInterfaces'}
							<tr>
								<td class="!w-full">
									<button
										type="button"
										onclick={() => toggleTab(groupName)}
										class="sidebar-item flex w-full items-center justify-between"
									>
										<div class="flex items-center gap-2">
											<Icons
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none w-14"
												h="100%"
												w="100%"
												iconPath=""
											/>
											<span class="flex-1">{groupName}</span>
											<InfoIcon
												cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none"
												h="100%"
												w="100%"
												iconPath="/tenant-setting/info.svg#icon"
												title={`Settings under ${groupName}`}
											/>
										</div>
										<!-- <span class:rotate-180={openTab === groupName} class="transition-transform duration-300"> -->
										<span
											class="transition-transform duration-300"
											class:rotate-180={openTab === groupName}
										>
											<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
										</span>
									</button>

									{#if openTab === groupName}
										<div class="mx-5 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
											{#each Object.entries(groupItems) as [key, value]}
												{@const meta = getSettingMeta(groupName, key)}
												<div class="flex items-center">
													{#if edit === true && value.Enabled === true}
														<span class="tick  text-green-500">✔</span>
													{:else}
														<!-- {groupItems[key].value}
								{JSON.stringify(value)} -->
														<!-- {value.Enabled} -->
														<label class="flex items-center gap-2">
															<input
																type="checkbox"
																class="checkbox checkbox-primary"
																bind:checked={value.Enabled}
																disabled={edit}
															/>
														</label>
													{/if}
													<Icons
														cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none my-2"
														h="70%"
														w="70%"
														iconPath={meta?.IconPath}
													/>
													<span class="font-medium">{meta?.Name ?? key}</span>
												</div>
											{/each}
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
