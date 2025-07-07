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
		class="preview-modal-backdrop"
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
				<iframe title="PDF Preview" src={fileUrl} width="100%" height="100%" style="border: none;"></iframe>
			{:else if fileType?.includes('csv') || fileType?.includes('text/plain')}
				<div class="text-content-preview">
					<pre>{textContent}</pre>
				</div>
			{:else if fileType?.includes('json')}
				<iframe title="JSON Preview" src={fileUrl} width="100%" height="100%" style="border: none;"></iframe>
			{:else if fileType?.includes('xml')}
				<iframe title="XML Preview" src={fileUrl} width="100%" height="100%" style="border: none;"></iframe>
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

<style>
	.preview-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.preview-modal-content {
		background: white;
		padding: 20px;
		border-radius: 8px;
		width: 90%;
		height: 90%;
		position: relative;
		overflow: auto;
	}

	.preview-close-btn {
		position: absolute;
		right: 10px;
		top: 10px;
		font-size: 24px;
		background: none;
		border: none;
		cursor: pointer;
	}

	.text-content-preview {
		width: 100%;
		height: calc(100% - 40px);
		overflow: auto;
		background: #f5f5f5;
		padding: 15px;
		border-radius: 4px;
	}

	.text-content-preview pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: monospace;
		margin: 0;
	}

	.download-prompt {
		text-align: center;
		padding: 20px;
	}

	.download-btn {
		display: inline-block;
		padding: 10px 20px;
		background: #4a5568;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		margin-top: 10px;
	}

	.download-btn:hover {
		background: #2d3748;
	}
</style>
