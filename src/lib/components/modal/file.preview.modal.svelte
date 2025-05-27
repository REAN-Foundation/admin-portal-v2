<script>
	let { showModal = false, closeModal, fileUrl = '', fileType = '' } = $props();
</script>

{#if showModal}
	<div
		class="preview-modal-backdrop"
		role="button"
		tabindex="0"
		onclick={closeModal}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeModal();
		}}
	>
		<div class="preview-modal-content">
			<button class="preview-close-btn" type="button" onclick={closeModal} aria-label="Close modal">
				×
			</button>

			{#if fileType?.includes('pdf') || fileType.includes('json') || fileType.includes('plain') || fileType.includes('xml')}
				<iframe title="" src={fileUrl} width="100%" height="100%" style="border: none;"></iframe>
			{:else if fileType.includes('csv')}
				<p class="mb-4">This is a CSV file. It can't be previewed here.</p>
				<iframe title="" src={fileUrl} width="100%" height="100%" style="border: none;"></iframe>
			{:else if fileType.includes('sheet') || fileType.includes('excel')}
				<p class="mb-4">This is an Excel spreadsheet. It can't be previewed here.</p>
				<iframe title="" src={fileUrl} width="100%" height="100%" style="border: none;"></iframe>
			{/if}
		</div>
	</div>
{/if}
