<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	///////////////////////////////////////////////////////////////////////////////
	let { data }: { data: PageServerData } = $props();

	console.log('documents data', data);

	let id = data.document.id;
	let name = data.document.Name;
	let description = data.document.Description;
	let fileName = data.document.FileResource.OriginalFilename;
	let source = data.document.Source;
	let parentDocument = data.document.FileResource.OriginalFilename;
	let parentDocumentVersion = data.document.DocumentVersion.map((row) => row.Version);
	let chunkingStrategy = data.document.ChunkingStrategy;
	let chunkingLength = data.document.ChunkingLength;
	let chunkOverlap = data.document.ChunkOverlap;
	let splitter = data.document.Splitter;
	let isActive = data.document.IsActive;
	let createdBy = data.document.CreatedBy;
	let keywords = data.document.Keyword;
	let documentType = data.document.DocumentType;
	// fileName: z.string(),
	// source: z.string().optional(),
	// parentDocument: z.string().optional(),
	// parentDocumentVersion: z.string().optional(),
	// chunkingStrategy: z.string().optional(),
	// chunkingLength: z.string().optional(),
	// chunkingOverlap: z.string().optional(),
	// splitter: z.string().optional(),
	// isActive: z.string().optional(),
	// createdBy :  z.string().optional(),
	// let id = '';
	// let name = 'Maternity-Pregnancy';
	// let displayCode = '432435';
	// let description = 'This Document contain all the information needed preganancy care and parental guidence.';
	// let type = 'CSV';
	// let version = 'V3';
	// let fileName = 'maternity-pregnancy.csv';
	// let source = 'Library';
	// let parentDocument = 'maternity_faqs.csv';
	// let active = 'Yes';
	// let keywords = 'Neo Natal, Pregnancy, Nutrition';
	// let storageKey = '';
	// let chunkingStrategy = 'Recursive Strcture Aware Splitting';
	// let chunkingLength = '400';
	// let chunkingOverlap = '60';
	// let splitter = '\n';
	// let lastUpdated = '5 days ago';

	// Extracting userId and tenantId from page params
	const userId = page.params.userId;
	const tenantId = page.params.id;

	// Generating routes for edit, view, and document
	const editRoute = `/users/${userId}/qna-documents/documents/${id}/edit`;
	const viewRoute = `/users/${userId}/qna-documents/documents/${id}/view`;
	const documentRoute = `/users/${userId}/qna-documents/documents`;

	// Generating breadcrumb items
	const breadCrumbs = [
		{
			name: 'Document',
			path: documentRoute
		},
		{
			name: 'View',
			path: viewRoute
		}
	];
</script>

<!-- Rendering breadcrumbs component -->
<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="flex flex-wrap justify-end gap-2 py-2">
		<a
			href={editRoute}
			class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
		>
			<Icon icon="material-symbols:edit-outline" />
			<span>Edit</span>
		</a>
	</div>

	<div class="mx-auto">
		<div class="health-system-table-container">
			<table class="health-system-table">
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
						<td>{fileName}</td>
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
		</div>
	</div>
</div>
