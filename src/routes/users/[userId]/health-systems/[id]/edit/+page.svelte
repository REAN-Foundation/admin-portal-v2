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
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let healthSystemName = $state(data.healthSystem.Name);
	let keywords: string[] = $state(data.healthSystem.Tags);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	// let keywords: string[] = $state([]);
	let keywordsStr: string = $state('');

	const userId = page.params.userId;
	var healthSystemId = page.params.id;

	const editRoute = `/users/${userId}/health-systems/${healthSystemId}/edit`;
	const viewRoute = `/users/${userId}/health-systems/${healthSystemId}/view`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;

	const breadCrumbs = [
		{ name: 'Health Systems', path: healthSystemsRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		healthSystemName = data?.healthSystem?.Name;
		healthSystemId = page.params.id;
		keywords = data?.healthSystem?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const healthSystemUpdateModel: HealthSystemUpdateModel = {
				Name: healthSystemName,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(healthSystemUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/health-systems/${healthSystemId}`, {
				method: 'PUT',
				body: JSON.stringify(healthSystemUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

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
							<th>Edit Health System</th>
							<th class="text-end">
								<a href={viewRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Name <span class=" text-red-700">*</span></td>
							<td>
								<input
									type="text"
									class="health-system-input {errors?.healthSystemName
										? 'input-text-error'
										: ''}"
									name="healthSystemName"
									placeholder="Enter name here..."
									bind:value={healthSystemName}
								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
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
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
					{#await promise}
						<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
					{:then data}
						<Button size="md" type="submit" text="Submit" variant="primary" />
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
