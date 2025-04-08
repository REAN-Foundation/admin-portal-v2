<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import InputChip from '$lib/components/input-chips.svelte';

	//////////////////////////////////////////////////////////////////////

	const userId = $page.params.userId;
	var healthSystemId = $page.params.id;
	const editRoute = `/users/${userId}/health-systems/${healthSystemId}/edit`;
	const viewRoute = `/users/${userId}/health-systems/${healthSystemId}/view`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;

	// export let form;
	// export let data: PageServerData;
	let { form, data } = $props();
	let healthSystemName = $state(data.healthSystem.Name);
	let tags = $state(data.healthSystem.Tags);
	//Original data
	let _healthSystemName = $derived(healthSystemName);
	let _healthSystemId = healthSystemId;
	let _tags = $derived(JSON.stringify(tags));
	let isSubmitting = $state(false);

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

	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<div class="mx-auto">
		<div class="mb-6 rounded-lg bg-white shadow dark:bg-neutral-800">

<form
	method="post"
	action="?/updateHealthSystemAction"
	use:enhance
	onsubmit={handleSubmit}
>
	<table class="health-system-table">
		<thead >
			<tr>
				<th>Edit Health System</th>
				<th class="text-end">
					<a href={viewRoute} class="health-system-btn variant-soft-secondary">
						<Icon icon="material-symbols:close-rounded" />
					</a>
				</th>
			</tr>
		</thead>
		<tbody class="!bg-white dark:!bg-inherit">
			<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
				<td>Name <span class=" text-red-600">*</span></td>
				<td>
					<input
						type="text"
						class="health-system-input {form?.errors?.healthSystemName ? 'border-error-300 text-error-500' : ''}"
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
			<tr class="!border-b-secondary-100 dark:!border-b-surface-700 !border-b">
				<td class="align-top !py-3">Tags</td>
				<td>
					<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
				</td>
			</tr>
		</tbody>
	</table>
	<div class="flex justify-end gap-2 px-4 py-2">
		<button type="button" onclick={handleReset} class="health-system-btn variant-soft-secondary">Reset</button>
		<button type="submit" class="health-system-btn variant-soft-secondary" disabled={isSubmitting}>
			{isSubmitting ? 'Submitting...' : 'Submit'}
		</button>
	</div>
</form>

</div>
</div>
</div>