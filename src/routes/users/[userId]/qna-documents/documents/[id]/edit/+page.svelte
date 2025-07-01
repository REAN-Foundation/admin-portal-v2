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
	let documentType = $state(data.documents.DocumentType);
	let version: string = $state(data.documents.DocumentVersion.map((row) => row.Version).join(', '));

	let imageUrl = $state('');
	let fileinput = $state();
	let resourceId = $state(data.documents.ResourceId);
	let selectFile = $state(undefined);
	let dragging = $state(false);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywords: string[] = $derived(keywordsRaw.split(',').map((v) => v.trim()));
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
			// const imageResourceId = response.Data.FileResources[0].id;
			// console.log('imageResourceId', imageResourceId);
			// const imageUrl_ = response.Data.FileResources[0].Url;
			// console.log('imageUrl_', imageUrl_);
			// if (imageUrl_) {
			// 	imageUrl = imageUrl_;
			// }
			// console.log(imageUrl);
			return { success: true, resourceId: response.Data?.id, response };
		} else {
			// showMessage(response.Message, 'error');
			return { success: false, error: response.Message };
		}
	};

	const onFileSelected = async (e) => {
		let f = e.target.files[0];
		const filename = f.name;
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
				Keywords: keywords,
				DocumentType: documentType
			};

			console.log(documentsUpdateModel);

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

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Document</th>
							<th class="text-end">
								<!-- Close Button -->
								<a href={documentRoute} class="table-btn variant-soft-secondary">
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
							<td class="align-top">Description <span class="text-red-700">*</span></td>
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
										<input type="file" class="hidden" onchange={handleFileChange} />
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
									<p class="mt-1 text-sm text-red-600">{errors?.UploadFile}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Keywords <span class="text-red-700">*</span></td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>

						<!-- <tr>
							<td>Document Type <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="documentType"
									bind:value={documentType}
									placeholder="Enter document type here..."
									class="input"
								/>
								{#if errors?.DocumentType}
									<p class="text-error">{errors?.DocumentType}</p>
								{/if}
							</td>
						</tr> -->
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
						<tr>
							<td>Version</td>
							<td>
								<input
									type="text"
									name="version"
									bind:value={version}
									placeholder="Enter version here..."
									class="input bg-gray-100 text-gray-700"
									disabled
								/>
							</td>
						</tr>

						<tr>
							<td>Active</td>
							<td>
								<input class="input bg-gray-100 text-gray-700" disabled type="text" name="active" bind:value={active} />
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
					<button
						type="button"
						onclick={handleReset}
						class="table-btn variant-soft-secondary">Reset</button
					>
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
