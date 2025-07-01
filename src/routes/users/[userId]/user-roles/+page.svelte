<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { LocaleIdentifier, TimeHelper } from '$lib/utils/time.helper';
	import { SYSTEM_ID } from '$lib/constants';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();
	let debounceTimeout;
	let isLoading = $state(false);
	let userRoles = $state(data.userRoles.Items);
	let retrivedUserRoles = $derived(userRoles);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const createRoute = `/users/${userId}/user-roles/create`;
	const editRoute = (id) => `/users/${userId}/user-roles/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/user-roles/${id}/view`;
	const userRoleRoute = `/users/${userId}/user-roles`;

	const breadCrumbs = [{ name: 'User Roles', path: userRoleRoute }];

	let roleName = $state(undefined);
	let tags = $state('');
	let sortBy = $state('RoleName');
	let sortOrder = $state('ascending');

	$inspect('rolename', roleName);
	let totalUserRolesCount = $state(data.userRoles.TotalCount);
	let isSortingRoleName = $state(false);
	let isSortingTags = $state(false);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalUserRolesCount,
		amounts: [10, 20, 30, 50]
	});

	async function searchUserRoles(model) {
		try {
			let url = `/api/server/person-role-types/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			if (model.roleName) url += `&name=${model.roleName}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			console.log('searchResult', searchResult);

			totalUserRolesCount = searchResult.Data.Roles.TotalCount;
			paginationSettings.size = totalUserRolesCount;

			userRoles = searchResult.Data.Roles.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
			searchKeyword = model.roleName;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		let searchKeyword = e.target.value;
		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0; // reset page when typing new search
			searchUserRoles({
				roleName: searchKeyword,
				tags,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortOrder,
				sortBy
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingRoleName = false;
		isSortingTags = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'RoleName') {
			isSortingRoleName = true;
		} else if (columnName === 'Tags') {
			isSortingTags = true;
		}
		sortBy = columnName;
		searchUserRoles({
			roleName: searchKeyword,

			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	const handleDeleteClick = (id: string) => {
		openDeleteModal = true;
		idToBeDeleted = id;
	};

	function onItemsPerPageChange() {
		paginationSettings.page = 0; // reset to first page
		searchUserRoles({
			roleName: searchKeyword,

			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: 0,
			sortOrder,
			sortBy
		});
	}

	function onPageChange() {
		searchUserRoles({
			roleName: searchKeyword,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	const handleUserRoleDelete = async (id) => {
		const response = await fetch(`/api/server/person-role-types/${id}`, {
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

		searchUserRoles({
			roleName: searchKeyword,
			tags,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container mb-6 shadow">
			<div class="search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="roleName"
							bind:value={roleName}
							placeholder="Search by name"
							oninput={(event) => onSearchInput(event)}
							class="input !pr-4 !pl-10"
						/>
						{#if roleName}
							<button
								type="button"
								onclick={() => {
									roleName = '';
									onSearchInput({ target: { value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					{#if SYSTEM_ID !== 'AHA'}
						<Button href={createRoute} text="Add New" variant="primary"></Button>
					{/if}
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-12"></th>
							<th class="w-60">
								<button onclick={() => sortTable('RoleName')}>
									Name {#if isSortingRoleName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-72">Description</th>
							<th data-sort="isActive" class="w-32">Active</th>
							<th data-sort="CreatedAt" class="w-32">Created </th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedUserRoles.length <= 0}
							<tr class="text-center">
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedUserRoles as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td>
										<Tooltip text={row.RoleName || 'Not specified'}>
											<a href={viewRoute(row.id)}>{Helper.truncateText(row.RoleName, 20)} </a>
										</Tooltip>
									</td>
									<td>
										<Tooltip text={row.Description || 'Not specified'}>
											<span class="cursor-pointer">
												{row.Description !== null
													? Helper.truncateText(row.Description, 60)
													: 'Not specified'}
											</span>
										</Tooltip>
									</td>
									<td>{row.isActive ? 'Yes' : 'No'}</td>
									<td>
										{TimeHelper.formatDateToReadable(row.CreatedAt, LocaleIdentifier.EN_US)}
									</td>

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
	title="Delete User roles"
	onConfirm={handleUserRoleDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
