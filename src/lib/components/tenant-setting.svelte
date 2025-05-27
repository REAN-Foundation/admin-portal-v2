<script lang="ts">
	import { onMount } from 'svelte';
	import Icons from './icons.svelte';
	import InfoIcon from './infoIcon.svelte';

	type SettingItem = {
		label: string;
		icon: string;
		info: string;
		value: boolean;
	};

	type GroupedSettings = Record<string, Record<string, SettingItem>>;

	let {
		groupedSettings,
		onSubmit,
		commonSettingsGroups
	}: {
		groupedSettings: GroupedSettings;
		onSubmit: (updated: Record<string, Record<string, boolean>>) => void;
		commonSettingsGroups: string[];
	} = $props();

	let settingsCopy: GroupedSettings = $state({});
	let disabled = $state(true);
	let openTab: string | null = $state(null);

	function deepCopy(obj: any) {
		return JSON.parse(JSON.stringify(obj));
	}

	onMount(() => {
		settingsCopy = deepCopy(groupedSettings);
		openTab = commonSettingsGroups[0];
	});

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}

	function updateSetting(group: string, key: string, value: boolean) {
		settingsCopy[group][key].value = value;
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
</script>

<div class="space-y-4 p-4">
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
	</div>

	{#each commonSettingsGroups as group}
		<div class="rounded-md border shadow-sm">
			<button
				type="button"
				onclick={() => toggleTab(group)}
				class="flex w-full items-center justify-between bg-gray-100 px-4 py-2 hover:bg-gray-200"
			>
				<div class="flex items-center gap-2 font-medium capitalize">
					<Icons
						cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none w-14 "
						h="100%"
						w="100%"
						iconPath={group.icon}
					/>
					{group}
					<InfoIcon
						cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none"
						h="100%"
						w="100%"
						iconPath="/tenant-setting/info.svg#icon"
						title={`Settings under ${group}`}
					/>
				</div>
				<span class:rotate-180={openTab === group} class="transition-transform duration-300">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</span>
			</button>

			{#if openTab === group}
				<div class="grid grid-cols-1 gap-3 bg-white p-4 md:grid-cols-2">
					{#each Object.entries(settingsCopy[group]) as [key, item]}
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								class="checkbox checkbox-primary"
								bind:checked={item.value}
								{disabled}
								onchange={(e) => updateSetting(group, key, e.target.checked)}
							/>
							<Icons
								cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none"
								h="90%"
								w="90%"
								iconPath={item.icon}
							/>
							<span class="font-medium">{key}</span>
							<InfoIcon
								cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none"
								h="90%"
								w="90%"
								iconPath="/tenant-setting/info.svg#icon"
								title={item.info}
							/>
						</label>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
