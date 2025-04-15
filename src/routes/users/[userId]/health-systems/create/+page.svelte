<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { createOrUpdateSchema } from '$lib/validation/health.system.schema.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { HealthSystemCreateModel } from '$lib/types/health.system.types.js';
	import { goto } from '$app/navigation';

	///////////////////////////////////////////////////////////////////////////

    let { data, form } = $props();

    let errors: Record<string, string> = $state({});
    let healthSystemName = $state(undefined);
    let tags = $state(undefined);
    let promise = $state();

	data.title = 'Hospital Systems-Health Systems Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/health-systems/create`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;

	const breadCrumbs = [
		{ name: 'Health Systems', path: healthSystemsRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
        try {
            event.preventDefault();
            errors = {}

            const healthSystemCreateModel: HealthSystemCreateModel  = {
                Name: healthSystemName,
                Tags: tags
            }

            const validationResult = createOrUpdateSchema.safeParse(healthSystemCreateModel);

            if (!validationResult.success) {
                errors = Object.fromEntries(
                    Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
                        key,
                        val?.[0] || 'This field is required'
                    ])
                );
                return;
            }

            const res = await fetch(`/api/server/health-systems`, {
                method: 'POST',
                body: JSON.stringify(healthSystemCreateModel),
                headers: { 'content-type': 'application/json' } 
            })

            const response = await res.json();

            if (response.HttpCode === 201 || response.HttpCode === 200) {
                toastMessage(response);
                goto(`${healthSystemsRoute}/${response?.Data?.HealthSystem?.id}/view`);
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
        
	}

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form
				onsubmit={async (event) => promise = handleSubmit(event)}
			>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Health System</th>
							<th class="text-end">
								<a href={healthSystemsRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded"  />
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
									class="health-system-input {form?.errors?.healthSystemName
										? 'input-text-error'
										: ''}"
									name="healthSystemName"
									placeholder="Enter name here..."
                                    bind:value={healthSystemName}
								/>
								{#if errors?.Name}
									<p class="text-error-500 text-xs">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr class="">
							<td class="align-top !py-3 ">Tags</td>
							<td>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
                    {#await promise }
                        <button
                            type="submit"
                            class="health-system-btn variant-soft-secondary"
                            disabled
                            >
                            Submiting
                        </button>
                    {:then data} 
                        <button
                        type="submit"
                        class="health-system-btn variant-soft-secondary"
                        >
                        Submit
                        </button>
                    {/await}
					
				</div>
			</form>
		</div>
	</div>
</div>
