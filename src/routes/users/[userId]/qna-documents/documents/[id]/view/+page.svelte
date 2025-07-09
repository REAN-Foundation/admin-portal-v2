<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import { createSchema } from '$lib/validation/vector.store.schema';
	import type { VectorStoreCreateModel } from '$lib/types/vector.store.types';
	import FilePreviewModal from '$lib/components/modal/file.preview.modal.svelte';
	import Button from '$lib/components/button/button.svelte';
<<<<<<< HEAD
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
=======
>>>>>>> develop
	///////////////////////////////////////////////////////////////////////////////
	let { data }: { data: PageServerData } = $props();

	console.log('documents data', data);

	let id = data.document.id;
	let name = data.document.Name;
	let description = data.document.Description;
	let fileName = data.document.FileResource.OriginalFilename;
	let source = data.document.Source;
	let parentDocument = data.document.FileResource.OriginalFilename;
	let parentDocumentVersion = Number(data.document.DocumentVersion.map((row) => row.Version));
	let chunkingStrategy = data.document.ChunkingStrategy;
	let chunkingLength = data.document.ChunkingLength;
	let chunkOverlap = data.document.ChunkOverlap;
	let splitter = data.document.Splitter;
	let isActive = data.document.IsActive;
	let createdBy = data.document.CreatedBy;
	let keywords = data.document.Keyword;
	let documentType = data.document.DocumentType;

	let fileUrl: string | null = $state(null);
	let fileType: string | null = $state(null);
	let showModal = $state(false);

	const userId = page.params.userId;
	const tenantId = data.document.FileResource.TenantId;
	const resourceId = data.document.FileResource.id;

	let errors: Record<string, string> = $state({});
	let promise = $state();

	// Generating routes for edit, view, and document
	const editRoute = `/users/${userId}/qna-documents/documents/${id}/edit`;
	const viewRoute = `/users/${userId}/qna-documents/documents/${id}/view`;
	const documentRoute = `/users/${userId}/qna-documents/documents`;

	// Generating breadcrumb items
	const breadCrumbs = [
		{
			name: 'Q&A Documents',
			path: documentRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const vectorStoreCreateModel: VectorStoreCreateModel = {
				id: resourceId,
				TenantId: tenantId,
				Version: parentDocumentVersion
			};

			console.log(vectorStoreCreateModel);

			const validationResult = createSchema.safeParse(vectorStoreCreateModel);
			console.log('validation result of publish', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/vector-store`, {
				method: 'POST',
				body: JSON.stringify(vectorStoreCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response of vector', response);

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

	const viewDocument = async () => {
		try {
			const res = await fetch(
				`/api/server/documents/file-resources/download/${resourceId}?asAttachment=false`
			);

			if (!res.ok) {
				const errorText = await res.text();
				console.error('Failed to fetch file:', errorText);
				toastMessage({
					Status: 'error',
					Message: 'Failed to fetch document'
				});
				return;
			}

			const mimeType = res.headers.get('Content-Type');
			fileType = mimeType;

			const blob = await res.blob();

			if (blob.size === 0) {
				toastMessage({
					Status: 'error',
					Message: 'Document is empty'
				});
				return;
			}

			fileUrl = URL.createObjectURL(blob);
			showModal = true;
		} catch (error) {
			console.error('Error viewing document:', error);
			toastMessage({
				Status: 'error',
				Message: 'Error viewing document'
			});
		}
	};

	const closeModal = () => {
		showModal = false;
		URL.revokeObjectURL(fileUrl);
		fileUrl = null;
		fileType = null;
	};
</script>

<!-- Rendering breadcrumbs component -->
<BreadCrumbs crumbs={breadCrumbs} />
<<<<<<< HEAD
<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<Heading text="View Document" />
		<a href={documentRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
=======

<div class="mx-auto w-full px-6 py-4">
	<div class="form-headers">
		<h2 class="form-titles">View Document</h2>
		<a href={documentRoute} class="cancel-btn">
			<Icon icon="material-symbols:close-rounded" />
		</a>
	</div>
	<!-- <div class="flex flex-wrap justify-end gap-2 py-2">
		<a href={editRoute} class="table-btn variant-filled-secondary hover:!variant-soft-secondary">
			<Icon icon="material-symbols:edit-outline" class="mr-1" />
			<span>Edit</span>
>>>>>>> develop
		</a>
	</div> -->
	<table class="w-full">
		<tbody>
			<!-- Rows displaying document details -->
			<tr class="tables-row">
				<td class="table-label">Name</td>
				<td class="table-data">{name}</td>
			</tr>

<<<<<<< HEAD
	<table class="w-full">
		<tbody>
			<tr class="tables-row">
				<Label text="Name" />
				<td class="table-data">{name}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Description" />
				<td class="table-data">{description}</td>
			</tr>

			<tr class="tables-row">
				<Label text="File Name" />
				<td class="table-data flex items-center gap-4">
					{fileName}
					<Button
						type="button"
						text="Open with Document Viewer"
						variant="primary"
						onclick={viewDocument}
					/>
				</td>
			</tr>

			<tr class="tables-row">
				<Label text="Keywords" />
				<td class="table-data">{keywords}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Document Type" />
				<td class="table-data">{documentType}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Version" />
				<td class="table-data">{parentDocumentVersion}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Active" />
				<td class="table-data">{isActive}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Chunking Strategy" />
				<td class="table-data">{chunkingStrategy}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Chunking Length" />
				<td class="table-data">{chunkingLength}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Chunk Overlap" />
				<td class="table-data">{chunkOverlap}</td>
			</tr>

			<tr class="tables-row">
				<Label text="Splitter" />
				<td class="table-data">{splitter}</td>
			</tr>
		</tbody>
	</table>

	<div class="btn-container mt-6 flex flex-wrap items-center justify-between gap-4">
		<Button
			href={editRoute}
			text="Edit"
			variant="primary"
			iconBefore="material-symbols:edit-outline"
			iconSize="md"
			size="md"
		/>

		{#await promise}
			<Button type="submit" text="Publishing" variant="primary" disabled={true} />
		{:then data}
			<Button type="submit" text="Publish" variant="primary" />
		{/await}
=======
			<tr class="tables-row">
				<td class="table-label">Description</td>
				<td class="table-data">{description}</td>
			</tr>

			<tr class="tables-row">
				<td class="table-label">File Name</td>
				<td class="table-data"
					>{fileName}
					<Button
						text="Open with Document Viewer"
						type="button"
						variant="primary"
						onclick={viewDocument}
						className="ml-2"
						size="sm"
					/>
				</td>
			</tr>

			<tr class="tables-row">
				<td class="table-label">Keywords </td>
				<td class="table-data">{keywords}</td>
			</tr>

			<tr class="tables-row">
				<td class="table-label">Document Type</td>
				<td class="table-data">{documentType}</td>
			</tr>

			<!-- <tr class="tables-row">
						<td>Source</td>
						<td>{source}</td>
					</tr> -->
			<!-- <tr class="tables-row">
							<td>Parent Document</td>
							<td>{parentDocument}</td>
						</tr> -->

			<tr class="tables-row">
				<td class="table-label">Version</td>
				<td class="table-data">{parentDocumentVersion}</td>
			</tr>

			<tr class="tables-row">
				<td class="table-label">Active</td>
				<td class="table-data">{isActive}</td>
			</tr>

			<tr class="tables-row">
				<td class="table-label">Chunking Strategy</td>
				<td class="table-data">{chunkingStrategy}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Chunking Length</td>
				<td class="table-data">{chunkingLength}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Chunking Overlap</td>
				<td class="table-data">{chunkOverlap}</td>
			</tr>
			<tr class="tables-row">
				<td class="table-label">Splitter</td>
				<td class="table-data">{splitter}</td>
			</tr>
			<!-- <tr class="tables-row">
						<td>Last Updated</td>
						<td>{createdBy}</td>
					</tr> -->
		</tbody>
	</table>

	<div class=" btn-container">
		<Button href={editRoute} text="Edit" variant="primary" iconBefore="mdi:edit" iconSize="md"
		></Button>
>>>>>>> develop
	</div>

	<FilePreviewModal {showModal} {fileUrl} {fileType} {closeModal} />
</div>
<FilePreviewModal {showModal} {fileUrl} {fileType} {closeModal} />
