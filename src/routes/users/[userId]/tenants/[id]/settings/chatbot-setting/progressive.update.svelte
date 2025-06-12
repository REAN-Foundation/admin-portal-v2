<script lang="ts">
	import Icons from '$lib/components/icons.svelte';
	import { languages } from '$lib/utils/language';
	import Icon from '@iconify/svelte';

	////////////////////////////////////////////////////////////////////////////////////////////////////

	let {
		chatBotSetting = $bindable(),
		edit,
		iconPaths,
		getSettingMeta,
		showCancelModel = $bindable(),
		onFileSelected
	} = $props();
	$inspect(edit, 'edit');

	let currentSection = $state(0);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let openTab: string | null = $state(null);
	let progressPercent = $derived(((currentSection + 1) / 3) * 100);

	const nextSection = () => {
		if (currentSection < 3 - 1) currentSection++;
	};

	const prevSection = () => {
		if (currentSection > 0) currentSection--;
	};

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}
</script>

<div class="my-6 flex flex-col items-center justify-center">
	<div class="h-2 w-96 overflow-hidden rounded-full bg-gray-200">
		<div
			class="progressive-bar h-full transition-all duration-300"
			style="width: {progressPercent}%;"
		></div>
	</div>
	<div class="mt-2 text-center text-sm text-gray-600">
		Step {currentSection + 1} of {3}
		<!-- <span class="font-medium">{sections[currentSection]}</span> -->
	</div>
</div>

