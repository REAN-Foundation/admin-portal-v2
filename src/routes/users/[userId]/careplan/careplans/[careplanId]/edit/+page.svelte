<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { HealthSystemUpdateModel } from '$lib/types/health.system.types';
	import { createOrUpdateSchema } from '$lib/validation/health.system.schema';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { CarePlanUpdateModel } from '$lib/types/careplan.types';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();


	let carePlanName = $state(data.carePlan.Name);
	let code = $state(data.carePlan.Code);
	let description = $state(data.carePlan.Description);
	let version = $state(data.carePlan.Version);
	let keywords: string[] = $state(data.carePlan.Tags);
	let errors: Record<string, string> = $state({});
	let promise = $state();
    let careplanCategory = $state(data.carePlan.Category.Type);
    let categoryId = $state(data.carePlan.CategoryId);
    let careplanCategories = $state(data.careplanCategories);

	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	let carePlanId = page.params.careplanId;
	const tenantId = data.tenantId;

	const editRoute = `/users/${userId}/careplan/careplans/${carePlanId}/edit`;
	const viewRoute = `/users/${userId}/careplan/careplans/${carePlanId}/view`;
	const careplanRoute = `/users/${userId}/careplan/careplans`;

	const breadCrumbs = [
		{ name: 'Careplans', path: careplanRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		carePlanName = data?.carePlan?.Name;
		code = data?.carePlan?.Code;
		description = data?.carePlan?.Description;
		carePlanId = page.params.id;
		keywords = data?.carePlan?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const careplanUpdateModel: CarePlanUpdateModel = {
				Name: carePlanName,
				Code: code,
                CategoryId: categoryId,
				Description: description,
				Version: version,
				Tags: keywords,
				OwnerUserId: userId,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(careplanUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/${carePlanId}`, {
				method: 'PUT',
				body: JSON.stringify(careplanUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response response', response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${careplanRoute}/${response?.Data?.id}/view`);
				return;
			}
			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};
	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
       $effect(() => {
            keywordsStr = keywords?.join(', ');
        });
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
    <div class="mx-auto">
        <div class="health-system-table-container">
            <form onsubmit={(event) => (promise = handleSubmit(event))}>
                <table class="health-system-table">
                    <thead>
                        <tr>
                            <th>Edit Careplan</th>
                            <th class="text-end">
                                <a href={viewRoute} class=" cancel-btn">
                                    <Icon icon="material-symbols:close-rounded" />
                                </a>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Name <span class=" text-red-600">*</span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {form?.errors?.carePlanName ? 'input-text-error' : ''}"
                                    name="name"
                                    placeholder="Enter name here..."
                                    bind:value={carePlanName}
                                />
                                {#if errors?.Name}
                                    <p class="text-error-500 text-xs">{errors?.Name}</p>
                                {/if}
                            </td>
                        </tr>
                        <tr>
                            <td>Code <span class=" text-red-600">*</span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {form?.errors?.code ? 'input-text-error' : ''}"
                                    name="code"
                                    placeholder="Enter name here..."
                                    bind:value={code}
                                />
                                {#if errors?.Code}
                                    <p class="text-error-500 text-xs">{errors?.Code}</p>
                                {/if}
                            </td>
                        </tr>
                         <tr>
                            <td>Category <span class="text-red-700">*</span></td>
                            <td>
                                <select
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
                                
                                {#if errors?.CategoryId}
                                    <p class="text-error">{errors?.CategoryId}</p>
                                {/if}
                            </td>
                        <tr>
                            <td>Description <span class=" text-red-600"></span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {form?.errors?.description ? 'input-text-error' : ''}"
                                    name="description"
                                    placeholder="Enter description here..."
                                    bind:value={description}
                                />
                                {#if errors?.Description}
                                    <p class="text-error-500 text-xs">{errors?.Description}</p>
                                {/if}
                            </td>
                        </tr>
                        <tr>
                            <td class="!py-3">Tags</td>
                            <td>
                                <InputChips
                                    bind:keywords
                                    name="keywords"
                                    id="keywords"
                                />
                                <input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
                            </td>
                        </tr>
                        <tr>
                            <td>Version <span class=" text-red-600"></span></td>
                            <td>
                                <input
                                    type="text"
                                    class="health-system-input {form?.errors?.version ? 'input-text-error' : ''}"
                                    name="version"
                                    placeholder="Enter version here..."
                                    bind:value={version}
                                />
                                {#if errors?.Version}
                                    <p class="text-error-500 text-xs">{errors?.Version}</p>
                                {/if}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="button-container">
                    <button
                        type="button"
                        onclick={handleReset}
                        class="health-system-btn variant-soft-secondary">Reset</button
                    >
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