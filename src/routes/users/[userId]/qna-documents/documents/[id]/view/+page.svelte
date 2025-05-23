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
				`/api/server/file-resources/download/${resourceId}?asAttachment=false`
			);

			console.log('res', res);

			if (!res.ok) {
				console.error('Failed to fetch file');
				toastMessage();
				return;
			}

			const mimeType = res.headers.get('Content-Type');
			fileType = mimeType;

			const blob = await res.blob();
			fileUrl = URL.createObjectURL(blob);
			showModal = true;
		} catch (error) {
			toastMessage();
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

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<a href={editRoute} class="table-btn variant-filled-secondary hover:!variant-soft-secondary">
			<Icon icon="material-symbols:edit-outline" class="mr-1" />
			<span>Edit</span>
		</a>
	</div>

	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>View Document</th>
							<th class="text-end">
								<a href={documentRoute} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" class="text-lg" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<!-- Rows displaying document details -->
						<tr>
							<td>Name</td>
							<td>{name}</td>
						</tr>

						<tr>
							<td>Description</td>
							<td>{description}</td>
						</tr>

						<tr>
							<td>Version</td>
							<td>{parentDocumentVersion}</td>
						</tr>

						<tr>
							<td>File Name</td>
							<td class="flex items-center"
								>{fileName}
								<button
									type="button"
									class="table-btn variant-filled-secondary mx-5"
									onclick={viewDocument}>Open with Document Viewer</button
								>
							</td>
						</tr>

						<tr>
							<td>Keywords </td>
							<td>{keywords}</td>
						</tr>

						<tr>
							<td>Document Type</td>
							<td>{documentType}</td>
						</tr>

						<!-- <tr>
						<td>Source</td>
						<td>{source}</td>
					</tr> -->
						<tr>
							<td>Parent Document</td>
							<td>{parentDocument}</td>
						</tr>

						<tr>
							<td>Active</td>
							<td>{isActive}</td>
						</tr>

						<tr>
							<td>Chunking Strategy</td>
							<td>{chunkingStrategy}</td>
						</tr>
						<tr>
							<td>Chunking Length</td>
							<td>{chunkingLength}</td>
						</tr>
						<tr>
							<td>Chunking Overlap</td>
							<td>{chunkOverlap}</td>
						</tr>
						<tr>
							<td>Splitter</td>
							<td>{splitter}</td>
						</tr>
						<!-- <tr>
						<td>Last Updated</td>
						<td>{createdBy}</td>
					</tr> -->
					</tbody>
				</table>

				<div class="button-container">
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Publishing
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Publish </button>
					{/await}
				</div>
			</form>
		</div>
		<FilePreviewModal {showModal} {fileUrl} {fileType} {closeModal} />
	</div>
</div>
