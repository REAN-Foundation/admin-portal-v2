<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Helper } from '$lib/utils/helper';

	let {
		module,
		courseId,
		moduleView,
		moduleEdit,
		onModuleDelete,
		expandedModules = $bindable({}),
		moduleContents = $bindable({}),
		loadingContents = $bindable({}),
		moduleContentCounts = $bindable({}),
		onModuleExpand,
		contentView,
		contentEdit,
		contentCreate,
		onContentDelete
	} = $props();

	const isExpanded = $derived(expandedModules[module.id] || false);
	const moduleContentsList = $derived(moduleContents[module.id]);
	const cachedContentCount = $derived(moduleContentCounts[module.id]);
	const contentCount = $derived(
		moduleContentsList !== undefined
			? moduleContentsList.length
			: cachedContentCount !== undefined
				? cachedContentCount
				: (module.ContentCount ??
					module.ContentsCount ??
					module.contentCount ??
					module.contentsCount ??
					module.Contents?.length ??
					0)
	);

	const handleModuleClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onModuleExpand) {
			onModuleExpand(module.id, courseId, event);
		}
	};

	const handleModuleNameClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onModuleExpand) {
			onModuleExpand(module.id, courseId, event);
		}
	};

	const handleDeleteClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onModuleDelete) {
			onModuleDelete(module.id, courseId);
		}
	};

	const handleContentDeleteClick = (contentId: string, event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		if (onContentDelete) {
			onContentDelete(contentId);
		}
	};
</script>

<div class="tree-connector px-4 bg-gray-200 rounded-md py-2 mt-1 mb-1">
	<div class="flex items-center justify-between gap-2 text-[var(--color-info)]">
		<div class="flex items-center gap-2 flex-1">
			<button
				type="button"
				onclick={handleModuleClick}
				class="flex h-6 w-6 items-center justify-center text-sm text-[var(--color-info)]"
			>
				{#if isExpanded}
					<Icon icon="mdi:chevron-down" class="text-xs" />
				{:else}
					<Icon icon="mdi:chevron-right" class="text-xs" />
				{/if}
			</button>
			<span class="flex h-6 w-6 items-center justify-center text-sm text-[var(--color-info)]">
				
			</span>
			{#if !isExpanded}
				<button
					type="button"
					onclick={handleModuleNameClick}
					class="cursor-pointer text-left"
				>
					{module.Sequence ? `${module.Sequence}-` : ''}{module.Name}
				</button>
			{/if}
		</div>
		<div class="flex items-center justify-end gap-2">
			<span class="text-gray-700 text-sm">Contents ({contentCount})</span>
			{#if contentCreate}
				<Button
					href={contentCreate(courseId, module.id)}
					variant="icon"
					icon="material-symbols:add"
					iconSize="sm"
					tooltip="Add New Content"
				/>
			{/if}
			{#if moduleEdit}
				<Button
					href={moduleEdit(courseId, module.id)}
					variant="icon"
					icon="material-symbols:edit-outline"
					iconSize="sm"
					tooltip="Edit"
				/>
			{/if}
			<Button
				href={moduleView(courseId, module.id)}
				variant="icon"
				icon="icon-park-outline:preview-open"
				iconSize="sm"
				tooltip="View"
			/>
			{#if onModuleDelete}
				<Button
					onclick={handleDeleteClick}
					variant="icon"
					icon="material-symbols:delete-outline-rounded"
					iconSize="sm"
					color="red"
					tooltip="Delete"
				/>
			{/if}
		</div>
	</div>

	<!-- Content Table (when module is expanded) -->
	{#if isExpanded}
		{@const isLoadingContents = loadingContents[module.id]}
		<div class="relative py-2 px-4">
			{#if isLoadingContents}
				<div class="flex items-center gap-2 text-gray-500">
					<Icon icon="svg-spinners:ring-resize" class="inline" width="16" />
					<span class="text-sm">Loading contents...</span>
				</div>
			{:else if moduleContentsList !== undefined && moduleContentsList.length > 0}
				<div class="w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
					<div class="overflow-x-auto">
						<table class="table-c min-w-full text-sm">
							<thead>
								<tr class="bg-gray-300">
									<th class="w-[2%]">Id</th>
									<th class="w-[25%]">Title</th>
									<th class="w-[30%]">Description</th>
									<th class="w-[15%]">Duration (Mins)</th>
									<th class="w-[15%]">Sequence</th>
									<th class="w-[13%]"></th>
								</tr>
							</thead>
							<tbody>
								{#each moduleContentsList as content, contentIndex}
									<tr class="bg-gray-200">
										<td>{contentIndex + 1}</td>
										<td>
											{content.Sequence ? `${content.Sequence}-` : ''}{content.Title || 'Not specified'}
										</td>
										<td>
											{content.Description !== null && content.Description !== ''
												? Helper.truncateText(content.Description, 50)
												: 'Not specified'}
										</td>
										<td>
											{content.DurationInMins !== null && content.DurationInMins !== undefined
												? content.DurationInMins
												: 'Not specified'}
										</td>
										<td>
											{content.Sequence !== null && content.Sequence !== undefined
												? content.Sequence
												: 'Not specified'}
										</td>
										<td>
											<div class="flex justify-end gap-1">
												{#if contentEdit}
													<Button
														href={contentEdit(courseId, module.id, content.id)}
														variant="icon"
														icon="material-symbols:edit-outline"
														iconSize="sm"
														tooltip="Edit"
													/>
												{/if}
												{#if contentView}
													<Button
														href={contentView(courseId, module.id, content.id)}
														variant="icon"
														icon="icon-park-outline:preview-open"
														iconSize="sm"
														tooltip="View"
													/>
												{/if}
												{#if onContentDelete}
													<Button
														onclick={(e) => handleContentDeleteClick(content.id, e)}
														variant="icon"
														icon="material-symbols:delete-outline-rounded"
														iconSize="sm"
														color="red"
														tooltip="Delete"
													/>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else}
				<div class="text-gray-500 italic text-sm">No contents found</div>
			{/if}
		</div>
	{/if}
</div>
