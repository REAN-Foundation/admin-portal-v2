<script lang="ts">
	import Button from '$lib/components/button/button.svelte';

	let {
		isEditing = false,
		isSubmitting = false,
		submitText = 'Save Changes',
		onCancel = () => {}
	} = $props<{
		isEditing?: boolean;
		isSubmitting?: boolean;
		submitText?: string;
		onCancel?: () => void;
	}>();
</script>

<hr class="border-t border-[0.5px] border-[var(--color-outline)]" />
<div class="flex items-center justify-end gap-3 px-5 py-4">
	{#if isEditing}
		<Button
			type="button"
			variant="outline"
			size="md"
			text="Cancel"
			onclick={onCancel}
		/>
	{/if}
	{#if isSubmitting}
		<Button type="submit" variant="primary" size="md" text="Saving..." disabled={true} />
	{:else}
		<Button
			type="submit"
			variant="primary"
			size="md"
			text={submitText}
			disabled={!isEditing}
		/>
	{/if}
</div>
