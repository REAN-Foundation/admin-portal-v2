<script lang="ts">
	import Icon from '@iconify/svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	let {
		title,
		description = '',
		isEditing = $bindable(false),
		featureEnabled = true,
		featureDisabledMessage = 'This setting is disabled. Please update it from the main settings.',
		hasUnsavedChanges = false,
		closeHref = '',
		onToggleEdit = () => {},
		onCancelEdit = () => {}
	} = $props<{
		title: string;
		description?: string;
		isEditing?: boolean;
		featureEnabled?: boolean;
		featureDisabledMessage?: string;
		hasUnsavedChanges?: boolean;
		closeHref?: string;
		onToggleEdit?: () => void;
		onCancelEdit?: () => void;
	}>();
</script>

<div class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6">
	<div class="flex flex-col">
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-semibold text-[var(--color-info)]">{title}</h1>
			{#if hasUnsavedChanges}
				<Tooltip text="You have unsaved changes" forceShow={true}>
					<span class="inline-block h-2.5 w-2.5 rounded-full bg-orange-500"></span>
				</Tooltip>
			{/if}
		</div>
		{#if description}
			<p class="mt-1 text-sm text-[var(--color-info)] opacity-70">{description}</p>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		{#if isEditing}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-outline)] bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-info)] transition-colors hover:bg-[var(--color-active)]"
				onclick={onCancelEdit}
			>
				<Icon icon="material-symbols:close-rounded" class="h-4 w-4" />
				Cancel
			</button>
			<span class="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
				<Icon icon="material-symbols:edit-outline" class="h-4 w-4" />
				Editing
			</span>
		{:else}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-outline)] bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-info)] transition-colors hover:bg-[var(--color-active)]"
				onclick={onToggleEdit}
			>
				<Icon icon="material-symbols:edit-outline" class="h-4 w-4" />
				Edit Settings
			</button>
		{/if}
		{#if closeHref}
			<a
				href={closeHref}
				class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
			>
				<Icon icon="material-symbols:close-rounded" class="h-5" />
			</a>
		{/if}
	</div>
</div>
