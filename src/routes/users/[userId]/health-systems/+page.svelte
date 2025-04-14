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
	import { toastMessage } from '$lib/components/toast/toast.store';
    import Pagination from '$lib/components/pagination/pagination.svelte';

    ///////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

	let isLoading = $state(false);
	let healthSystems = $state(data.healthSystems.Items);
	let retrivedHealthSystems = $derived(healthSystems);
    let openDeleteModal = $state(false);
    let idToBeDeleted = $state(null);
    let isDeleting = $state(false);
    let searchKeyword = $state(undefined);

    const userId = page.params.userId;
	const healthSystemRoute = `/users/${userId}/health-systems`;
	const editRoute = (id) => `/users/${userId}/health-systems/${id}/edit`;
	const viewRoute = (id) => `/users/${userId}/health-systems/${id}/view`;
	const createRoute = `/users/${userId}/health-systems/create`;

	const breadCrumbs = [{ name: 'Health Systems', path: healthSystemRoute }];

	let healthSystemName = $state(undefined);

	let totalHealthSystemsCount = $state(data.healthSystems.TotalCount);
    $inspect('totalHealthSystemsCount', totalHealthSystemsCount);
	let isSortingName = $state(false);
	let sortBy = $state('Name');
	let sortOrder = $state('ascending');
	let itemsPerPage = $state(10);
	let currentPage = $state(0);

	let paginationSettings: PaginationSettings = $state({
		page: 0,
		limit: 10,
		size: totalHealthSystemsCount,
		amounts: [10, 20, 30, 50]
	});

	$inspect('retrivedHealth', healthSystems);

	async function searchHealthSystem(model) {
        if (searchKeyword !== model.healthSystemName) {
            paginationSettings.page = 0
        }
		let url = `/api/server/health-systems/search?`;
		url += `sortOrder=${model.sortOrder ?? sortOrder}`;
		url += `&sortBy=${model.sortBy ?? sortBy}`;
		url += `&itemsPerPage=${model.itemsPerPage ?? itemsPerPage}`;
		url += `&pageIndex=${model.pageIndex ?? currentPage}`;
		if (healthSystemName) url += `&name=${model.healthSystemName}`;

		try {
			const res  = await fetch(url, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const searchResult = await res.json();
            console.log("searchResult", searchResult);
			totalHealthSystemsCount = searchResult.Data.HealthSystems.TotalCount;
            paginationSettings.size = totalHealthSystemsCount;

            healthSystems = searchResult.Data.HealthSystems.Items.map((item, index) => ({
				...item,
				index: index + 1
			}));
            searchKeyword = model.healthSystemName;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

    $effect(() => {
            searchHealthSystem({
			healthSystemName,
			itemsPerPage: paginationSettings.limit,
			pageIndex: paginationSettings.page,
			sortBy,
			sortOrder
        });

       if (isDeleting) {
            retrivedHealthSystems
            isDeleting = false
        }
    });

	function sortTable(columnName) {
		isSortingName = false;
		sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
		if (columnName === 'Name') {
			isSortingName = true;
		}
		sortBy = columnName;
	}

    const handleDeleteClick = (id: string) => {
        openDeleteModal = true;
        idToBeDeleted = id;
        
    }

    const  handleHealthSystemDelete = async (id) => {
        console.log('Inside handleHealthSystemDelete', id);
		const response = await fetch(`/api/server/health-systems/${id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});

        const res = await response.json();
        console.log('deleted Response',res);
        if (res.HttpCode === 200) {
            isDeleting = true;
            toastMessage(res);
        }
        invalidate('app:healthSystem');
	}

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container mb-6 shadow">
			<div class="health-system-search-border p-4">
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<div class="relative px-1.5">
							<Icon
								icon="heroicons:magnifying-glass"
								class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
							/>
							<input
								name="healthSystemName"
								type="text"
								bind:value={healthSystemName}
								placeholder="Search by name"
								class="health-system-input !pr-4 !pl-10"
							/>
							{#if healthSystemName}
								<button
									type="button"
									onclick={() => {
										healthSystemName = '';
									}}
									class="close-btn"
								>
									<Icon icon="material-symbols:close" />
								</button>
							{/if}
						</div>
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
							<th class="w-12"></th>
							<th class=" text-start">
								<button onclick={() => sortTable('Name')}>
									Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
								</button>
							</th>
							<th class=" w-40">Created </th>
							<th class="w-20 text-center"></th>
						</tr>
					</thead>
					<tbody class="">
                            {#if retrivedHealthSystems.length <= 0}
                                <tr>
                                    <td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
                                </tr>
                            {:else}
							    {#each retrivedHealthSystems as row, index}
								<tr>
									<td>
										{paginationSettings.page * paginationSettings.limit + index + 1}
									</td>

									<td>
										<Tooltip text={row.Name || 'Not specified'}>
											<a href={viewRoute(row.id)}>
												{row.Name !== null && row.Name !== ''
													? Helper.truncateText(row.Name, 50)
													: 'Not specified'}
											</a>
										</Tooltip>
									</td>
									<td role="gridcell" aria-colindex={5} tabindex="0">
										<!-- {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')} -->
										{Helper.formatDate(row.CreatedAt)}
									</td>

									<td>
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

<Confirmation bind:isOpen={openDeleteModal} title="Delete Health System@@@" onConfirm={handleHealthSystemDelete} id={idToBeDeleted} />

<Pagination
    bind:paginationSettings
/>      
