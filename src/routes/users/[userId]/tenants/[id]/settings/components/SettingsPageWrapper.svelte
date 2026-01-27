<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: string;
		editMode?: boolean;
		onEditClick?: () => void;
		onSubmit?: (event: Event) => Promise<void>;
		backLink?: string;
		backLinkText?: string;
		isSubmitting?: boolean;
		submitText?: string;
		showSubmit?: boolean;
		disabled?: boolean;
		children?: any;
		headerActions?: any;
	}

	let {
		title,
		description = '',
		icon = 'mdi:cog-outline',
		editMode = false,
		onEditClick,
		onSubmit,
		backLink,
		backLinkText = 'Back',
		isSubmitting = false,
		submitText = 'Save Changes',
		showSubmit = true,
		disabled = true,
		children,
		headerActions
	}: Props = $props();
</script>

<div class="settings-page-wrapper">
	<div class="rounded-lg border border-[var(--color-outline)] bg-[var(--color-secondary)] overflow-hidden">
		<form onsubmit={onSubmit}>
			<!-- Header Section -->
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-[var(--color-primary)] border-b border-[var(--color-outline)]">
				<div class="flex items-start gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
						<Icon {icon} class="h-5 w-5" />
					</div>
					<div>
						<h1 class="text-xl font-semibold text-[var(--color-info)]">
							{title}
						</h1>
						{#if description}
							<p class="text-sm text-[var(--color-info)] opacity-70 mt-0.5">
								{description}
							</p>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-2 self-end sm:self-center">
					{#if headerActions}
						{@render headerActions()}
					{/if}

					{#if onEditClick}
						<button
							type="button"
							class="table-btn variant-filled-secondary gap-1 flex items-center"
							onclick={onEditClick}
						>
							<Icon
								icon={disabled ? 'material-symbols:edit-outline' : 'material-symbols:close'}
								class="h-5 w-5"
							/>
							<span class="hidden sm:inline">{disabled ? 'Edit' : 'Cancel'}</span>
						</button>
					{/if}

					{#if backLink}
						<a
							href={backLink}
							class="inline-flex items-center justify-center rounded-md border border-[var(--color-outline)] px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
						>
							<Icon icon="material-symbols:close-rounded" class="h-5 w-5" />
						</a>
					{/if}
				</div>
			</div>

			<!-- Content Section -->
			<div class="settings-content p-6">
				{#if children}
					{@render children()}
				{/if}
			</div>

			<!-- Footer Section -->
			{#if showSubmit}
				<div class="px-6 py-4 bg-[var(--color-primary)] border-t border-[var(--color-outline)]">
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<p class="text-sm text-[var(--color-info)] opacity-70">
							{#if !disabled}
								<Icon icon="mdi:pencil" class="inline h-4 w-4 mr-1" />
								You are in edit mode. Make changes and submit to save.
							{:else}
								<Icon icon="mdi:lock-outline" class="inline h-4 w-4 mr-1" />
								Click "Edit" to modify settings.
							{/if}
						</p>
						<div class="flex gap-2 self-end sm:self-center">
							{#if isSubmitting}
								<Button type="submit" variant="primary" size="md" text="Saving..." disabled={true} />
							{:else}
								<Button type="submit" variant="primary" size="md" text={submitText} disabled={disabled} />
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</form>
	</div>
</div>

<style>
	.settings-page-wrapper {
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