<div class="w-full rounded-lg border bg-white p-6 shadow">
	{#if currentSection === 0}
		<div class="mb-4 flex flex-row">
			<label for="chatbotName" class="mb-1 block w-[30%] font-medium"
				>Name <span class="text-red-700">*</span></label
			>
			<input
				type="text"
				class="health-system-input w-[70%]"
				name="chatbotName"
				placeholder="Enter name here..."
				bind:value={chatBotSetting.ChatBot.Name}
			/>
			{#if errors?.Name}
				<p class="text-error">{errors?.Name}</p>
			{/if}
		</div>

		<div class="mb-4 flex flex-row">
			<label for="organizationName" class="mb-1 block w-[30%] font-medium">Organization Name</label>
			<input
				type="text"
				class="health-system-input w-[70%]"
				name="organizationName"
				placeholder="Enter organization name here..."
				bind:value={chatBotSetting.ChatBot.OrganizationName}
			/>
			{#if errors?.OrganiztionName}
				<p class="text-error">{errors?.OrganiztionName}</p>
			{/if}
		</div>

		<div class="mb-4 flex flex-row">
			<label for="organizationLogo" class="mb-1 block w-[30%] font-medium">Organization Logo</label>
			<input
				type="text"
				class="health-system-input w-[70%]"
				name="organizationLogo"
				placeholder="Enter organization logo here..."
				bind:value={chatBotSetting.ChatBot.OrganizationLogo}
			/>
			{#if errors?.OrganizationLogo}
				<p class="text-error">{errors?.OrganizationLogo}</p>
			{/if}
		</div>

		<div class="mb-4 flex flex-row">
			<label for="organizationWebsite" class="mb-1 block w-[30%] font-medium"
				>Organization Website</label
			>
			<input
				type="text"
				class="health-system-input w-[70%]"
				name="organizationWebsite"
				placeholder="Enter organization website here..."
				bind:value={chatBotSetting.ChatBot.OrganizationWebsite}
			/>
			{#if errors?.OrganizationWebsite}
				<p class="text-error">{errors?.OrganizationWebsite}</p>
			{/if}
		</div>

		<div class="mb-4 flex flex-row">
			<label for="favicon" class="mb-1 block w-[30%] font-medium">Favicon</label>
			<div class="w-[100%]">
				<label class="health-system-btn variant-filled-secondary">
					Select File
					<input type="file" class="hidden" onchange={onFileSelected} />
				</label>
				<input
					type="file"
					class="hidden"
					placeholder="select Image"
					onchange={async (e) => await onFileSelected(e)}
				/>
			</div>
			{#if errors?.UploadFile}
				<p class="text-error">{errors?.UploadFile}</p>
			{/if}
		</div>

		<div class="mb-4 flex flex-row">
			<label for="description" class="mb-1 block w-[30%] font-medium">Description</label>
			<textarea
				bind:value={chatBotSetting.ChatBot.Description}
				name="description"
				placeholder="Enter description here..."
				class="health-system-input w-[70%]"
			></textarea>
		</div>

		<div class="mb-4 flex flex-row">
			<label for="defaultLanguage" class="mb-1 block w-[30%] font-medium">Default Language</label>
			<select
				bind:value={chatBotSetting.ChatBot.DefaultLanguage}
				class=" w-[100%] rounded border p-2 text-sm"
			>
				<option value="" disabled selected>Select language</option>
				{#each languages as lang}
					<option value={lang.name}>{lang.name}</option>
				{/each}
			</select>
			{#if errors?.DefaultLanguage}
				<p class="text-error">{errors?.DefaultLanguage}</p>
			{/if}
		</div>
	{:else if currentSection === 1}
		{#each Object.entries(chatBotSetting.ChatBot) as [groupName, groupItems]}
			{#if groupName === 'MessageChannels' || groupName === 'SupportChannels'}
				<div
					class={`sidebar-item my-2 flex w-full flex-col rounded-md border !p-0 py-2 transition-colors duration-200`}
				>
					<button
						type="button"
						onclick={() => toggleTab(groupName)}
						class={`flex items-center justify-between rounded-t-md p-4 ${openTab === groupName ? ' bg-gray-200' : ''}
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
								<div class="text-base">
									{#if groupName === 'MessageChannels'}
										<p>Message Channels</p>
									{:else if groupName === 'SupportChannels'}
										<p>Support Channels</p>
									{/if}
								</div>
								<p class=" text-sm">Settings under {groupName}</p>
							</div>
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
						<div class="flex w-full justify-center py-5">
							<div class="mx-20 grid w-full grid-cols-2 gap-x-10 gap-y-6 lg:grid-cols-2">
								{#each Object.entries(groupItems) as [key, value]}
									{@const meta = getSettingMeta(groupName, key)}

									<div class="flex items-center gap-3">
										<label class="flex items-center gap-2">
											<input
												type="checkbox"
												class="checkbox checkbox-primary"
												disabled={edit}
												bind:checked={chatBotSetting.ChatBot[groupName][key]}
											/>
										</label>

										<Icon icon={meta?.IconPath} width="16" height="16" class="h-5 w-5" />

										<span>{meta?.Name ?? key}</span>
										<!-- {JSON.stringify(meta)} -->
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	{:else if currentSection === 2}
		<div class="flex flex-col gap-4">
			{#each Object.entries(chatBotSetting.ChatBot)
				.filter(([_, val]) => typeof val === 'boolean')
				.reduce((acc, curr, idx, arr) => {
					if (idx % 2 === 0) acc.push(arr.slice(idx, idx + 2));
					return acc;
				}, []) as row}
				<div class="flex gap-4">
					{#each row as [groupName, groupItems]}
						<div class="w-1/2">
							<div class="flex h-20 items-center justify-between rounded-xl border p-4">
								<!-- Left: App Icon -->
								<Icons
									cls=""
									h="24px"
									w="24px"
									iconPath="/tenant-setting/chatbot/whatsapp.svg#icon"
								/>

								<!-- Middle: Name & Description -->
								<div class="flex flex-grow flex-col px-4">
									<span class="font-semibold">{groupName}</span>
									<p class="text-sm text-gray-500">
										This is a short description for {groupName} chatbot setting.
									</p>
								</div>

								<!-- Right: Toggle + Optional Edit -->
								<div class="flex items-center gap-2">
									{#if groupName === 'Consent' && groupItems === true && edit === true}
										<Icon
											icon="material-symbols:edit-outline"
											height="15"
											width="15"
											onclick={() => (showCancelModel = true)}
										/>
									{/if}
									<label class="flex cursor-pointer items-center">
										<input
											type="checkbox"
											class="checkbox checkbox-primary scale-125"
											bind:checked={chatBotSetting.ChatBot[groupName]}
											disabled={!edit}
										/>
									</label>
								</div>
							</div>
						</div>
					{/each}

					{#if row.length === 1}
						<!-- Fill the empty second column -->
						<div class="w-1/2"></div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Navigation Buttons -->
<div class="my-6 flex justify-between">
	<button
		type="button"
		class="rounded bg-gray-300 px-4 py-2 text-gray-800 disabled:opacity-50"
		onclick={prevSection}
		disabled={currentSection === 0}
	>
		Previous
	</button>

	{#if currentSection < 3 - 1}
		<button
			type="button"
			class="variant-filled-secondary rounded px-4 py-2 !text-black"
			onclick={nextSection}
		>
			Next
		</button>
	{:else}
		{#await promise}
			<button type="submit" class="variant-filled-secondary rounded !px-4 !py-2" disabled>
				Submiting
			</button>
		{:then data}
			<button type="submit" class=" variant-filled-secondary rounded !px-4 !py-2"> Submit </button>
		{/await}
	{/if}
</div>
