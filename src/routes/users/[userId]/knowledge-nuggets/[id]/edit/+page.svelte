<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';

	///////////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.KnowledgeNugget.id;
	let topicName = data.KnowledgeNugget.TopicName;
	let briefInformation = data.KnowledgeNugget.BriefInformation;
	let detailedInformation = data.KnowledgeNugget.DetailedInformation;
	let additionalResources_ = data.KnowledgeNugget.AdditionalResources;
	let additionalResources = additionalResources_.join(', ');
	let tags = data.KnowledgeNugget.Tags;
	let isSubmitting = $state(false);

	//Original data
	let _topicName = topicName;
	let _briefInformation = briefInformation;
	let _detailedInformation = detailedInformation;
	let _additionalResources = additionalResources;
	let _tags = tags;

	function handleReset() {
		topicName = _topicName;
		briefInformation = _briefInformation;
		detailedInformation = _detailedInformation;
		additionalResources = _additionalResources;
		tags = _tags;
	}

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/knowledge-nuggets/${id}/edit`;
	const viewRoute = `/users/${userId}/knowledge-nuggets/${id}/view`;
	const knowledgeNuggetsRoute = `/users/${userId}/knowledge-nuggets`;

	const breadCrumbs = [
		{
			name: 'Knowledge Nuggets',
			path: knowledgeNuggetsRoute
		},
		{
			name: 'Edit',
			path: editRoute
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
				action="?/updateKnowledgeNuggetAction"
				use:enhance
				onsubmit={handleSubmit}
			>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Knowledge Nugget</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
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
									name="topicName"
									required
									bind:value={topicName}
									placeholder="Enter name here..."
									class="health-system-input {form?.errors?.topicName ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.topicName}
									<p class="text-error">{form?.errors?.topicName[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Brief Information</td>
							<td>
								<textarea
									name="briefInformation"
									bind:value={briefInformation}
									placeholder="Enter  brief information here..."
									class="health-system-input {form?.errors?.briefInformation
										? 'input-text-error'
										: ''}"
								/>
								{#if form?.errors?.briefInformation}
									<p class="text-error">{form?.errors?.briefInformation[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Detailed Information</td>
							<td>
								<textarea
									name="detailedInformation"
									bind:value={detailedInformation}
									placeholder="Enter detailed information here..."
									class="health-system-input {form?.errors?.detailedInformation
										? 'input-text-error'
										: ''}"
								/>
								{#if form?.errors?.detailedInformation}
									<p class="text-error">{form?.errors?.detailedInformation[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Additional Resources</td>
							<td>
								<input
									type="text"
									name="additionalResources"
									bind:value={additionalResources}
									class="health-system-input"
									placeholder="Enter additional resource here..."
								/>
								{#if form?.errors?.additionalResources}
									<p class="text-error">{form?.errors?.additionalResources[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Tags</td>
							<td>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
								{#if form?.errors?.tags}
									<p class="text-error">{form?.errors?.tags[0]}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="flex justify-end gap-2 p-2">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
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
