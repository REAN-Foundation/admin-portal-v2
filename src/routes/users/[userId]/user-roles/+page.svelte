<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	// import Confirm from '$lib/components/modal/confirmModal.svelte';
	import { Helper } from '$lib/utils/helper';
	import Icon from '@iconify/svelte';
	// import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	// import date from 'date-and-time';
	import type { PageServerData } from './$types';
	import { invalidate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { SYSTEM_ID } from '$lib/constants';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { onMount } from 'svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let data: PageServerData;
	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let userRoles = $state(data.userRoles.Items);
	let retrivedUserRoles = $state();
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/user-roles/create`;
	const editRoute = (id) => `/users/${userId}/user-roles/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/user-roles/${id}/view`;
	const userRoleRoute = `/users/${userId}/user-roles`;

	const breadCrumbs = [{ name: 'User Roles', path: userRoleRoute }];

	let roleName = undefined;
	let tags = undefined;
	let sortBy = undefined;
	let sortOrder = 'ascending';
	let itemsPerPage = 10;
	let offset = 0;
	let totalUserRolesCount = data.userRoles.TotalCount;
	let isSortingRoleName = false;
	let isSortingTags = false;
	let items = 10;
	let deleteButtonClicked = $state(false);
	let cardToDelete = $state('');

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: totalUserRolesCount,
		amounts: [10, 20, 30, 50]
	};

	// $: {
	// 	if (roleName) {
	// 		paginationSettings.page = 0;
	// 	}
	// }
	async function searchUserRoles(model) {
		console.log('model--------', model);
		let url = `/api/server/person-role-types/search?`;
		if (sortOrder) url += `sortOrder=${sortOrder}`;
		else url += `sortOrder=ascending`;

		if (sortBy) url += `&sortBy=${sortBy}`;
		if (itemsPerPage) url += `&itemsPerPage=${itemsPerPage}`;
		if (offset) url += `&pageIndex=${offset}`;
		if (roleName) url += `&roleName=${roleName}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const searchResult = await res.json();
		totalUserRolesCount = searchResult.TotalCount;
		userRoles = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
		if (totalUserRolesCount > 0) {
			isLoading = false;
		}
	}

	onMount(() => {
		userRoles = userRoles.map((item, index) => ({ ...item, index: index + 1 }));
		paginationSettings.size = totalUserRolesCount;
		retrivedUserRoles = userRoles.slice(
			paginationSettings.page * paginationSettings.limit,
			paginationSettings.page * paginationSettings.limit + paginationSettings.limit
		);
		if (retrivedUserRoles.length > 0) {
			isLoading = false;
		}
	});
	$effect(() => {
		if (!browser) return;
		searchUserRoles({
			type: roleName,
			tags: tags,
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
		if (roleName || tags) {
			isLoading = true;
			userRoles = [];
		}
		itemsPerPage = e.detail * (paginationSettings.page + 1);
		items = itemsPerPage;
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
	}

	const handleUserRoleDelete = async (id) => {
		const userRoleTypeId = id;
		console.log('userRoleId', userRoleTypeId);
		await Delete({
			sessionId: data.sessionId,
			personRoleTypeId: userRoleTypeId
		});
		invalidate('app:user-roles');
	};

	async function Delete(model) {
		await fetch(`/api/server/person-role-types/${model.personRoleTypeId}`, {
			method: 'DELETE',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});

		window.location.href = userRoleRoute;
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
							name="roleName"
							placeholder="Search by role name"
							bind:value={roleName}
							class="health-system-input !pr-4 !pl-10"
						/>
						{#if roleName}
							<button
								type="button"
								onclick={() => {
									roleName = '';
								}}
								class="close-btn"
							>
								<Icon icon="material-symbols:close" />
							</button>
						{/if}
					</div>
					{#if SYSTEM_ID !== 'AHA'}
						<button
							class="health-system-btn variant-filled-secondary hover:!variant-soft-secondary"
						>
							<a href={createRoute} class="">Add New</a>
						</button>
					{/if}
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="health-system-table min-w-full">
					<thead>
						<tr>
							<th data-sort="index" class="w-12"></th>
							<th class="w-60">
								<button onclick={() => sortTable('RoleName')}>
									Name {isSortingRoleName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class="w-72">Description</th>
							<th data-sort="isActive" class="w-32">Active</th>
							<th data-sort="CreatedAt" class="w-32">Created </th>
							<th class="w-20"></th>
						</tr>
					</thead>
					<tbody>
						{#if retrivedUserRoles <= 0}
							<tr>
								<td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
							</tr>
						{:else}
							{#each retrivedUserRoles as row}
								<tr>
									<td>{row.index}</td>
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
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
										{Helper.formatDate(row.CreatedAt)}
									</td>
									<!-- <td>
                            <a
                                href={editRoute(row.id)}
                                class="btn p-2 -my-1 hover:variant-soft-primary"
                            >
                                <Icon
                                    icon="material-symbols:edit-outline"
                                    class="text-lg"
                                />
                            </a>
                        </td> -->
									<td>
										<!-- <Confirm
                                confirmTitle="Delete"
                                cancelTitle="Cancel"
                                let:confirm={confirmThis}
                            >
                                <button
                                    on:click|preventDefault={() => confirmThis(handleUserRoleDelete, row.id)}
                                    class="btn p-2 -my-1 hover:variant-soft-error"
                                >
                                    <Icon
                                        icon="material-symbols:delete-outline-rounded"
                                        class="text-lg"
                                    />
                                </button>
                                <span slot="title"> Delete </span>
                                <span slot="description"> Are you sure you want to delete a user role? </span>
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
				<button class="confirm-card-delete-btn" onclick={() => handleUserRoleDelete(cardToDelete)}>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- <div class="w-full variant-soft-secondary rounded-lg p-2">
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
