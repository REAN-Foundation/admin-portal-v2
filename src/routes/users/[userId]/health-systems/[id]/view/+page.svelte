<script lang="ts">
    import { page } from '$app/stores';
    import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
    import Icon from '@iconify/svelte';
    import type { PageServerData } from './$types';

    ////////////////////////////////////////////////////////

    const userId = $page.params.userId;
    var healthSystemId = $page.params.id;
    const editRoute = `/users/${userId}/health-systems/${healthSystemId}/edit`;
    const viewRoute = `/users/${userId}/health-systems/${healthSystemId}/view`;
    const healthSystemRoute = `/users/${userId}/health-systems`;

    export let data: PageServerData;
    let healthSystem = data.healthSystem;
    let healthSystemName = healthSystem.Name;
    let tags_ = data.healthSystem.Tags;
    let tags = tags_.join(', ');

    const breadCrumbs = [
        {
            name: 'Health Systems',
            path: healthSystemRoute
        },
        {
            name: 'View',
            path: viewRoute
        }
    ];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="flex flex-wrap gap-2">
    <a
        href={editRoute}
        class="btn variant-filled-secondary ml-auto"
    >
        <Icon icon="material-symbols:edit-outline" />
        <span>Edit</span>
    </a>
</div>

<div class="table-container my-2 border border-secondary-100 dark:border-surface-700">
    <table class="table">
        <thead class="!variant-soft-secondary">
            <tr>
                <th>View Health System</th>
                <th class="text-end">
                    <a
                        href={healthSystemRoute}
                        class="btn p-2 -my-2 variant-soft-secondary"
                    >
                        <Icon
                            icon="material-symbols:close-rounded"
                            class="text-lg"
                        />
                    </a>
                </th>
            </tr>
        </thead>
        <tbody class="!bg-white dark:!bg-inherit">
            <tr class="!border-b !border-b-secondary-100 dark:!border-b-surface-700">
                <td>Name</td>
                <td>{healthSystemName}</td>
            </tr>
            <tr class="!border-b !border-b-secondary-100 dark:!border-b-surface-700">
                <td>Tags</td>
                <td>
                    {#if tags.length <= 0}
                        <span class="span">Tags not specified</span>
                    {:else}
                        <span class="span">{tags}</span>
                    {/if}
                </td>
            </tr>
        </tbody>
    </table>
</div>
