<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { createOrUpdateSchema } from '$lib/validation/care.plan.schema.js';
	import type { CarePlanCreateModel } from '$lib/types/careplan.types.js';
	import InputChips from '$lib/components/input-chips.svelte';

	////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let errors: Record<string, string> = $state({});
	let name = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	let code = $state('');
	let categoryId = $state('');
	let description = $state('');
	let version = $state('');
	let promise = $state();
	let careplanCategories = $state(data.careplanCategories);

	const userId = page.params.userId;
	const tenantId = data.sessionUser.tenantId;
	const createRoute = `/users/${userId}/careplan/careplans/create`;
	const careplansRoute = `/users/${userId}/careplan/careplans`;

	data.title = 'Care Plans - Create';

	const breadCrumbs = [
		{
			name: 'Careplans',
			path: careplansRoute
		},
		{
			name: 'Create',
			path: createRoute
		}
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
            console.log('keywords', keywords);
			const payload: CarePlanCreateModel = {
				Name: name,
				Description: description,
				Code: code,
				CategoryId: categoryId,
				Tags: keywords,
				Version: version,
				OwnerUserId: userId,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(payload);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch('/api/server/careplan', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' }
			});
			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${careplansRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
				errors = response.Errors;
			} else {
				toastMessage(response);
			}
		} catch (err) {
			toastMessage();
		}
	};
    $effect(() => {
            keywordsStr = keywords?.join(', ');
        });
	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
    <div class="mx-auto">
        <div class="health-system-table-container">
            <form onsubmit={async (event) => (promise = handleSubmit(event))}>
                <table class="health-system-table">
                    <thead>
                        <tr>
                            <th>Create Careplan</th>
                            <th class="text-end">
                                <a href={careplansRoute} class="cancel-btn">
                                    <Icon icon="material-symbols:close-rounded" />
                                </a>  
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Name <span class="text-red-700">*</span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {errors?.name ? 'input-text-error' : ''}"
                                    name="name"
                                    placeholder="Enter name here..."
                                    bind:value={name}
                                    required
                                />
                                {#if errors?.Name}
                                    <p class="text-error">{errors?.Name}</p>
                                {/if}
                            </td>
                        </tr>
                        <tr>
                            <td>Code <span class="text-red-700">*</span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {errors?.code ? 'input-text-error' : ''}"
                                    name="healthSystemName"
                                    placeholder="Enter code here..."
                                    bind:value={code}
                                    required
                                />
                                {#if errors?.Code}
                                    <p class="text-error">{errors?.Code}</p>
                                {/if}
                            </td>
                        </tr>
                        <tr>
                            <td>Category <span class="text-red-700">*</span></td>
                            <td  class="relative flex">
                                 <div class="relative w-full">
                                <select
                                    name="categoryId"
                                    class="select select-primary w-full pr-10 {errors?.categoryId ? 'input-text-error' : ''}"
                                    bind:value={categoryId}
                                    required
                                >
                                    <option disabled selected>Select category of plan here...</option>
                                    {#each careplanCategories as category}
                                        <option value={category.id}>{category.Type}</option>
                                    {/each}
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
                                </div>
                            </div>
                                <!-- <select
                                    name="categoryId"
                                    class="select select-primary w-full {errors?.categoryId
                                        ? 'input-text-error'
                                        : ''}"
                                    bind:value={categoryId}
                                    required
                                >
                                    <option disabled selected>Select category of plan here...</option>
                                    {#each careplanCategories as category}
                                        <option value={category.id}>{category.Type}</option>
                                    {/each}
                                </select>
                                	<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                        <Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
                                    </div>
                                {#if errors?.CategoryId}
                                    <p class="text-error">{errors?.CategoryId}</p>
                                {/if} -->
                            </td>
                        </tr>
                        <tr>
                            <td>Description <span class="text-red-700"></span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {errors?.description ? 'input-text-error' : ''}"
                                    name="description"
                                    placeholder="Enter description here..."
                                    bind:value={description}
                                />
                                {#if errors?.Description}
                                    <p class="text-error">{errors?.Description}</p>
                                {/if}
                            </td>
                        </tr>
                        <tr class="">
                            <td class="!py-3 align-top">Tags</td>
                            <td>
                                <InputChips bind:keywords name="keywords" id="keywords" />
		                        <input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
                                <!-- <InputChips
                                    bind:keywords
                                    name="keywords"
                                    id="keywords"
                                    keywordsChanged={onUpdateKeywords}
                                />
                                <input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} /> -->
                            </td>
                        </tr>
                        <tr>
                            <td>Version <span class="text-red-700"></span></td>
                            <td>
                                <input   
                                    type="text"
                                    class="health-system-input {errors?.healthSystemName
                                        ? 'input-text-error'
                                        : ''}"
                                    name="version"
                                    placeholder="Enter version here..."
                                    bind:value={version}
                                />
                                {#if errors?.Version}
                                    <p class="text-error">{errors?.Version}</p>
                                {/if}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="button-container">
                    {#await promise}
                        <button type="submit" class="health-system-btn variant-soft-secondary" disabled>
                            Submiting
                        </button>
                    {:then data}
                        <button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
                    {/await}
                </div>
            </form>
        </div>
    </div>
</div>

