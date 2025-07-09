<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let assets = $state(data.assets.Items);
	let retrivedAssets = $derived(assets);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);
	let promise = $state();

	const userId = page.params.userId;
	const assetType = data.assetTypes;

	let types = assetType.Data.AssetTypes;
	let selectedAssetType = $state('Action plan');

	let nameAssetSearch = $state(undefined);
	let codeAssetSearch = $state(undefined);

	let totalAssetsCount = $state(data.assets.TotalCount);
	$inspect('totalAssetsCount', totalAssetsCount);
	let isSortingName = $state(false);
	let isSortingCode = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalAssetsCount,
		amounts: [10, 20, 30, 50]
	});

	const assetRouteMap = {
		'Action plan': 'action-plans',
		Animation: 'animations',
		Appointment: 'appointments',
		Article: 'articles',
		Assessment: 'assessments',
		Audio: 'audio',
		Biometrics: 'biometrics',
		Challenge: 'challenges',
		Checkup: 'checkups',
		Consultation: 'consultations',
		Exercise: 'exercises',
		Goal: 'goals',
		Infographics: 'infographics',
		Medication: 'medications',
		Meditation: 'meditations',
		Message: 'messages',
		Nutrition: 'nutritions',
		Physiotherapy: 'physiotherapy',
		Priority: 'priorities',
		Reflection: 'reflections',
		Reminder: 'reminders',
		Video: 'video',
		'Web link': 'web-links',
		'Web newsfeed': 'web-newsfeeds',
		'Word power': 'word-power'
	};

	let createRoute = $derived(
		`/users/${userId}/careplan/assets/${assetRouteMap[selectedAssetType]}/create/`
	);
	let assetRoute = $derived(`/users/${userId}/careplan/assets`);
	const editRoute = (rowId: string) =>
		`/users/${userId}/careplan/assets/${assetRouteMap[selectedAssetType]}/${rowId}/edit`;

	const viewRoute = (rowId: string) =>
		`/users/${userId}/careplan/assets/${assetRouteMap[selectedAssetType]}/${rowId}/view`;

	const breadCrumbs = [{ name: 'Assets', path: assetRoute }];

	async function searchAssets(model) {
		try {
			const selectedAssetRoute = assetRouteMap[selectedAssetType];
			let url = `/api/server/careplan/assets/search?assetType=${selectedAssetRoute}`;
			url += `&sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.nameAssetSearch) url += `&name=${model.nameAssetSearch}`;
			if (model.codeAssetSearch) url += `&code=${model.codeAssetSearch}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			if (!res.ok) {
				console.error(`Search failed with status ${res.status}`);
				const errorText = await res.text(); // Get error response body
				console.error('Error body:', errorText);
				throw new Error(`Search failed: ${res.status}`);
			}
			const searchResult = await res.json();
			console.log('searchResult', searchResult);

			totalAssetsCount = searchResult.Data.TotalCount;
			paginationSettings.size = totalAssetsCount;

			assets = searchResult.Data.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function onSearchInput(e, field: 'name' | 'code') {
		clearTimeout(debounceTimeout);
		const keyword = e.target.value;

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;

			if (field === 'name') nameAssetSearch = keyword;
			if (field === 'code') codeAssetSearch = keyword;

			searchAssets({
				nameAssetSearch: nameAssetSearch,
				codeAssetSearch: codeAssetSearch,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortBy,
				sortOrder
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;
		isSortingCode = false;

		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		if (columnName === 'Code') {
			isSortingCode = true;
		}
		sortBy = columnName;
		searchAssets({
			nameAssetSearch: nameAssetSearch,
			codeAssetSearch: codeAssetSearch,
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
		searchAssets({
			nameAssetSearch: nameAssetSearch,
			codeAssetSearch: codeAssetSearch,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortBy,
			sortOrder
		});
	}

	function onPageChange() {
		searchAssets({
			nameAssetSearch: nameAssetSearch,
			codeAssetSearch: codeAssetSearch,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	}

	const onSelectAssetType = async (e) => {
		selectedAssetType = e.currentTarget.value;
		paginationSettings.page = 0;
		await searchAssets({
			sessionId: data.sessionId,
			selectedAssetType,
			pageIndex: 0
		});
	};

	const handleAssetsDelete = async (id) => {
		console.log('Inside handleAssetsDelete', id);
		const response = await fetch(
			`/api/server/careplan/assets/${id}?assetType=${assetRouteMap[selectedAssetType]}`,

			{
				method: 'DELETE',
				headers: { 'content-type': 'application/json' }
			}
		);

		const res = await response.json();
		console.log('deleted Response', res);
		if (res.HttpCode === 200) {
			isDeleting = true;
			toastMessage(res);
		} else {
			toastMessage(res);
		}
		searchAssets({
			nameAssetSearch: nameAssetSearch,
			codeAssetSearch: codeAssetSearch,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-2">
	<div class="mx-auto">
		<div class="relative flex w-full md:w-1/3">
			<select id="height" class="select" onchange={onSelectAssetType}>
				{#each types as val}
					<option value={val}>
						{val}
					</option>
				{/each}
			</select>
			<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
				<Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
			</div>
		</div>

		<div class="table-container mt-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<input
							type="text"
							name="name"
							placeholder="Search by name"
							bind:value={nameAssetSearch}
							oninput={(event) => onSearchInput(event, 'name')}
							class="table-input-field !pr-4 !pl-10"
						/>
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						{#if nameAssetSearch}
							<button
								type="button"
								onclick={() => {
									nameAssetSearch = '';
									onSearchInput({ target: { name: 'name', value: '' } }, 'name');
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<div class="relative w-auto grow">
						<input
							type="text"
							name="code"
							placeholder="Search by code"
							bind:value={codeAssetSearch}
							oninput={(event) => onSearchInput(event, 'code')}
							class="table-input-field !pr-4 !pl-10"
						/>

						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						{#if codeAssetSearch}
							<button
								type="button"
								onclick={() => {
									codeAssetSearch = '';
									onSearchInput({ target: { name: 'code', value: '' } }, 'code');
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<Button href={createRoute} text="Add New" variant="primary" />
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class="w-[5%]"></th>
							<th class="w-[20%]">
								<button onclick={() => sortTable('Name')}>
									Name
									{#if isSortingName}
										<Icon
											icon={`mdi:chevron-${sortOrder === 'ascending' ? 'up' : 'down'}`}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th class="w-[20%]">
								<button onclick={() => sortTable('Code')}>
									Code
									{#if isSortingCode}
										<Icon
											icon={`mdi:chevron-${sortOrder === 'ascending' ? 'up' : 'down'}`}
											class="ml-1 inline"
											width="16"
										/>
									{/if}
								</button>
							</th>
							<th class="w-[20%]">Type</th>
							<th class="w-[20%]">Created Date</th>
							<!-- <th class="text-right whitespace-nowrap">Actions</th> -->
						</tr>
					</thead>
					<tbody>
						{#if retrivedAssets.length <= 0}
							<tr>
								<td class="text-center" colspan="6">
									{isLoading ? 'Loading...' : 'No records found'}
								</td>
							</tr>
						{:else}
							{#each retrivedAssets as row, index}
								<tr>
									<td>{paginationSettings.page * paginationSettings.limit + index + 1}</td>
									<td>
										<Tooltip text={row.Code || 'Not specified'}>
											<a href={viewRoute(row.id)}>{Helper.truncateText(row.Name, 50)}</a>
										</Tooltip>
									</td>
									<td>{row.AssetCode || 'Not specified'}</td>
									<td>{row.AssetCategory || 'Not specified'}</td>
									<td>{TimeHelper.formatDateToReadable(row.CreatedAt)}</td>
									<td>
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
	title="Delete Asset"
	onConfirm={handleAssetsDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
