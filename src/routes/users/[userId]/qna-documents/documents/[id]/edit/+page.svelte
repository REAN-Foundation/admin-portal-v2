<!-- Importing necessary components and utilities -->
<script lang="ts">
	import Image from '$lib/components/image.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { showMessage } from '$lib/utils/message.utils.js';
	import type { PageServerData } from './$types';
	import type { DocumentsUpdateModel } from '$lib/types/documents.types';
	import { createOrUpdateSchema } from '$lib/validation/documents.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { FileUploadModel } from '$lib/types/file.upload.types';
	import { fileUploadSchema } from '$lib/validation/file.upload.schema';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////
	let { data, form }: { data: PageServerData; form: any } = $props();

	console.log('data', data);

	let id = $state(data.documents.id);
	let name = $state(data.documents.Name);
	let description = $state(data.documents.Description);
	let fileName = $state(data.documents.FileResource.OriginalFilename);
	let source = $state(data.documents.Source);
	let parentDocument = $state(data.documents.FileResource.OriginalFileName);
	let parentDocumentVersion = $state(data.documents.ParentDocumentVersion);
	let chunkingStrategy = $state(data.documents.ChunkingStrategy);
	let chunkingLength = $state(data.documents.ChunkingLength);
	let chunkOverlap = $state(data.documents.ChunkOverlap);
	let splitter = $state(data.documents.Splitter);
	let active = $state(data.documents.IsActive);
	let createdBy = $state(data.documents.CreatedBy);
	let keywordsRaw = $state(data.documents.Keyword);
	let documentType = $derived(fileName ? fileName.split('.').pop() : data.documents.DocumentType);
	let version: string = $state(data.documents.DocumentVersion.map((row) => row.Version).join(', '));

	let imageUrl = $state('');
	let fileinput = $state();
	let resourceId = $state(data.documents.ResourceId);
	let selectFile = $state(undefined);
	let dragging = $state(false);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywords: string[] = $derived(keywordsRaw ? keywordsRaw.split(',').map((v) => v.trim()) : []);
	$inspect('data', data);

	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/qna-documents/documents/${id}/edit`;
	const viewRoute = `/users/${userId}/qna-documents/documents/${id}/view`;
	const documentRoute = `/users/${userId}/qna-documents/documents`;
	const breadCrumbs = [
		{ name: 'Q&A Documents', path: documentRoute },
		{ name: 'Edit', path: editRoute }
	];

	function handleReset() {
		name = data?.documents?.Name;
		description = data?.documents?.Description;
		fileName = data?.documents?.FileResource?.OriginalFilename;
		source = data?.documents?.DocumentVersion?.DocumentSource;
		parentDocument = data?.documents?.ParentDocument;
		parentDocumentVersion = data?.documents?.ParentDocumentVersion;
		chunkingStrategy = data?.documents?.ChunkingStrategy;
		chunkingLength = data?.documents?.ChunkingLength;
		chunkOverlap = data?.documents?.ChunkOverlap;
		splitter = data?.documents?.Splitter;
		active = data?.documents?.IsActive;
		createdBy = data?.documents?.CreatedBy;
	}

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

			const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
			if (file.size > MAX_FILE_SIZE) {
				showMessage(`File size exceeds 10MB limit. Please select a smaller file.`, 'error');
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

			if (selectFile) {
				const fileCreateModel: FileUploadModel = {
					UploadFile: selectFile,
					FileName: selectFile.name,
					FileType: selectFile.type
				};

				const fileValidationResult = fileUploadSchema.safeParse(fileCreateModel);
				console.log('validation result', fileValidationResult);

				if (!fileValidationResult.success) {
					errors = Object.fromEntries(
						Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
							key,
							val?.[0] || 'This field is required'
						])
					);
					return;
				}

				const uploadResult = await upload(fileinput, selectFile);

				if (!uploadResult.success) {
					if (uploadResult.error) {
						errors = uploadResult.error;
					} else {
						showMessage(uploadResult.error || 'File upload failed', 'error');
					}
					return;
				}

				resourceId = uploadResult.resourceId;
			} else {
				resourceId = data.documents.ResourceId;
			}

			const documentsUpdateModel: DocumentsUpdateModel = {
				Name: name,
				Description: description,
				FileName: fileName,
				Source: source,
				ParentDocument: parentDocument,
				Version: version,
				Active: active,
				CreatedBy: createdBy,
				ChunkingStratergy: chunkingStrategy,
				ChunkingLength: chunkingLength,
				ChunkingOverlap: chunkOverlap,
				Splitter: splitter,
				ResourceId: resourceId,
				Keywords: keywords.length > 0 ? keywords : null,
				DocumentType: documentType
			};

			const validationResult = createOrUpdateSchema.safeParse(documentsUpdateModel);
			console.log('validation result', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/documents/${id}`, {
				method: 'PUT',
				body: JSON.stringify(documentsUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				response.Message = 'Q&A document updated successfully';
				toastMessage(response);
				goto(`${documentRoute}/${response?.Data?.id}/view`);
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

	function handleFileChange(event) {
		const file = event.target.files[0];
		if (file) {
			fileName = file.name;
		}
		onFileSelected(event);
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Document" />
			<a href={documentRoute} class="form-cancel-btn">
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
				<tr class="tables-row">
					<Label text="Version" />
					<td class="table-data">
						<Input
							name="version"
							type="text"
							placeholder="Enter version here..."
							bind:value={version}
							disabled
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Active" />
					<td class="table-data">
						<Input name="active" type="text" bind:value={active} disabled />
					</td>
				</tr> 

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
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
