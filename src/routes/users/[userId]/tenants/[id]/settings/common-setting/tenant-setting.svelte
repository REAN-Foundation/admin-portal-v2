<script lang="ts">
	import Icon from '@iconify/svelte';

	let { groupedSettings, commonSetting = $bindable(), edit } = $props();

	let openTab: string | null = $state(null);

	let promise = $state();

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
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
		EHR: '/tenant-setting/common-setting/ehr/ehr.svg#icon',

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
			class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
				openTab === groupName ? 'border-hover ' : ''
			} `}
		>
			<button
				type="button"
				onclick={() => toggleTab(groupName)}
				class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-100 ease-in-out  ${
		openTab === groupName
			? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
			: `border-hover rounded bg-[var(--color-secondary)]`
	} 
	`}
			>
				<div class="flex flex-1 items-center gap-2">
					<!-- iconPaths[groupName] -->
					<Icon icon={groupedSettings[groupName].Path} class="hidden h-5 w-5 md:block" />
					<!-- <Icons
						cls="stroke-slate-800 my-2 stroke-2 fill-none"
						h="80%"
						w="80%"
						iconPath={iconPaths[groupName] ?? ''}
					/> -->

					<div class=" text-start">
						<p class="text-md font-medium">{groupedSettings[groupName].Name}</p>

						<p class=" text-sm">{groupedSettings[groupName].Description}</p>
					</div>
				</div>

				<!-- <span class:rotate-180={openTab === groupName} class="transition-transform duration-300"> -->
				<span class="transition-transform duration-300" class:rotate-90={openTab === groupName}>
					<Icon icon="icon-park-outline:down" rotate={35} width={16} height={16} class="h-5 w-5" />
				</span>
			</button>

			{#if openTab === groupName}
				<div
					class="flex w-full justify-center bg-[var(--color-secondary)] px-4 py-5 sm:px-6 md:px-10 lg:px-20"
				>
					<div
						class="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:gap-x-10"
					>
						{#each Object.entries(groupItems) as [key, value]}
							{@const meta = getSettingMeta(groupName, key)}
							<!-- <div class="flex items-center md:gap-3">
								{#if edit === true && value.Enabled === true}
									<span class="text-green-500">✅</span>
								{:else if edit === true && value.Enabled !== true}
									<span class="text-sm">❌</span>
								{:else}
									<label class="flex items-center md:gap-2">
										<input
											type="checkbox"
											class="checkbox checkbox-primary"
											disabled={edit}
											bind:checked={commonSetting[groupName][key].Enabled}
										/>
									</label>
								{/if}
								<span>{meta?.Name ?? key}</span>
							</div> -->
							<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
								<div class="flex items-center justify-between gap-3">
									<!-- Left: App Icon -->
									<Icon icon={meta?.Path} class="hidden h-5 w-5 md:block" />

									<!-- Middle: Name & Description -->
									<div class="flex flex-grow flex-col">
										<span class="text-sm font-medium">{meta?.Name ?? key}</span>
										<p class="text-sm">
											{meta?.Description}
										</p>
									</div>

									<!-- Right: Toggle + Optional Edit -->
									<div class="flex items-center">
										<input
											type="checkbox"
											class="checkbox checkbox-primary scale-125 cursor-pointer"
											bind:checked={commonSetting[groupName][key].Enabled}
											disabled={edit}
										/>
									</div>
								</div>
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
