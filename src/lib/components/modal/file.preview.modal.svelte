<script>
	let { showModal = false, closeModal, fileUrl = '', fileType = '' } = $props();
	let textContent = $state('');

	const loadTextContent = async () => {
		if (fileType?.includes('csv') || fileType?.includes('text/plain')) {
			try {
				const response = await fetch(fileUrl);
				textContent = await response.text();
			} catch (error) {
				console.error('Error loading text content:', error);
				textContent = 'Error loading file content';
			}
		}
	};

	$effect(() => {
		if (showModal && fileUrl) {
			loadTextContent();
		}
	});
</script>

{#if showModal}
	<div
		class="preview-modal-backdrop bg-opacity-50 bg-black"
		role="button"
		tabindex="0"
		onclick={closeModal}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') closeModal();
		}}
	>
		<div
			class="preview-modal-content"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<button class="preview-close-btn" type="button" onclick={closeModal} aria-label="Close modal">
				×
			</button>

			{#if fileType?.includes('pdf')}
				<iframe title="PDF Preview" src={fileUrl} width="100%" height="100%" style="border: none;"
				></iframe>
			{:else if fileType?.includes('csv') || fileType?.includes('text/plain')}
				<div class="text-content-preview">
					<pre>{textContent}</pre>
				</div>
			{:else if fileType?.includes('json')}
				<iframe title="JSON Preview" src={fileUrl} width="100%" height="100%" style="border: none;"
				></iframe>
			{:else if fileType?.includes('xml')}
				<iframe title="XML Preview" src={fileUrl} width="100%" height="100%" style="border: none;"
				></iframe>
			{:else if fileType?.includes('sheet') || fileType?.includes('excel')}
				<div class="download-prompt">
					<p>This is a spreadsheet file that cannot be previewed directly.</p>
					<a href={fileUrl} download class="download-btn">Download File</a>
				</div>
			{:else}
				<div class="download-prompt">
					<p>This file type ({fileType}) cannot be previewed directly.</p>
					<a href={fileUrl} download class="download-btn">Download File</a>
				</div>
			{/if}
		</div>
	</div>
{/if}
