<script lang="ts">
    import { page } from '$app/stores';
    import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
    import Icon from '@iconify/svelte';
    import type { PageServerData } from './$types';
    import InputChip from '$lib/components/input-chips.svelte';
    import { enhance } from '$app/forms';

    //////////////////////////////////////////////////////////////////////

    const userId = $page.params.userId;
    var healthSystemId = $page.params.id;
    const editRoute = `/users/${userId}/health-systems/${healthSystemId}/edit`;
    const viewRoute = `/users/${userId}/health-systems/${healthSystemId}/view`;
    const healthSystemsRoute = `/users/${userId}/health-systems`;

    export let form;
    export let data: PageServerData;
    let healthSystemName = data.healthSystem.Name;
    let tags = data.healthSystem.Tags;
    //Original data
    let _healthSystemName = healthSystemName;
    let _healthSystemId = healthSystemId;
    let _tags = JSON.stringify(tags);

    function handleReset() {
        healthSystemName = _healthSystemName;
        healthSystemId = _healthSystemId;
        tags = JSON.parse(_tags);
    }

    const breadCrumbs = [
        { name: 'Health Systems', path: healthSystemsRoute },
        { name: 'Edit', path: editRoute }
    ];

    function handleSubmit() {
	  isSubmitting = true;
    } 
	$:isSubmitting = false ;

	$:if(form){
		isSubmitting = false;	
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<form
    method="post"
    action="?/updateHealthSystemAction"
    class="table-container my-2 border border-secondary-100 dark:!border-surface-700"
    use:enhance
    on:submit|preventDefault={handleSubmit}
>
    <table class="table">
        <thead class="!variant-soft-secondary">
            <tr>
                <th>Edit Health System</th>
                <th class="text-end">
                    <a
                        href={viewRoute}
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
                <td>Name *</td>
                <td>
                    <input
                        type="text"
                        class="input {form?.errors?.healthSystemName ? 'border-error-300 text-error-500' : ''}"
                        name="healthSystemName"
                        placeholder="Enter name here..."
                        bind:value={healthSystemName}
                        required
                    />
                    {#if form?.errors?.healthSystemName}
                        <p class="text-error-500 text-xs">{form?.errors?.healthSystemName[0]}</p>
                    {/if}
                </td>
            </tr>
            <tr class="!border-b !border-b-secondary-100 dark:!border-b-surface-700">
                <td class="align-top">Tags</td>
                <td>
                    <InputChip
                        chips="variant-filled-error rounded-2xl"
                        name="tags"
                        bind:value={tags}
                    />
                </td>
            </tr>
        </tbody>
    </table>
    <div class="flex gap-2 p-2 justify-end">
        <button
            type="button"
            on:click={handleReset}
            class="btn variant-soft-secondary">Reset</button
        >
        <button type="submit" class="btn variant-filled-secondary" disabled={isSubmitting}>
			{isSubmitting ? 'Submitting...' : 'Submit'}
		</button>
    </div>
</form>
