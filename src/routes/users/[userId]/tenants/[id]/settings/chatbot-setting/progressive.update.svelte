<script lang="ts">
	import { languages } from '$lib/utils/language';
	import Icon from '@iconify/svelte';
	import Icons from '../../../../../../../lib/components/icons.svelte';

	let { chatBotSetting = $bindable(), edit, iconPaths, getSettingMeta, showCancelModel, onFileSelected } = $props();

	let currentSection = $state(0);
	let errors: Record<string, string> = $state({});

	let fileinput = $state();
	let fileName = $state(undefined);
	let selectFile = $state(undefined);

	let promise = $state();

	const nextSection = () => {
		if (currentSection < 3 - 1) currentSection++;
	};

	const prevSection = () => {
		if (currentSection > 0) currentSection--;
	};

	// const submitForm = () => {
	// 	alert('Form submitted!');
	// 	console.log(formData);
	// };


	let openTab: string | null = $state(null);

	function toggleTab(tab: string) {
		openTab = openTab === tab ? null : tab;
	}
	let progressPercent = $derived(((currentSection + 1) / 3) * 100);
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
		<div class="mb-4">
			<label class="mb-1 block font-medium">Name <span class="text-red-700">*</span></label>
			<input
				type="text"
				class="health-system-input"
				name="chatbotName"
				placeholder="Enter name here..."
				bind:value={chatBotSetting.ChatBot.Name}
			/>
			{#if errors?.Name}
				<p class="text-error">{errors?.Name}</p>
			{/if}
		</div>

		<div class="mb-4">
			<label class="mb-1 block font-medium">Organization Name</label>
			<input
				type="text"
				class="health-system-input"
				name="organizationName"
				placeholder="Enter organization name here..."
				bind:value={chatBotSetting.ChatBot.OrganizationName}
			/>
			{#if errors?.OrganiztionName}
				<p class="text-error">{errors?.OrganiztionName}</p>
			{/if}
		</div>

		<div class="mb-4">
			<label class="mb-1 block font-medium">Organization Logo</label>
			<input
				type="text"
				class="health-system-input"
				name="organizationLogo"
				placeholder="Enter organization logo here..."
				bind:value={chatBotSetting.ChatBot.OrganizationLogo}
			/>
			{#if errors?.OrganizationLogo}
				<p class="text-error">{errors?.OrganizationLogo}</p>
			{/if}
		</div>

		<div class="mb-4">
			<label class="mb-1 block font-medium">Organization Website</label>
			<input
				type="text"
				class="health-system-input"
				name="organizationWebsite"
				placeholder="Enter organization website here..."
				bind:value={chatBotSetting.ChatBot.OrganizationWebsite}
			/>
			{#if errors?.OrganizationWebsite}
				<p class="text-error">{errors?.OrganizationWebsite}</p>
			{/if}
		</div>

		<div class="mb-4">
			<label class="mb-1 block font-medium">Favicon</label>
			<div class="flex items-center space-x-4">
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

		<div class="mb-4">
			<label class="mb-1 block font-medium">Description</label>
			<textarea
				bind:value={chatBotSetting.ChatBot.Description}
				name="description"
				placeholder="Enter description here..."
				class="health-system-input"
			></textarea>
		</div>

		<div class="mb-4">
			<label class="mb-1 block font-medium">Default Language</label>
			<select
				bind:value={chatBotSetting.ChatBot.DefaultLanguage}
				class="w-full rounded border p-2 text-sm"
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
										{#if edit === true && chatBotSetting.ChatBot[groupName][key] === true}
											<span class="text-green-500">✅</span>
										{:else if edit === true && chatBotSetting.ChatBot[groupName][key] !== true}
											<span>❌</span>
										{:else}
											<label class="flex items-center gap-2">
												<input
													type="checkbox"
													class="checkbox checkbox-primary"
													disabled={edit}
													bind:checked={chatBotSetting.ChatBot[groupName][key]}
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
				</div>
			{/if}
		{/each}
	{:else if currentSection === 2}
		{#each Object.entries(chatBotSetting.ChatBot)
			.filter(([_, val]) => typeof val === 'boolean')
			.reduce((acc, curr, idx, arr) => {
				if (idx % 2 === 0) acc.push(arr.slice(idx, idx + 2));
				return acc;
			}, []) as row}
			{#each row as [groupName, groupItems]}
				<div class="m-4 flex h-20 items-center justify-between rounded-xl border p-4">
					<!-- Left: App Icon -->
					<Icons cls="" h="24px" w="24px" iconPath="/tenant-setting/chatbot/whatsapp.svg#icon" />

					<!-- Middle: Name & Description -->
					<div class=" flex flex-grow flex-col">
						<span class="font-semibold">{groupName}</span>
						<p class="text-sm">
							This is a short description for {groupName} chatbot setting.
						</p>
					</div>

					<!-- Right: Toggle -->
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
								disabled={edit}
							/>
						</label>
					</div>
				</div>
			{/each}

			{#if row.length === 1}
				<td class="w-1/2"></td>
			{/if}
		{/each}
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
			class="variant-filled-secondary rounded px-4 py-2 text-white"
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
