<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';
	import Tooltip from '$lib/components/tooltip.svelte';
	import type { PaginationSettings } from '$lib/types/common.types';
	import Confirmation from '$lib/components/confirmation.modal.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let debounceTimeout;
	let isLoading = $state(false);
	let users = $state(data.users.Items);
	const tmp = LocalStorageUtils.getItem('personRoles');
	const personRoles = JSON.parse(tmp);
	let retrivedUsers = $derived(
		users.map((user) => ({
			...user,
			RoleName: getRoleNameById(user.RoleId)
		}))
	);
	let openDeleteModal = $state(false);
	let idToBeDeleted = $state(null);
	let isDeleting = $state(false);
	let searchKeyword = $state(undefined);

	const userId = page.params.userId;
	const userRoute = `/users/${userId}/users`;
	const editRoute = (id) => `/users/${userId}/users/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/users/${id}/view`;
	const createRoute = `/users/${userId}/users/create`;

	const breadCrumbs = [{ name: 'Users', path: userRoute }];

	let firstName = undefined;
	let email = $state(undefined);
	let phone = $state(undefined);
	let sortBy = $state('CreatedAt');
	let sortOrder = $state('ascending');

	let totalUsersCount = $state(data.users.TotalCount);
	let isSortingName = $state(false);
	let isSortingCode = $state(false);
	let isSortingEmail = $state(false);
	let isSortingPhone = false;
	let selectedRoles = data.selectedRoles;

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalUsersCount,
		amounts: [10, 20, 30, 50]
	});

	console.log('personRoles', personRoles);
	function getRoleNameById(roleId) {
		if (Array.isArray(personRoles) && personRoles.length > 0) {
			const role = personRoles.find((role) => role.id === roleId);

			return role ? role.RoleName : 'Not Specified';
		}
		return 'Not Specified';
	}

	async function searchUser(model) {
		try {
			console.log(model);
			let url = `/api/server/users/search?`;
			url += `sortOrder=${model.sortOrder ?? sortOrder}`;
			url += `&sortBy=${model.sortBy ?? sortBy}`;
			url += `&itemsPerPage=${model.itemsPerPage ?? paginationSettings.limit}`;
			url += `&pageIndex=${model.pageIndex ?? paginationSettings.page}`;
			url += `&roleIds=${model.roleIds ?? selectedRoles}`;

			if (phone) url += `&phone=${phone}`;
			if (email) url += `&email=${email}`;

			const res = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
			totalUsersCount = searchResult.TotalCount;
			paginationSettings.size = totalUsersCount;

			users = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	function updateSearchField(name, value) {
		if (name === 'phone') {
			phone = value;
		} else if (name === 'email') {
			email = value;
		}
	}

	async function onSearchInput(e) {
		clearTimeout(debounceTimeout);
		const { name, value } = e.target;

		updateSearchField(name, value);
		// console.log('event', e.target);

		debounceTimeout = setTimeout(() => {
			paginationSettings.page = 0;
			searchUser({
				firstName,
				email,
				phone,
				itemsPerPage: paginationSettings.limit,
				pageIndex: 0,
				sortOrder,
				sortBy
			});
		}, 400);
	}

	function sortTable(columnName) {
		isSortingName = false;
		isSortingCode = false;
		isSortingEmail = false;
		isSortingPhone = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'FirstName') {
			isSortingName = true;
		} else if (columnName === 'LastName') {
			isSortingCode = true;
		} else if (columnName === 'Email') {
			isSortingEmail = true;
		} else if (columnName === 'Phone') {
			isSortingPhone = true;
		}
		sortBy = columnName;

		searchUser({
			firstName,
			email,
			phone,
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
		searchUser({
			firstName,
			email,
			phone,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	function onPageChange() {
		searchUser({
			firstName,
			email,
			phone,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortOrder,
			sortBy
		});
	}

	const handleUserDelete = async (id) => {
		const response = await fetch(`/api/server/users/${id}`, {
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

		searchUser({
			firstName,
			email,
			phone,
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
							name="phone"
							placeholder="Search by contact"
							bind:value={phone}
							oninput={(event) => onSearchInput(event)}
							class="input !pr-4 !pl-10"
						/>
						{#if phone}
							<button
								type="button"
								onclick={() => {
									phone = '';
									onSearchInput({ target: { name: 'phone', value: '' } });
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
							name="email"
							oninput={(event) => onSearchInput(event)}
							placeholder="Search by email"
							bind:value={email}
							class="input !pr-4 !pl-10"
						/>
						{#if email}
							<button
								type="button"
								onclick={() => {
									email = '';
									onSearchInput({ target: { name: 'email', value: '' } });
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<Button href={createRoute} text="Add New" variant="primary"></Button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="table-c min-w-full">
					<thead>
						<tr>
							<th class=" w-12"></th>
							<th class=" w-36">
								<button onclick={() => sortTable('FirstName')}>
									First Name {#if isSortingName}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class=" inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th class="w-36">
								<button onclick={() => sortTable('LastName')}>
									Last Name
									{#if isSortingCode}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button>
							</th>
							<th data-sort="Phone" class=" w-32">Contact</th>
							<th class=" w-32">
								<button onclick={() => sortTable('Email')}>
									Email {#if isSortingEmail}
										{#if sortOrder === 'ascending'}
											<Icon icon="mdi:chevron-up" class="ml-1 inline" width="16" />
										{:else}
											<Icon icon="mdi:chevron-down" class="ml-1 inline" width="16" />
										{/if}
									{/if}
								</button></th
							>
							<th class=" w-28">Role</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedUsers.length <= 0}
							<tr class="text-center">
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedUsers as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>
									<td tabindex="0">
										<Tooltip text={row.Person.FirstName || 'Not specified'}>
											<a href={!row.IsPermitted ? null : viewRoute(row.id)}
												>{Helper.truncateText(row.Person.FirstName, 20) || 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td tabindex="0">
										{row.Person.LastName || 'Not specified'}
									</td>
									<td tabindex="0">{row.Person.Phone || 'Not specified'} </td>
									<td tabindex="0">{row.Person.Email || 'Not specified'}</td>
									<td tabindex="0">{row.RoleName || 'Not specified'}</td>

									<td>
										<div class="flex">
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
	title="Delete Users"
	onConfirm={handleUserDelete}
	id={idToBeDeleted}
/>

<Pagination bind:paginationSettings {onItemsPerPageChange} {onPageChange} />
