<script lang="ts">
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
    import { enhance } from '$app/forms';

	////////////////////////////////////////////////////////////////////

	export let data;
	export let form;
	data.title = 'Hospital Systems-Health Systems Create'
	const userId = $page.params.userId;
	const createRoute = `/users/${userId}/health-systems/create`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;

	const breadCrumbs = [
		{ name: 'Health Systems', path: healthSystemsRoute },
		{ name: 'Create', path: createRoute }
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
	action="?/createHealthSystemAction"
	class="table-container my-2 border border-secondary-100 dark:!border-surface-700"
	use:enhance
	on:submit|preventDefault={handleSubmit}
>
	<table class="table">
		<thead class="!variant-soft-secondary">
			<tr>
				<th>Create Health System</th>
				<th class="text-end">
					<a href={healthSystemsRoute} class="btn p-2 -my-2 variant-soft-secondary">
						<Icon icon="material-symbols:close-rounded" class="text-lg" />
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
					<InputChip chips="variant-filled-error rounded-2xl" name="tags" />
				</td>
			</tr>
		</tbody>
	</table>
	<div class="flex gap-2 p-2 justify-end">
		<button type="submit" class="btn variant-filled-secondary" disabled={isSubmitting}>
			{isSubmitting ? 'Submitting...' : 'Submit'}
		</button>
	</div>
</form>
