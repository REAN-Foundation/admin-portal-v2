<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';

	/////////////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data;

	let { data, form } = $props();

	let isSubmitting = $state(false);

	data.title = 'Educational-Knowledge Nuggets Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/knowledge-nuggets/create`;
	const knowledgeNuggetsRoute = `/users/${userId}/knowledge-nuggets`;

	const breadCrumbs = [
		{
			name: 'Knowledge Nuggets',
			path: knowledgeNuggetsRoute,
			home: true
		},
		{
			name: 'Create',
			path: createRoute
		}
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
				action="?/createKnowledgeNuggetAction"
				use:enhance
				onsubmit={handleSubmit}
			>
			<table class="health-system-table">
				<thead>
						<tr>
							<th>Create Knowledge Nugget</th>
							<th class="text-end">
								<a href={knowledgeNuggetsRoute} class="health-system-btn variant-soft-secondary">
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
									name="topicName"
									required
									placeholder="Enter name here..."
									class="health-system-input {form?.errors?.topicName ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.topicName}
									<p class="text-error">{form?.errors?.topicName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td >Brief Information</td>
							<td>
								<textarea
									name="briefInformation"
									placeholder="Enter  brief information here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Detailed Information</td>
							<td>
								<textarea
									name="detailedInformation"
									placeholder="Enter detailed information here..."
									class="health-system-input"
								/>
							</td>
						</tr>
						<tr>
							<td>Additional Resources</td>
							<td>
								<input
									type="text"
									name="additionalResources"
									class="health-system-input"
									placeholder="Enter additional resource here..."
								/>
							</td>
						</tr>
						<tr>
							<td class="align-top">Tags</td>
							<td>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" /> -->
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
