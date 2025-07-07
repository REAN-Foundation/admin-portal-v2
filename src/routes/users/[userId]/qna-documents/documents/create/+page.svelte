<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { showMessage } from '$lib/utils/message.utils.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { DocumentsCreateModel } from '$lib/types/documents.types.js';
	import { createOrUpdateSchema } from '$lib/validation/documents.schema.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { FileUploadModel } from '$lib/types/file.upload.types.js';
	import { fileUploadSchema } from '$lib/validation/file.upload.schema.js';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////////////////////////////////

	// Initializing variables and constants
	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();

	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	let dragging = $state(false);

	let imageUrl = $state('');
	let fileinput = $state();
	let name = $state(undefined);
	let description = $state(undefined);
	let createdBy = $state(undefined);
	let fileName = $state(undefined);
	let source = $state(undefined);
	let parentDocument = $state(undefined);
	let version = $state(undefined);
	let chunkingLength = $state(undefined);
	let chunkOverlap = $state(undefined);
	let chunkingStrategy = $state(undefined);
	let splitter = $state(undefined);
	let active = $state(true);
	let resourceId = $state(undefined);
	let documentType = $derived(fileName ? fileName.split('.').pop() : '');
	let selectFile = $state(undefined);

	$inspect(selectFile);

	$inspect(chunkingLength, chunkOverlap, chunkingStrategy);
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/qna-documents/documents/create`;
	const documentsRoute = `/users/${userId}/qna-documents/documents`;
	const breadCrumbs = [
		{ name: 'Q&A Documents', path: documentsRoute },
		{ name: 'Create', path: createRoute }
	];

	// Function to upload file asynchronously
	const upload = async (imgBase64, file) => {
		try {
			if (!file) {
				showMessage('No file selected', 'error');
				return { success: false, error: 'No file selected' };
			}

			// Create form data with both file and metadata
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`/api/server/file-resources/upload/bot-content`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			console.log('Upload response:', response);

			if (response.Status === 'success' && response.HttpCode === 201) {
				return { success: true, resourceId: response.Data?.id, response };
			} else {
				const errorMsg = response.Message || 'File upload failed';
				showMessage(errorMsg, 'error');
				return { success: false, error: errorMsg };
			}
		} catch (error) {
			console.error('Upload error:', error);
			const errorMsg = error.message || 'File upload failed';
			showMessage(errorMsg, 'error');
			return { success: false, error: errorMsg };
		}
	};

	// Function triggered when file is selected
	const onFileSelected = async (e) => {
		try {
			const file = e.target.files[0];
			if (!file) return;

			// Check file size (50MB limit)
			const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
			if (file.size > MAX_FILE_SIZE) {
				showMessage(`File size exceeds 50MB limit. Please select a smaller file.`, 'error');
				e.target.value = ''; // Clear the file input
				return;
			}

			fileName = file.name;
			selectFile = file;
			
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = async (e) => {
				fileinput = e.target.result;
			};
		} catch (error) {
			console.error('File selection error:', error);
			showMessage('Error selecting file', 'error');
		}
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const fileCreateModel: FileUploadModel = {
				UploadFile: selectFile,
				FileName: selectFile?.name,
				FileType: selectFile?.type
			};

			const fileValidationResult = fileUploadSchema.safeParse(fileCreateModel);

			const documentsCreateModel: DocumentsCreateModel = {
				Name: name,
				Description: description,
				FileName: fileName,
				Source: source,
				ParentDocument: parentDocument,
				Active: active,
				CreatedBy: createdBy,
				ChunkingStratergy: chunkingStrategy,
				ChunkingLength: chunkingLength,
				ChunkingOverlap: chunkOverlap,
				Splitter: splitter,
				ResourceId: '',
				Keywords: keywords.length > 0 ? keywords : null,
				DocumentType: documentType
			};
			const documentValidation = createOrUpdateSchema.safeParse(documentsCreateModel);
			console.log('validation result of documents', documentValidation);

			if (!fileValidationResult.success || !documentValidation.success) {
				if (!fileValidationResult.success) {
					Object.assign(
						errors,
						Object.fromEntries(
							Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
								key,
								val?.[0] || 'This field is required'
							])
						)
					);
				}
				if (!documentValidation.success) {
					Object.assign(
						errors,
						Object.fromEntries(
							Object.entries(documentValidation.error.flatten().fieldErrors).map(([key, val]) => [
								key,
								val?.[0] || 'This field is required'
							])
						)
					);
				}
				return;
			}

			const uploadResult = await upload(fileinput, selectFile);

			console.log('uploadResult', uploadResult);

			if (!uploadResult.success) {
				if (uploadResult.error) {
					errors = uploadResult.error;
				} else {
					showMessage(uploadResult.error || 'File upload failed', 'error');
				}
				return;
			}

			documentsCreateModel.ResourceId = uploadResult.resourceId;

			console.log('documentsCreateModel!!!', documentsCreateModel);

			const res = await fetch(`/api/server/documents`, {
				method: 'POST',
				body: JSON.stringify(documentsCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${documentsRoute}/${response?.Data?.id}/view`);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	$effect(() => {
		keywordsStr = keywords?.join(', ');
	});

	function handleDrop(event) {
		event.preventDefault();
		dragging = false;

		const file = event.dataTransfer.files[0];
		if (file) {
			fileName = file.name;
		}
	}
