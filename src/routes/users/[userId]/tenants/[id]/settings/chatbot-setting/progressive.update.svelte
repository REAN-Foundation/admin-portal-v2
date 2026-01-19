<script lang="ts">
	import Icons from '$lib/components/icons.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import Image from '$lib/components/image.svelte';
	import { languages } from '$lib/utils/language';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////////////////////////////////////

	let {
		chatBotSetting = $bindable(),
		edit,
		iconPaths,
		getSettingMeta,
		showCancelModel = $bindable(),
		onFileSelected,
		currentSection = $bindable(),
		fileName,
		chatBotUISettings,
		onLogoSelected,
		logoName,
		errors = {},
		welcomeMessages = $bindable(),
		onAddWelcomeMessage = () => {},
		onEditWelcomeMessage = (index: number) => {},
		onDeleteWelcomeMessage = (index: number) => {},
		logoUrl = $bindable(),
		faviconUrl = $bindable()
	} = $props();

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

<div class="w-full rounded-lg p-6 ">
	{#if currentSection === 0}
		<div class="my-2 flex flex-col md:flex-row md:items-center">
			<label for="chatbotName" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
				>Name <span class="text-red-700">*</span></label
			>
			<input
				type="text"
				class="input-field w-[70%]"
				name="chatbotName"
				placeholder="Enter name here..."
				disabled={!edit}
				required
				bind:value={chatBotSetting.ChatBot.Name}
			/>
			{#if errors?.Name}
				<p class="text-error">{errors?.Name}</p>
			{/if}
		</div>

		<div class="my-4 flex flex-col md:flex-row md:items-center">
			<label
				for="organizationName"
				class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">Organization Name</label
			>
			<input
				type="text"
				class="input-field w-[70%]"
				name="organizationName"
				placeholder="Enter organization name here..."
				disabled={!edit}
				bind:value={chatBotSetting.ChatBot.OrganizationName}
			/>
			{#if errors?.OrganiztionName}
				<p class="text-error">{errors?.OrganiztionName}</p>
			{/if}
		</div>

		<div class="my-4 flex flex-col md:flex-row md:items-center">
			<label
				for="organizationLogo"
				class="text mx-1 mb-2 w-[30%] pt-2 font-medium text-(--color-info)">Organization Logo</label
			>
			<div class="flex w-full items-start gap-4">
				{#if logoUrl}
					<div class="relative shrink-0 h-12 w-12 rounded-lg border border-(--color-outline) bg-white p-1 overflow-hidden">
						<Image
							source={logoUrl}
							cls="h-full w-full object-contain"
							w="48"
							h="48"
						/>
					</div>
				{/if}
				<div class="flex flex-1 flex-col gap-2">
					<div class="flex w-full gap-3">
						<label class="table-btn variant-filled-secondary cursor-pointer">
							{logoUrl ? 'Change' : 'Select File'}
							<input type="file" class="hidden" onchange={onLogoSelected} disabled={!edit} accept="image/*" />
						</label>
						<input
							type="text"
							class="input-field flex-1"
							name="organizationLogo"
							placeholder={logoUrl ? 'Select new logo to replace...' : 'No File Selected...'}
							readonly
							disabled={!edit}
							value={logoName}
						/>
					</div>
					{#if errors?.OrganizationLogo}
						<p class="text-error text-sm">{errors?.OrganizationLogo}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="my-4 flex flex-col md:flex-row md:items-center">
			<label
				for="organizationWebsite"
				class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
				>Organization Website
			</label>
			<input
				type="text"
				class="input-field w-[70%]"
				name="organizationWebsite"
				placeholder="Enter organization website here..."
				disabled={!edit}
				bind:value={chatBotSetting.ChatBot.OrganizationWebsite}
			/>
			{#if errors?.OrganizationWebsite}
				<p class="text-error">{errors?.OrganizationWebsite}</p>
			{/if}
		</div>

		<div class="my-4 flex flex-col md:flex-row md:items-start">
			<label for="favicon" class="text mx-1 mb-2 w-[30%] pt-2 font-medium text-(--color-info)"
				>Favicon</label
			>
			<div class="flex w-full items-center gap-4">
				{#if faviconUrl}
					<div class="relative shrink-0 h-12 w-12 rounded-lg border border-(--color-outline) bg-white p-1 overflow-hidden">
						<Image
							source={faviconUrl}
							cls="h-full w-full object-contain"
							w="48"
							h="48"
						/>
					</div>
				{/if}
				<div class="flex flex-1 flex-col gap-2">
					<div class="flex w-full gap-3">
						<label class="table-btn variant-filled-secondary cursor-pointer">
							{faviconUrl ? 'Change' : 'Select File'}
							<input type="file" class="hidden" onchange={onFileSelected} disabled={!edit} accept="image/*" />
						</label>
						<input
							type="text"
							class="input-field flex-1"
							placeholder={faviconUrl ? 'Select new favicon to replace...' : 'No file selected'}
							readonly
							disabled={!edit}
							value={fileName}
						/>
					</div>
					{#if errors?.UploadFile}
						<p class="text-error text-sm">{errors?.UploadFile}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="my-4 flex flex-col md:flex-row md:items-center">
			<label for="description" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
				>Description</label
			>
			<textarea
				disabled={!edit}
				bind:value={chatBotSetting.ChatBot.Description}
				name="description"
				placeholder="Enter description here..."
				class="input-field w-[70%]"
			></textarea>
		</div>

		<div class="my- flex flex-col md:flex-row md:items-center">
			<label for="defaultLanguage" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
				>Default Language</label
			>
			<select
				bind:value={chatBotSetting.ChatBot.DefaultLanguage}
				class="select input-field w-[100%]"
				disabled={!edit}
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

		<div class="my-4 flex flex-col md:flex-row md:items-center">
			<label for="timezone" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
				>Timezone</label
			>
			<input
				type="text"
				class="input-field w-[70%]"
				name="timezone"
				placeholder="Enter timezone offset (e.g., +05:30, -05:00)..."
				bind:value={chatBotSetting.ChatBot.Timezone}
				disabled={!edit}
			/>
			{#if errors?.Timezone}
				<p class="text-error">{errors?.Timezone}</p>
			{/if}
		</div>

		<!-- {#if chatBotSetting.ChatBot.WelcomeMessage} -->
			<div class="my-6 border-t border-[var(--color-outline)] pt-4">
				<div class="mb-4 flex items-center justify-between">
					<label class="text mx-1 font-medium text-[var(--color-info)]">Welcome Messages</label>
					<Button
						variant="primary"
						size="sm"
						text="Add Message"
						onclick={() => onAddWelcomeMessage()}
						disabled={!edit}
					/>
				</div>

				{#if welcomeMessages && welcomeMessages.length > 0}
					<div class="health-system-table-container my-4 shadow">
						<table class="health-system-table w-full">
							<thead>
								<tr>
									<th>Language</th>
									<th>Content</th>
									<th>URL</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each welcomeMessages as msg, index}
									<tr>
										<td>
											{languages.find((l) => l.code === msg.LanguageCode)?.name ||
												msg.LanguageCode}
										</td>
										<td>{msg.Content}</td>
										<td>{msg.URL || '-'}</td>
										<td>
											<div class="flex flex-row space-x-2">
												<Icon
													icon="material-symbols:edit-outline"
													class="cursor-pointer {!edit ? 'cursor-not-allowed opacity-50' : ''}"
													onclick={() => edit && onEditWelcomeMessage(index)}
												/>
												<Icon
													icon="material-symbols:delete-outline"
													class="cursor-pointer text-red-600 {!edit ||
													msg.LanguageCode ===
														languages.find(
															(l) => l.name === chatBotSetting.ChatBot.DefaultLanguage
														)?.code
														? 'cursor-not-allowed opacity-50'
														: ''}"
													onclick={() =>
														edit &&
														msg.LanguageCode !==
															languages.find(
																(l) => l.name === chatBotSetting.ChatBot.DefaultLanguage
															)?.code &&
														onDeleteWelcomeMessage(index)}
												/>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-sm text-[var(--color-info)] opacity-70 ml-[30%]">
						No welcome messages configured. Click "Add Message" to create one.
					</p>
				{/if}
			</div>
		<!-- {/if} -->
	{:else if currentSection === 1}
		{#each Object.entries(chatBotSetting.ChatBot) as [groupName, groupItems]}
			{#if groupName === 'MessageChannels' || groupName === 'SupportChannels'}
				<div
					class={`my-2 flex w-full flex-col rounded-md  border-[0.5px] border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${
						openTab === groupName ? 'border-hover ' : ''
					} `}
				>
					<button
						type="button"
						onclick={() => toggleTab(groupName)}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
	transition-all duration-200 ease-in-out  ${
																openTab === groupName
																	? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
																	: `border-hover rounded bg-[var(--color-secondary)]`
															} 
	`}
					>
						<div class="flex items-center gap-2">
							<Icons cls="my-2 stroke-2" h="80%" w="80%" iconPath={iconPaths[groupName] ?? ''} />
							<div class=" text-start">
								<div class="text-base font-medium">
									{#if groupName === 'MessageChannels'}
										<p>Message Channels</p>
									{:else if groupName === 'SupportChannels'}
										<p>Support Channels</p>
									{/if}
								</div>
								<p class=" text-sm">{chatBotUISettings[groupName].Description}</p>
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
						<div class="flex w-full justify-center py-5 bg-[var(--color-secondary)]">
							<div class="mx-20 grid w-full grid-cols-2 gap-x-10 gap-y-6 lg:grid-cols-2">
								{#each Object.entries(groupItems) as [key, value]}
									{@const meta = getSettingMeta(groupName, key)}

									<!-- <div class="flex items-center gap-3">
										<label class="flex items-center gap-2">
											<input
												type="checkbox"
												class="checkbox checkbox-primary"
												disabled={!edit}
												bind:checked={chatBotSetting.ChatBot[groupName][key]}
											/>
										</label>

										<Icon icon={meta?.IconPath} width="16" height="16" class="h-5 w-5" />

										<span>{meta?.Name ?? key}</span>
									</div> -->

									<div class=" border-hover rounded-xl border p-4 text-[var(--color-info)]">
										<div class="flex items-center justify-between gap-3">
											<!-- Left: App Icon -->
											<Icon icon={meta?.IconPath} class="h-5 w-5" />

											<!-- Middle: Name & Description -->
											<div class="flex flex-grow flex-col">
												<span class="text-sm font-medium">{meta?.Name ?? key}</span>
												<p class="text-sm">
													<!-- short description for {meta?.Name ?? key}. -->
													{meta?.Description}
												</p>
											</div>

											<!-- Right: Toggle + Optional Edit -->
											<div class="flex items-center">
												<input
													type="checkbox"
													class="checkbox checkbox-primary scale-125 cursor-pointer"
													bind:checked={chatBotSetting.ChatBot[groupName][key]}
													disabled={!edit}
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
						<div class=" w-1/2">
							<div
								class="flex items-center justify-between gap-3 rounded-xl border p-4 text-[var(--color-info)]"
							>
								<!-- Left: App Icon -->
								<Icon icon={chatBotUISettings[groupName].IconPath} class="h-5 w-5" />

								<!-- Middle: Name & Description -->
								<div class="flex flex-grow flex-col">
									<span class="text-sm font-medium">{chatBotUISettings[groupName].Name}</span>
									<p class="text-sm">
										{chatBotUISettings[groupName].Description}
									</p>
								</div>

								<!-- Right: Toggle + Optional Edit -->
								<div class="flex items-center">
									<!-- {#if groupName === 'Consent' && groupItems === true && edit === true}
										<Tooltip text="Edit" forceShow={true}>
											<Icon
												icon="material-symbols:edit-outline"
												class="mx-3 h-4 w-4 cursor-pointer"
												onclick={() => (showCancelModel = true)}
											/>
										</Tooltip>
									{/if} -->
									<input
										type="checkbox"
										class="checkbox checkbox-primary scale-125 cursor-pointer"
										bind:checked={chatBotSetting.ChatBot[groupName]}
										disabled={!edit}
									/>
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
<hr class="border-t border-[0.5px] border-[var(--color-outline)]" />

<div class="button-container my-4 ">
	<button
		type="button"
		class="cursor-pointer rounded-md bg-[var(--color-primary)] px-3 py-2 text-[var(--color-info)] disabled:opacity-50"
		onclick={prevSection}
		disabled={currentSection === 0}
	>
		Previous
	</button>

	{#if currentSection < 3 - 1}
		<button
			type="button"
			class="table-btn variant-filled-secondary !px-4 py-2 text-[var(--color-info)]"
			onclick={nextSection}
		>
			Next
		</button>
	{:else}
		{#await promise}
			<button type="submit" class="table-btn variant-filled-secondary" disabled> Submiting </button>
		{:then data}
			<button type="submit" class="table-btn variant-filled-secondary"> Submit </button>
		{/await}
	{/if}
</div>
