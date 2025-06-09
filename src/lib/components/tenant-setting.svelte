<script lang="ts">
	import Icon from '@iconify/svelte';
	import InfoIcon from './infoIcon.svelte';
	import Icons from './icons.svelte';

	let { groupedSettings, commonSetting = $bindable(), edit } = $props();

	let openTab: string | null = $state(null);

	let promise = $state();

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}

	// function handleFormSubmit(event) {
	// 	event.preventDefault();
	// 	onSubmit(commonSetting);
	// }

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
		// General: '/tenant-setting/common-setting/external.svg#icon',
		Miscellaneous: '/tenant-setting/common-setting/external.svg#icon',
		Research: '/tenant-setting/common-setting/external.svg#icon'
	};
</script>

{#each Object.entries(commonSetting) as [groupName, groupItems]}
	{#if groupName !== 'UserInterfaces' && groupName !== 'General'}
		<div
			class={`sidebar-item my-2 flex w-full flex-col rounded-md border !p-0 py-2 transition-colors duration-200`}
		>
			<button
				type="button"
				onclick={() => toggleTab(groupName)}
				class={`flex items-center justify-between rounded-t-md p-4
 			 ${openTab === groupName ? ' bg-gray-200' : ''}
			`}
			>
				<div class="flex flex-1 items-center gap-2">
					<Icons
						cls="stroke-slate-800 my-2 stroke-2 fill-none"
						h="80%"
						w="80%"
						iconPath={iconPaths[groupName] ?? ''}
					/>

					<div class=" text-start">
						<p class="text-base font-semibold">{groupName}</p>

						<p class=" text-sm">Settings under {groupName}</p>
					</div>
				</div>

				<!-- <span class:rotate-180={openTab === groupName} class="transition-transform duration-300"> -->
				<span class="transition-transform duration-300" class:rotate-90={openTab === groupName}>
					<Icon icon="icon-park-outline:down" rotate="35" width="16" height="16" class="h-5 w-5" />
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
									iconPath={meta?.Path}
								/>
								<span>{meta?.Name ?? key}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
{/each}
<!-- </tbody>
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
</div> -->
