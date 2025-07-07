<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Icons from '$lib/components/icons.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { languages } from '$lib/utils/language';
	import Icon from '@iconify/svelte';

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
		logoName
	} = $props();

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

<div class="w-full rounded-lg p-6">
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
				class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">Organization Logo</label
			>
			<div class="flex w-[100%] gap-3">
				<label class="table-btn variant-filled-secondary">
					Select File
					<input type="file" class="hidden" onchange={onLogoSelected} disabled={!edit} />
				</label>

				<input
					type="text"
					class="input-field w-[70%]"
					name="organizationLogo"
					onchange={async (e) => await onLogoSelected(e)}
					placeholder="No File Selected..."
					readonly
					disabled={!edit}
					value={logoName}
				/>
			</div>
			{#if errors?.OrganizationLogo}
				<p class="text-error">{errors?.OrganizationLogo}</p>
			{/if}
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

		<div class="my-4 flex flex-col md:flex-row md:items-center">
			<label for="favicon" class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]"
				>Favicon</label
			>
			<div class="flex w-[100%] gap-3">
				<label class="table-btn variant-filled-secondary">
					Select File
					<input type="file" class="hidden" onchange={onFileSelected} disabled={!edit} />
				</label>
				<input
					type="text"
					class="input bg-[var(--color-primary)] text-[var(--color-info)] focus:outline-none"
					onchange={async (e) => await onFileSelected(e)}
					value={fileName}
					readonly
					placeholder="No file selected"
					disabled={!edit}
				/>
			</div>
			{#if errors?.UploadFile}
				<p class="text-error">{errors?.UploadFile}</p>
			{/if}
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
			<label
				for="defaultLanguage"
				class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)]">Default Language</label
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
						<div class="flex w-full justify-center bg-[var(--color-secondary)] py-5">
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

<div class="btn-container mr-6 mb-6">
	<!-- Previous Button -->
	<Button
		text="Previous"
		variant="secondary"
		onclick={prevSection}
		disabled={currentSection === 0}
	/>

	<!-- Next or Submit Button -->
	{#if currentSection < 3 - 1}
		<Button text="Next" variant="primary" onclick={nextSection} />
	{:else}
		{#await promise}
			<Button type="submit" text="Submitting" variant="primary" disabled={true} />
		{:then data}
			<Button type="submit" text="Submit" variant="primary" />
		{/await}
	{/if}
</div>