</script>

<!-- Breadcrumbs Component -->
<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Document" />
			<a href={documentsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="name"
							type="text"
							placeholder="Enter name here..."
							bind:value={name}
							error={errors?.Name}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="File Name" />
					<td class="table-data">
						<Input
							name="fileName"
							type="text"
							placeholder="Enter file name here..."
							bind:value={fileName}
							error={errors?.FileName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Upload File" required={true} />
					<td class="table-data">
						<!-- Input Cell -->

						<div class="flex items-center space-x-4">
							<!-- Select File Button -->
							<label class="table-btn variant-filled-secondary">
								Select File
								<input type="file" class="hidden" onchange={onFileSelected} />
							</label>

							<input
								type="text"
								class="input bg-gray-100 text-gray-700 focus:outline-none"
								value={fileName}
								readonly
								placeholder="No file selected"
							/>
						</div>

						<!-- Validation Error -->
						{#if errors?.UploadFile}
							<p class="text-error">{errors?.UploadFile}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Keywords" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
						{#if errors?.Keywords}
							<p class="text-error">{errors?.Keywords}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Document Type" required={true} />
					<td class="table-data">
						<Input
							name="documentType"
							type="text"
							placeholder="Enter document type here..."
							bind:value={documentType}
							error={errors?.DocumentType}
						/>
					</td>
				</tr>
				<!-- Source -->
				<!-- <tr>
							<td>Source</td>
							<td>
								<input
									type="text"
									name="source"
									bind:value={source}
									placeholder="Enter source here..."
									class="input"
								/>
							</td>
						</tr> -->
				<!-- Parent Document -->
				<!-- <tr>
							<td>Parent Document</td>
							<td>
								<input
									type="text"
									name="parentDocument"
									bind:value={parentDocument}
									placeholder="Enter name here..."
									class="input"
								/>
								{#if form?.errors?.parentDocument}
									<p class="text-error-500 text-xs">{form?.errors?.ParentDocument[2]}</p>
								{/if}
							</td>
						</tr> -->
				<!-- parent document Version -->

				<!-- <tr>
							<td>Created By</td>
							<td>
								<input
									type="text"
									name="createdBy"
									bind:value={createdBy}
									placeholder="Enter creted by here..."
									class="input"
								/>
								{#if form?.errors?.createdBy}
									<p class="text-error-500 text-xs">{form?.errors?.CreatedBy[0]}</p>
								{/if}
							</td>
						</tr> -->
				<!-- Chunking Strategy -->
				<tr class="tables-row">
					<Label text="Chunking Strategy" required={true} />
					<td class="table-data">
						<select
							class="input"
							name="chunkingStrategy"
							bind:value={chunkingStrategy}
							placeholder="Select type here..."
						>
							<option>Recursive Structure Aaware Splitting</option>
							<option>Structure Aware Splitting</option>
							<option>Content Aware Splitting</option>
							<option>NPL chunking</option>
						</select>
					</td>
				</tr>
				<!-- Chunking Length -->
				<tr class="tables-row">
					<Label text="Chunking Length" required={true} />
					<td class="table-data">
						<Input
							name="chunkingLength"
							type="number"
							placeholder="Enter chunking length here..."
							bind:value={chunkingLength}
							error={errors?.ChunkingLength}
							min={0}
						/>
					</td>
				</tr>
				<!-- Chunking Overlap -->
				<tr class="tables-row">
					<Label text="Chunking Overlap" required={true} />
					<td class="table-data">
						<Input
							name="chunkOverlap"
							type="number"
							placeholder="Enter chunking overlap here..."
							bind:value={chunkOverlap}
							error={errors?.ChunkOverlap}
							min={0}
						/>
					</td>
				</tr>
				<!-- Splitter -->
				<tr class="tables-row">
					<Label text="Splitter" required={true} />
					<td class="table-data">
						<Input
							name="splitter"
							type="text"
							placeholder="Enter splitter here..."
							bind:value={splitter}
							error={errors?.Splitter}
						/>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
