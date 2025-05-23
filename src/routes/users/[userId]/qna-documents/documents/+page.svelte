<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import type { PageServerData } from './$types';
	import { Helper } from '$lib/utils/helper';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let documents = $state(data.documents.Items);

	let retrivedDocuments = $derived(documents);
	let debounceTimeout;
	let isLoading = $state(false);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);

	$inspect('retrivedDocuments', retrivedDocuments);

	const userId = page.params.userId;
	const documentsRoute = `/users/${userId}/qna-documents/documents`;
	const editRoute = (id) => `/users/${userId}/qna-documents/documents/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/qna-documents/documents/${id}/view`;
	const createRoute = `/users/${userId}/qna-documents/documents/create`;

	const breadCrumbs = [{ name: 'Q&A Documents', path: documentsRoute }];

	let name = $state(undefined);
	let documentType = $state(undefined);

	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let totalDocumentsCount = $state(data.documents.TotalCount);

	let isSortingName = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalDocumentsCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchDocuments(model) {
		try {
			let url = `/api/server/documents/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;

			if (model.name) url += `&name=${model.name}`;
			if (model.documentType) url += `&documentType=${model.documentType}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);

			totalDocumentsCount = searchResult.Data.TotalCount;
			paginationSettings.size = totalDocumentsCount;

			documents = searchResult.Data.Items.map((item, index) => ({ ...item, index: index + 1 }));
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name_, value } = e.target;

		if (name_ === 'name') {
			name = value;
		} else if (name_ === 'documentType') {
			documentType = value;
		}
		console.log('qna documents name**', name);
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchDocuments({
				name,
				documentType,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;

		searchDocuments({
			name,
			documentType,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchDocuments({
			name,
			documentType,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchDocuments({
			name,
			documentType,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const handleDocumentDelete = async (id) => {
		const response = await fetch(`/api/server/documents/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

		const res = await response.json();
		console.log('deleted Response', res);
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchDocuments({
			name,
			documentType,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};

	const downloadFile = async (id) => {
		const response = await fetch(`/api/server/file-resources/download/${id}?asAttachment=true`, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});

		const blob = await response.blob();

		const contentDisposition = response.headers.get('Content-Disposition');
		const fileNameMatch = contentDisposition?.match(/filename="(.+?)"/);
		const fileName = fileNameMatch?.[1] ?? 'downloaded-file';

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container shadow">
			<div class="search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>

						<input
							type="text"
							name="name"
							bind:value={name}
							oninput={(event) => onSearchInput(event)}
							placeholder="search by document"
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if name}
							<button
								type="button"
								onclick={() => {
									name = '';
									onSearchInput({ target: { name: 'name', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							oninput={(event) => onSearchInput(event)}
							type="text"
							name="documentType"
							bind:value={documentType}
							placeholder="search by type"
							class="table-input-field !pr-4 !pl-10"
						/>
						{#if documentType}
							<button
								type="button"
								onclick={() => {
									documentType = '';
									onSearchInput({ target: { name: 'documentType', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<button class="table-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c">
					<thead>
						<tr>
							<th class="w-10" data-sort="index"></th>
							<th class="w-52">
								<button onclick={() => sortTable('Name')}>
									Documents {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-24">Type</th>
							<th class="w-24">Version</th>
							<th class="w-52">Parent Document</th>
							<th class="w-20">Active</th>
							<!-- <th class="w-20">Last Updated</th> -->
							<th class="w-20">Source</th>
							<th class="w-16"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedDocuments.length <= 0}
							<tr class="text-center">
								<td colspan="6">No records found</td>
							</tr>
						{:else}
							{#each retrivedDocuments as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td>
										<a href={viewRoute(row.id)}>
											{row.Name !== null && row.Name !== ''
												? Helper.truncateText(row.Name, 20)
												: 'Not specified'}
										</a>
									</td>
									<td>
										{row.DocumentType !== null && row.DocumentType !== ''
											? Helper.truncateText(row.DocumentType, 20)
											: 'Not specified'}
									</td>
									<td>
										{#each row.DocumentVersion as row_}
											{row_.Version !== null && row_.Version !== ''
												? row_.Version
												: 'Not specified'}
										{/each}
									</td>
									<td>
										<button
											class="cursor-pointer text-blue-600 underline"
											onclick={(e) => {
												e.preventDefault();
												downloadFile(row.ResourceId);
											}}>Link</button
										>
									</td>
									<td>
										{#if row.IsActive !== null && row.IsActive !== ''}
											{#if row.IsActive === true}
												<span class="text-green-500">✔</span>
											{:else}
												<span class="text-red-500">✘</span>
											{/if}
										{:else}
											Not specified
										{/if}
									</td>

									<!-- <td>
										{row.LastUpdated !== null && row.LastUpdated !== ''
											? row.LastUpdated
											: 'Not specified'}
									</td> -->

									<td>
										{#each row.DocumentVersion as row_}
											{row_.DocumentSource !== null && row_.DocumentSource !== ''
												? row_.DocumentSource
												: 'Not specified'}
										{/each}
									</td>

									<td>
										<div class="flex">
											<Tooltip text="Edit" forceShow={true}>
												<button class="">
													<a href={editRoute(row.id)} class="table-btn group">
														<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
													</a>
												</button>
											</Tooltip>

											<Tooltip text="View" forceShow={true}>
												<button>
													<a href={viewRoute(row.id)} class=" table-btn group"
														><Icon
															icon="icon-park-outline:preview-open"
															class="health-system-icon"
														/>
													</a>
												</button>
											</Tooltip>

											<Tooltip text="Delete" forceShow={true}>
												<button
													class="table-btn !text-red-600"
													onclick={() => handleDeleteClick(row.id)}
												>
													<Icon icon="material-symbols:delete-outline-rounded" />
												</button>
											</Tooltip>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<Confirmation
	bind:isOpen={openDeleteModal}
	title="Delete Document"
	onConfirm={handleDocumentDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
