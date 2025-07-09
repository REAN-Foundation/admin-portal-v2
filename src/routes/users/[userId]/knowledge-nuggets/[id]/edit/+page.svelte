<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/knowledge.nuggets.schema';
	import type { KnowledgeNuggetsUpdateModel } from '$lib/types/knowledge.nuggets.types';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.KnowledgeNugget.id;
	let topicName = $state(data.KnowledgeNugget.TopicName);
	let briefInformation = $state(data.KnowledgeNugget.BriefInformation);
	let detailedInformation = $state(data.KnowledgeNugget.DetailedInformation);
	let additionalResources = $state([...data.KnowledgeNugget.AdditionalResources]);
	let newResource = $derived(additionalResources.join(', '));

	// let additionalResources = $state(additionalResources_.join(', '));

	let keywords: string[] = $state(data.KnowledgeNugget.Tags);
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	function handleReset() {
		topicName = data?.KnowledgeNugget?.TopicName;
		briefInformation = data?.KnowledgeNugget?.BriefInformation;
		detailedInformation = data?.KnowledgeNugget?.DetailedInformation;
		additionalResources = data?.KnowledgeNugget?.AdditionalResources;
		keywords = data?.KnowledgeNugget?.Tags;
		errors = {};
	}

	const userId = page.params.userId;
	var knowledgeNuggetId = page.params.id;

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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const knowledgeNuggetUpdateModel: KnowledgeNuggetsUpdateModel = {
				Name: topicName,
				BriefInformation: briefInformation,
				DetailedInformation: detailedInformation,
				AdditionalResources: additionalResources,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(knowledgeNuggetUpdateModel);
			console.log(validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/knowledge-nuggets/${knowledgeNuggetId}`, {
				method: 'PUT',
				body: JSON.stringify(knowledgeNuggetUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response ==>', response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${knowledgeNuggetsRoute}/${response?.Data?.KnowledgeNugget?.id}/view`);
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

	function addResource() {
		additionalResources = newResource
			.split(',')
			.map((r) => r.trim())
			.filter((r) => r.length > 0);
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Knowledge Nugget</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class="important-field">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="topicName"
							placeholder="Enter name here..."
							bind:value={topicName}
							class="input {form?.errors?.topicName ? 'input-text-error' : ''}"
							required
						/>
						{#if form?.errors?.topicName}
							<p class="error-text">{form?.errors?.topicName[0]}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Brief Information</td>
					<td class="table-data">
						<textarea
							name="briefInformation"
							class="input resize-none {form?.errors?.briefInformation ? 'input-text-error' : ''}"
							bind:value={briefInformation}
							placeholder="Enter brief information here..."
						></textarea>
						{#if form?.errors?.briefInformation}
							<p class="error-text">{form?.errors?.briefInformation[0]}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Detailed Information</td>
					<td class="table-data">
						<textarea
							name="detailedInformation"
							class="input resize-none {form?.errors?.detailedInformation
								? 'input-text-error'
								: ''}"
							bind:value={detailedInformation}
							placeholder="Enter detailed information here..."
						></textarea>
						{#if form?.errors?.detailedInformation}
							<p class="error-text">{form?.errors?.detailedInformation[0]}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Additional Resources</td>
					<td class="table-data">
						<input
							type="text"
							name="additionalResources"
							class="input {form?.errors?.additionalResources ? 'input-text-error' : ''}"
							placeholder="Enter additional resource here..."
							bind:value={newResource}
							onchange={addResource}
						/>
						{#if form?.errors?.additionalResources}
							<p class="error-text">{form?.errors?.additionalResources[0]}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
						{#if form?.errors?.tags}
							<p class="error-text">{form?.errors?.tags[0]}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
