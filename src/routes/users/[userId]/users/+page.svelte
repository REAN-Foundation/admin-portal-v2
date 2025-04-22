<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	// import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { onMount } from 'svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;

	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let retrivedUsers = $state();
	let users = $state(data.users.Items);
	console.log('retrivedUsers@', data.users.Items);
	const userId = page.params.userId;
	const userRoute = `/users/${userId}/users`;
	const editRoute = (id) => `/users/${userId}/users/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/users/${id}/view`;
	const createRoute = `/users/${userId}/users/create`;

	const breadCrumbs = [{ name: 'Users', path: userRoute }];

	let firstName = undefined;
	let email = $state(undefined);
	let phone = $state(undefined);
	let sortBy = 'FirstName';
	let sortOrder = $state('ascending');
	let itemsPerPage = 10;
	let offset = 0;
	let totalUsersCount = $state(data.users.TotalCount);
	let isSortingName = $state(false);
	let isSortingCode = $state(false);
	let isSortingEmail = false;
	let isSortingPhone = false;
	let items = 10;
	let selectedRoles = data.selectedRoles;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	let paginationSettings = $derived({
		page: 0,
		limit: 10,
		size: totalUsersCount,
		amounts: [10, 20, 30, 50]
	});

	// $effect(() => {
	// 	if (phone || email) {
	// 		paginationSettings.page = 0;
	// 	}
	// });

	// const tmp = LocalStorageUtils.getItem('personRoles');
	// const personRoles = JSON.parse(tmp);
	// personRoles?.map((x) => {
	//     if (x.RoleName === "System admin" ||
	//         x.RoleName === "System user"  ||
	//         x.RoleName === "Tenant admin" ||
	//         x.RoleName === "Tenant user") {
	//             selectedRoles.push(x.id);
	//         }});
	const tmp = LocalStorageUtils.getItem('personRoles');
	const personRoles = JSON.parse(tmp);
	// $: console.log('personRoles', personRoles);
	function getRoleNameById(roleId) {
		if (Array.isArray(personRoles) && personRoles.length > 0) {
			const role = personRoles.find((role) => role.id === roleId);
			return role ? role.RoleName : 'Not Specified';
		}
		return 'Not Specified';
	}

	users = users.map((user) => {
		return {
			...user,
			RoleName: getRoleNameById(user.RoleId)
		};
	});

	async function searchUser(model) {
		console.log(model);
		let url = `/api/server/users/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;
		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offset) url += `&pageIndex=${offset}`;
		if (firstName) url += `&firstName=${firstName}`;
		if (email) url += `&email=${email}`;
		if (phone) url += `&phone=${phone}`;
		if (selectedRoles.length > 0) url += `&roleIds=${selectedRoles}`;
		console.log('URL: ' + url);
		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		console.log('URL  : ' + url);
		console.log('Response: ' + JSON.stringify(searchResult));
		totalUsersCount = searchResult.TotalCount;
		users = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalUsersCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		users = users.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalUsersCount;
		retrivedUsers = users.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedUsers.length > 0) {
			isLoading = false;
		}
	});

	$effect(() => {
		if (!browser) return;
		searchUser({
			firstName: firstName,
			email: email,
			phone: phone,
			itemsPerPage: itemsPerPage,
			pageIndex: offset,
			sortOrder: sortOrder,
			sortBy: sortBy
		});
	});

	function onPageChange(e: CustomEvent): void {
		isLoading = true;
		let pageIndex = e.detail;
		itemsPerPage = items * (pageIndex + 1);
	}

	function onAmountChange(e: CustomEvent): void {
		if (phone || email) {
			isLoading = true;
			users = [];
		}
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
	}

	function sortTable(columnName) {
		isSortingName = false;
		isSortingCode = false;
		isSortingEmail = false;
		isSortingPhone = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'First Name') {
			isSortingName = true;
		} else if (columnName === 'Email') {
			isSortingEmail = true;
		} else if (columnName === 'Phone') {
			isSortingPhone = true;
		}
		sortBy = columnName;
	}

	const handleUserDelete = async (id) => {
		const userId = id;
		await Delete({
			sessionId: data.sessionId,
			userId
		});
		invalidate('app:users');
	};

	async function Delete(model) {
		await fetch(`/api/server/users/${model.userId}`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});

		window.location.href = userRoute;
	}

	function closeDeleteModal() {
		deleteButtonClicked = false;
		cardToDelete = null;
	}
	function openDeleteModal(id) {
		deleteButtonClicked = true;
		cardToDelete = id;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container mb-6 shadow">
			<div class="health-system-search-border">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="relative w-auto grow">
						<Icon
							icon="heroicons:magnifying-glass"
							class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							name="phone"
							placeholder="Search by contact number"
							bind:value={phone}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if phone}
							<button
								type="button"
								onclick={() => {
									phone = '';
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
							placeholder="Search by email"
							bind:value={email}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if email}
							<button
								type="button"
								onclick={() => {
									email = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					<button class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary">
						<a href={createRoute} class="">Add New</a>
					</button>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th class=" w-12"></th>
							<th class="w-32">
								<button onclick={() => sortTable('FirstName')}>
									First Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-32">
								<button onclick={() => sortTable('LastName')}>
									Last Name {isSortingCode ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th data-sort="Phone" class=" w-32">Contact Number</th>
							<th class=" w-32">Email</th>
							<th class=" w-28">Role</th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedUsers <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedUsers as row}
								<tr>
									<td tabindex="0">{row.index}</td>
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
									<!-- <td>
							<button>
								<a
									href={!row.IsPermitted ? null : editRoute(row.id)}
									class="btn hover:variant-soft-primary -my-1 p-2"
								>
									{#if row.IsPermitted}
										<Icon icon="material-symbols:edit-outline" class="text-lg" />
									{:else}
										<Icon
											icon="material-symbols:edit-outline"
											class="text-lg"
											style="color: #808b96"
										/>
									{/if}
								</a>
							</button>
						</td> -->
									<td>
										<!-- <Confirm confirmTitle="Delete" cancelTitle="Cancel" let:confirm={confirmThis}>
								<button
									disabled={userId === row.id || !row.IsPermitted ? true : false}
									on:click|preventDefault={() => {
										if (!row.IsPermitted) {
											toast.error(
												'Permission denied: Only resource owner & system admin are allowed to delete'
											);
										} else {
											confirmThis(handleUserDelete, row.id);
										}
									}}
									class="btn hover:variant-soft-error -my-1 p-2"
								>
									<Icon icon="material-symbols:delete-outline-rounded" class="text-lg" />
								</button>
								<span slot="title"> Delete </span>
								<span slot="description"> Are you sure you want to delete a user? </span>
							</Confirm> -->
										<div class="flex">
											<Tooltip text="Edit" forceShow={true}>
												<button class="">
													<a href={editRoute(row.id)} class="health-system-btn group">
														<Icon icon="material-symbols:edit-outline" class="health-system-icon" />
													</a>
												</button>
											</Tooltip>

											<Tooltip text="View" forceShow={true}>
												<button>
													<a href={viewRoute(row.id)} class=" health-system-btn group"
														><Icon
															icon="icon-park-outline:preview-open"
															class="health-system-icon"
														/>
													</a>
												</button>
											</Tooltip>

											<Tooltip text="Delete" forceShow={true}>
												<button
													class="health-system-btn !text-red-600"
													onclick={() => openDeleteModal(row.id)}
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

{#if deleteButtonClicked}
	<div class="confirm-modal-overlay"></div>

	<div class="confirm-modal-container">
		<div class="confirm-modal-subcontainer">
			<div class="confirm-card-container">
				<h1 class="confirm-card-heading">Are you absolutely sure?</h1>
				<p class="confirm-card-paragraph">
					This action cannot be undone. This will permanently delete your question and remove your
					data from our servers.
				</p>
			</div>

			<div class="confirm-card-btn-container">
				<button class="confirm-card-cancel-btn" onclick={closeDeleteModal}> Cancel </button>
				<button class="confirm-card-delete-btn" onclick={() => handleUserDelete(cardToDelete)}>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- <div class="variant-soft-secondary w-full rounded-lg p-2">
	<Paginator
		bind:settings={paginationSettings}
		on:page={onPageChange}
		on:amount={onAmountChange}
		buttonClasses=" text-primary-500"
		regionControl="bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200"
		controlVariant="rounded-full text-primary-500 "
		controlSeparator="fill-primary-400"
	/>
</div> -->
