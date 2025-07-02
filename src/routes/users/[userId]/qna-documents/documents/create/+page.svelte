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
		const data = {};
		console.log(imgBase64);

		const imgData = imgBase64.split(',');
		data['image'] = imgData[1];
		console.log(JSON.stringify(data));

		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch(`/api/server/file-resources/upload/bot-content`, {
			method: 'POST',
			body: formData
		});
		console.log(Date.now().toString());
		const response = await res.json();
		console.log('response', response);

		if (response.Status === 'success' && response.HttpCode === 201) {
			const imageResourceId = response.Data.id;
			// const imageUrl_ = response.Data.FileResources[0].Url;
			// console.log('imageUrl_', imageUrl_);
			// if (imageUrl_) {
			// 	imageUrl = imageUrl_;
			// }
			// console.log(imageUrl);
			return { success: true, resourceId: response.Data?.id, response };
		} else {
			showMessage(response.Message, 'error');
			return { success: false, error: response.Message };
		}
	};

    // Update your upload function in +page.svelte


	// Function triggered when file is selected
	const onFileSelected = async (e) => {
		let f = e.target.files[0];
		fileName = f.name;
		selectFile = f;
		let reader = new FileReader();
		reader.readAsDataURL(f);
		reader.onload = async (e) => {
			fileinput = e.target.result;
		};
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
				Keywords: keywords.length > 0 ? keywords :null,
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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Create Document</th>
							<th class="text-end">
								<!-- Close Button -->
								<a href={documentsRoute} class="table-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<!-- Table Body -->
					<tbody>
						<!-- Name -->
						<tr>
							<td>Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="name"
									bind:value={name}
									placeholder="Enter name here..."
									class="input"
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>

						<!-- Description -->
						<tr>
							<td class="align-top">Description </td>
							<td>
								<textarea
									name="description"
									placeholder="Enter description here..."
									class="input"
									bind:value={description}
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>File Name </td>
							<td>
								<input
									type="text"
									name="fileName"
									bind:value={fileName}
                                    disabled
									placeholder="Enter name here..."
									class="input"
								/>
								{#if errors?.FileName}
									<p class="text-error">{errors?.FileName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<!-- Label Cell -->
							<td>
								Upload File <span class="text-red-700">*</span>
							</td>

							<!-- Input Cell -->
							<td>
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

						<tr>
							<td>Keywords </td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
								{#if errors?.Keywords}
									<p class="text-error">{errors?.Keywords}</p>
								{/if}
							</td>
						</tr>

						<tr>
							<td>Document Type <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="documentType"
									bind:value={documentType}
                                    disabled
									placeholder="Enter document type here..."
									class="input"
								/>
								{#if errors?.DocumentType}
									<p class="text-error">{errors?.DocumentType}</p>
								{/if}
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
						<tr>
							<td>Chunking Strategy <span class="text-red-700">*</span></td>
							<td>
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
						<tr>
							<td class="text-start">Chunking length <span class="text-red-700">*</span></td>
							<td>
								<input
									type="number"
									name="chunkingLenght"
									min="0"
									bind:value={chunkingLength}
									placeholder="Enter chunking length here..."
									class="input"
								/>
								{#if errors?.ChunkingLength}
									<p class="text-error">{errors?.ChunkingLength}</p>
								{/if}
							</td>
						</tr>
						<!-- Chunking Overlap -->
						<tr>
							<td class="text-start">Chunking Overlap <span class="text-red-700">*</span></td>
							<td>
								<input
									type="number"
									name="chunkOverlap"
                                    min="0"
									bind:value={chunkOverlap}
									placeholder="Enter chunking overlap here..."
									class="input"
								/>

								{#if errors?.ChunkingOverlap}
									<p class="text-error">{errors?.ChunkingOverlap}</p>
								{/if}
							</td>
						</tr>
						<!-- Splitter -->
						<tr>
							<td class="text-start">Splitter <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="splitter"
									bind:value={splitter}
									placeholder="Enter Splitter here..."
									class="input"
								/>
								{#if errors?.Splitter}
									<p class="text-error">{errors?.Splitter}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>

				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
