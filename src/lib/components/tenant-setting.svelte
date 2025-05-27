<script lang="ts">
	import Icon from '@iconify/svelte';
	import Icons from './icons.svelte';
	import InfoIcon from './infoIcon.svelte';

	let { groupedSettings, onSubmit, commonSetting = $bindable(), edit } = $props();

	// $inspect(commonSetting, 'commonSetting');
	let settingsCopy = $state({});
	let disabled = $state(true);
	let openTab: string | null = $state(null);

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
<div class="flex flex-col py-4">
	{#each Object.entries(commonSetting) as [groupName, groupItems]}
		{#if groupName !== 'UserInterfaces'}
			<div class="mb-4 rounded-md border shadow-sm">
				<button
					type="button"
					onclick={() => toggleTab(groupName)}
					class="sidebar-itm flex w-full items-center justify-between bg-gray-100 px-4 py-2 hover:bg-gray-200"
				>
					<div class="flex items-center gap-2 font-medium capitalize">
						<Icons
							cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none w-14"
							h="100%"
							w="100%"
							iconPath=""
						/>
						<span>{groupName}</span>
						<InfoIcon
							cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 cursor-pointer fill-none"
							h="100%"
							w="100%"
							iconPath="/tenant-setting/info.svg#icon"
							title={`Settings under ${groupName}`}
						/>
					</div>
					<!-- <span class:rotate-180={openTab === groupName} class="transition-transform duration-300"> -->
					<span class="transition-transform duration-300" class:rotate-180={openTab === groupName}>
						<Icon icon="icon-park-outline:down" width="16" height="16" class="h-5 w-5" />
					</span>
				</button>

				{#if openTab === groupName}
					<div class="grid grid-cols-1 gap-3 bg-white p-4 md:grid-cols-2">
						{#each Object.entries(groupItems) as [key, value]}
							{@const meta = getSettingMeta(groupName, key)}
							<div class="flex">
								{#if edit === true}
									<span class="tick text-green-500">✔</span>
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
									cls="stroke-slate-800 dark:!stroke-surface-100 stroke-2 fill-none"
									h="70%"
									w="70%"
									iconPath={meta?.IconPath}
								/>
								<span class="font-medium">{meta?.Name ?? key}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/each}
</div>
