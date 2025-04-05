<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    // import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
    // import Confirm from '$lib/components/modal/confirmModal.svelte';
    import { Helper } from '$lib/utils/helper';
    import Icon from '@iconify/svelte';
    import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
    import date from 'date-and-time';
    import type { PageServerData } from './$types';
    import { invalidate } from '$app/navigation';
	import Confirm from '$lib/components/modal/confirm.modal.svelte';

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    export let data: PageServerData;
    $: isLoading = false;
    $: healthSystems = data.healthSystems.Items;
    let retrivedHealthSystems;
    const userId = $page.params.userId;
    const healthSystemRoute = `/users/${userId}/health-systems`;
    const editRoute = (id) => `/users/${userId}/health-systems/${id}/edit`;
    const viewRoute = (id) => `/users/${userId}/health-systems/${id}/view`;
    const createRoute = `/users/${userId}/health-systems/create`;

    const breadCrumbs = [{ name: 'Health Systems', path: healthSystemRoute }];

    let healthSystemName = undefined;
    let sortBy = 'Name';
    let sortOrder = 'ascending';
    let itemsPerPage = 10;
    let offset = 0;
    $: totalHealthSystemsCount = data.healthSystems.TotalCount;
    let isSortingName = false;
    let items = 10;

    let paginationSettings = {
        page: 0,
        limit: 10,
        size: totalHealthSystemsCount,
        amounts: [10, 20, 30, 50]
    } satisfies PaginationSettings;

    $: {
        if (healthSystemName) {
            paginationSettings.page = 0;
        }
    }

    async function searchHealthSystem(model) {
        let url = `/api/server/health-systems/search?`;
        if (sortOrder) url += `sortOrder=${sortOrder}`;
        else url += `sortOrder=ascending`;

        if (sortBy) url += `&sortBy=${sortBy}`;
        if (itemsPerPage) url += `&itemsPerPage=${model.itemsPerPage}`;
        if (offset) url += `&pageIndex=${model.pageIndex}`;
        if (healthSystemName) url += `&name=${model.healthSystemName}`;

        console.log('url', url);

        const res = await fetch(url, {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        });

        const searchResult = await res.json();
        totalHealthSystemsCount = searchResult.TotalCount;
        healthSystems = searchResult.Items.map((item, index) => ({ ...item, index: index + 1 }));
        if (totalHealthSystemsCount > 0) {
            isLoading = false;
        }
    }

    $: {
        healthSystems = healthSystems.map((item, index) => ({ ...item, index: index + 1 }));
        paginationSettings.size = totalHealthSystemsCount;
        retrivedHealthSystems = healthSystems.slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit + paginationSettings.limit
        );
        if (retrivedHealthSystems.length > 0) {
            isLoading = false;
        }
    }

    // $: console.log('retrivedHealthSystems', retrivedHealthSystems);

    $: if (browser)
        searchHealthSystem({
            healthSystemName: healthSystemName,
            itemsPerPage: itemsPerPage,
            pageIndex: offset,
            sortOrder: sortOrder,
            sortBy: sortBy
        });


    function onPageChange(e: CustomEvent): void {
        isLoading = true;
        let pageIndex = e.detail;
        itemsPerPage = items * (pageIndex + 1);
    }

    function onAmountChange(e: CustomEvent): void {
        if (healthSystemName) {
            isLoading = true;
            healthSystems = [];
        }
        itemsPerPage = e.detail * (paginationSettings.page + 1);
        items = itemsPerPage;
    }

    function sortTable(columnName) {
        isSortingName = false;
        sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
        if (columnName === 'Name') {
            isSortingName = true;
        }
        sortBy = columnName;
    }

    const handleHealthSystemDelete = async (id) => {
        const healthSystemId = id;
        await Delete({
            sessionId: data.sessionId,
            healthSystemId
        });
       invalidate('app:healthSystem');
    };

    async function Delete(model) {
        await fetch(`/api/server/health-systems`, {
            method: 'DELETE',
            body: JSON.stringify(model),
            headers: { 'content-type': 'application/json' }
        });
    }

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="flex flex-wrap gap-2 mt-1">
    <div class="relative w-auto grow">
        <input
        type="text"
        name="healthSystemName"
        placeholder="Search by name"
        bind:value={healthSystemName}
        class="input w-full"
    />
        {#if healthSystemName}
            <button
                type="button"
                on:click={() => { healthSystemName = '';}}
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-0 cursor-pointer"
            >
                <Icon icon="material-symbols:close" class="text-lg" />
            </button>
        {/if}
    </div>
    <a
        href={createRoute}
        class="btn variant-filled-secondary">Add New</a
    >
</div>

<div class="table-container my-2 !border !border-secondary-100 dark:!border-surface-700">
    <table
        class="table"
        role="grid"
    >
        <thead class="!variant-soft-secondary">
            <tr>
                <th data-sort="index">Id</th>
                <th>
                    <button on:click={() => sortTable('Name')}>
                        Name {isSortingName ? (sortOrder === 'ascending' ? '▲' : '▼') : ''}
                    </button>
                </th>
                <th>Created Date</th>
                <th />
                <th />
            </tr>
        </thead>
        <tbody class="!bg-white dark:!bg-inherit">
            {#if retrivedHealthSystems.length <= 0}
                <tr>
                    <td colspan="6">{isLoading ? 'Loading...' : 'No records found'}</td>
                </tr>
            {:else}
                {#each retrivedHealthSystems as row}
                    <tr class="!border-b !border-b-secondary-100 dark:!border-b-surface-700">
                        <td
                            role="gridcell"
                            aria-colindex={1}
                            tabindex="0">{row.index}</td
                        >
                        <td
                            role="gridcell"
                            aria-colindex={2}
                            tabindex="0"
                        >
                            <a href={viewRoute(row.id)}>
                                {row.Name !== null && row.Name !== ''
                                    ? Helper.truncateText(row.Name, 50)
                                    : 'Not specified'}
                            </a>
                        </td>
                        <td
                            role="gridcell"
                            aria-colindex={5}
                            tabindex="0"
                        >
                            {date.format(new Date(row.CreatedAt), 'DD-MMM-YYYY')}</td
                        >
                        <td>
                            <a
                                href={editRoute(row.id)}
                                class="btn p-2 -my-1 hover:variant-soft-primary"
                            >
                                <Icon
                                    icon="material-symbols:edit-outline"
                                    class="text-lg"
                                />
                            </a>
                        </td>
                        <td>
                            <Confirm
                                confirmTitle="Delete"
                                cancelTitle="Cancel"
                                let:confirm={confirmThis}
                            >
                                <button
                                    on:click|preventDefault={() => confirmThis(handleHealthSystemDelete, row.id)}
                                    class="btn p-2 -my-1 hover:variant-soft-error"
                                >
                                    <Icon
                                        icon="material-symbols:delete-outline-rounded"
                                        class="text-lg"
                                    />
                                </button>
                                <span slot="title"> Delete </span>
                                <span slot="description"> Are you sure you want to delete a health system? Hospitals associated with it will also get deleted. </span>
                            </Confirm>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<div class="w-full variant-soft-secondary rounded-lg p-2">
    <Paginator
        bind:settings={paginationSettings}
        on:page={onPageChange}
        on:amount={onAmountChange}
        buttonClasses=" text-primary-500"
        regionControl="bg-surface-100 rounded-lg btn-group text-primary-500 border border-primary-200"
        controlVariant="rounded-full text-primary-500 "
        controlSeparator="fill-primary-400"
    />
</div>
