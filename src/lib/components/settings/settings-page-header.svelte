<script lang="ts">
	import Icon from '@iconify/svelte';
	import Tooltip from '$lib/components/tooltip.svelte';

	let {
		title,
		description = '',
		isEditing = $bindable(false),
		// featureEnabled = true,
		// featureDisabledMessage = 'This setting is disabled. Please update it from the main settings.',
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
		<Tooltip text={isEditing ? 'Click to exit edit mode' : 'Enable edit mode'}>
			<button
				type="button"
				class="flex items-center gap-2 rounded-full px-1 py-0.5 transition-colors"
				onclick={isEditing ? onCancelEdit : onToggleEdit}
			>
				<span class="text-sm font-medium text-[var(--color-info)]">Edit Mode</span>
				<span
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 {isEditing ? 'bg-[var(--color-active)]' : 'bg-gray-300 dark:bg-gray-600'}"
				>
					<span
						class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 {isEditing ? 'translate-x-6' : 'translate-x-1'}"
					></span>
				</span>
			</button>
		</Tooltip>
		{#if closeHref}
			<a href={closeHref} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" class="h-5" />
			</a>
		{/if}
	</div>
</div>
