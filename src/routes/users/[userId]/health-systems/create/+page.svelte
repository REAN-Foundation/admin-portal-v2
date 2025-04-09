<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';

	////////////////////////////////////////////////////////////////////

	// export let data;
	// export let form;
	let { data, form } = $props();
	data.title = 'Hospital Systems-Health Systems Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/health-systems/create`;
	const healthSystemsRoute = `/users/${userId}/health-systems`;
	let isSubmitting = $state(false);

	const breadCrumbs = [
		{ name: 'Health Systems', path: healthSystemsRoute },
		{ name: 'Create', path: createRoute }
	];

	function handleSubmit() {
		isSubmitting = true;
	}

	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form
				method="post"
				action="?/createHealthSystemAction"
				use:enhance
				onsubmit={handleSubmit}
			>
				<table class="health-system-table">
					<thead class="">
						<tr>
							<th>Create Health System</th>
							<th class="text-end">
								<a href={healthSystemsRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded"  />
								</a>
							</th>
						</tr>
					</thead>
					<tbody class="">
						<tr class="">
							<td>Name *</td>
							<td>
								<input
									type="text"
									class="health-system-input {form?.errors?.healthSystemName
										? 'border-error-300 text-error-500'
										: ''}"
									name="healthSystemName"
									placeholder="Enter name here..."
									required
								/>
								{#if form?.errors?.healthSystemName}
									<p class="text-error-500 text-xs">{form?.errors?.healthSystemName[0]}</p>
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
					<button
						type="submit"
						class="health-system-btn variant-soft-secondary"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
