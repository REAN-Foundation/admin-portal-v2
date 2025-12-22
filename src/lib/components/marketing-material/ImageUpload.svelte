<script lang="ts">
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';

	let {
		id,
		title,
		fileName,
		imageUrl = null,
		disabled,
		onFileSelect,
		onRemove,
		error = '',
		helpText = ''
	} = $props();
</script>

<div
	class="relative rounded-lg border border-[var(--color-outline)] bg-[var(--color-primary)] p-4 shadow-sm"
>
	<div class="mb-4 flex items-center justify-between">
		<h4 class="text-base text-[var(--color-info)]">{title}</h4>
		{#if !disabled}
			<button
				type="button"
				onclick={onRemove}
				class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-light-red)]"
			>
				<Icon icon="material-symbols:delete-outline" class="h-5" />
			</button>
		{/if}
	</div>

	<div class="mb-2">
		<label
			for="{id}-upload"
			class="mb-2 block text-xs font-medium tracking-wide text-[var(--color-info)]"
		>
			Image File
		</label>
		<div
			class="relative flex items-center rounded border border-[var(--color-outline)] bg-[var(--color-primary)]"
		>
			<label class="health-system-btn variant-filled-secondary" for="{id}-upload">
				Select File
				<input
					type="file"
					id="{id}-upload"
					accept="image/*"
					class="hidden"
					{disabled}
					onchange={onFileSelect}
				/>
			</label>
			<input
				type="text"
				value={fileName}
				readonly
				{disabled}
				class="flex-1 border-0 bg-transparent px-3 py-2 text-sm text-[var(--color-info)] placeholder-[var(--color-muted)] focus:outline-none {error
					? 'border-[var(--color-error)]'
					: ''}"
				placeholder="No file selected..."
			/>
		</div>
		{#if error}
			<p class="mt-1 text-xs text-[var(--color-error)]">{error}</p>
		{/if}
		{#if helpText}
			<p class="mt-1 text-xs text-[var(--color-muted)]">{helpText}</p>
		{/if}
	</div>

	{#if imageUrl}
		<div class="mt-4">
			<Image
				cls="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
				source={imageUrl}
				w="32"
				h="32"
			/>
		</div>
	{/if}
</div>
