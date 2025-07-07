<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import type { PaginationSettings } from '$lib/types/common.types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Tooltip from '$lib/components/tooltip.svelte';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { Helper } from '$lib/utils/helper';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	$inspect("This is data",data)
	let debounceTimeout;
	let isLoading = $state(false);
	let assessmentNodes = $state(data.assessmentNodes.Items);
	let retrivedAssessmentNodes = $derived(
		assessmentNodes.filter(node => node.Title !== "Assessment root node")
	);

	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const templateId = page.params.templateId;

	const assessmentRoute = `/users/${userId}/assessment-templates`;
	const assessmentNodeRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes`;
	const editRoute = (id) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${id}/edit`;
	const viewRoute = (id) =>
		`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${id}/view`;
	const createRoute = `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/create`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentRoute },
		{ name: 'Nodes', path: assessmentNodeRoute }
	];

	let title = $state(undefined);
	let nodeType = $state(undefined);
	let tags = $state(undefined);

	let sortBy = $state('Title');
	let sortOrder = $state('ascending');

	let totalAssessmentNodesCount = $state(data.assessmentNodes.TotalCount);
	let isSortingTitle = $state(false);
	let isSortingNodeType = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalAssessmentNodesCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchNode(model) {
		try {
			let url = `/api/server/assessments/assessment-nodes/search?templateId=${templateId}&`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.title) url += `&title=${model.title}`;
			if (model.nodeType) url += `&nodeType=${model.nodeType}`;
			if (model.tags) url += `&tags=${tags}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();

			totalAssessmentNodesCount = searchResult.Data.AssessmentNodeRecords.TotalCount;
			paginationSettings.size = totalAssessmentNodesCount;
			assessmentNodes = searchResult.Data.AssessmentNodeRecords.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));

			searchKeyword = model.title;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'title') {
			title = value;
		} else if (name === 'nodeType') {
			nodeType = value;
		} else if (name === 'tags') {
			tags = value;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;
		updateSearchField(name, value);

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;
			searchNode({
				title,
				nodeType,
				tags,
				itemsPerPage: paginationSettings.limit,
				pageIndex: paginationSettings.page,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingTitle = false;
		isSortingNodeType = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Title') {
			isSortingTitle = true;
		} else if (columnName === 'NodeType') {
			isSortingNodeType = true;
		}
		sortBy = columnName;
		searchNode({
			title,
			nodeType,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onItemsPerPageChange() {
		paginationSettings.page = 0;
		searchNode({
			title,
			nodeType,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchNode({
			title,
			nodeType,
			tags,
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

	const handleAssessmentNodeDelete = async (id) => {
		const response = await fetch(
			`/api/server/assessments/assessment-nodes/${id}?templateId=${templateId}`,
			{
				method: 'DELETE',
				headers: { 'content-type': 'application/json' }
			}
		);

		const res = await response.json();

		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchNode({
			title,
			nodeType,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="title"
							placeholder="Search by title"
							oninput={(event) => onSearchInput(event)}
							bind:value={title}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if title}
							<button
								type="button"
								onclick={() => {
									title = '';
									onSearchInput({ target: { name: 'title', value: '' } });
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
							type="text"
							name="type"
							placeholder="Search by node type"
							oninput={(event) => onSearchInput(event)}
							bind:value={nodeType}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if nodeType}
							<button
								type="button"
								onclick={() => {
									nodeType = '';
									onSearchInput({ target: { name: 'nodeType', value: '' } });
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
							type="text"
							name="tags"
							placeholder="Search by tags"
							oninput={(event) => onSearchInput(event)}
							bind:value={tags}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if tags}
							<button
								type="button"
								onclick={() => {
									tags = '';
									onSearchInput({ target: { name: 'tags', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" class="text-lg" />
							</button>
						{/if}
					</div>
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute}>Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-12">Id</th>
							<th>
								<button onclick={() => sortTable('Title')}>
									Title
									{#if isSortingTitle}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th>
								<button onclick={() => sortTable('NodeType')}>
									Node Type
									{#if isSortingNodeType}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-[20%]">Query Response Type</th>
							<th class="w-[20%]">Tags</th>
						</tr>
					</thead>
					<tbody class="">
						{#if retrivedAssessmentNodes.length <= 0}
							<tr class="text-center">
								<td aria-colindex={1} colspan="8">
									{isLoading ? 'Loading...' : 'No records found'}
								</td>
							</tr>
						{:else}
							{#each retrivedAssessmentNodes as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td role="gridcell" aria-colindex={2} tabindex="0">
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Title !== null && row.Title !== ''
													? Helper.truncateText(row.Title, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={3} tabindex="0">
										{Helper.truncateText(row.NodeType, 40)}
									</td>
									<td>{row.QueryResponseType ? row.QueryResponseType : 'Not specified'}</td>
									<td role="gridcell" aria-colindex={2} tabindex="0"
										>{row.Tags.length > 0 ? row.Tags : 'Not specified'}</td
									>
									<!-- <td>
							<a href={editRoute(row.id)} class="btn hover:variant-soft-primary -my-1 p-2">
								<Icon icon="material-symbols:edit-outline" class="text-lg" />
							</a>
						</td> -->
									<td role="gridcell" aria-colindex={2} tabindex="0">
										<div class="flex justify-end">
											<Button
												href={editRoute(row.id)}
												variant="icon"
												icon="material-symbols:edit-outline"
												iconSize="sm"
												tooltip="Edit"
											/>
											<Button
												href={viewRoute(row.id)}
												variant="icon"
												icon="icon-park-outline:preview-open"
												iconSize="sm"
												tooltip="View"
											/>
											<Button
												onclick={() => handleDeleteClick(row.id)}
												variant="icon"
												icon="material-symbols:delete-outline-rounded"
												iconSize="sm"
												color="red"
												tooltip="Delete"
											/>
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
	title="Delete Assessment Node"
	onConfirm={handleAssessmentNodeDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
