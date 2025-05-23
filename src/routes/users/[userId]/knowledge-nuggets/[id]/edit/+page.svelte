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

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};

	function addResource() {
		additionalResources = newResource
			.split(',')
			.map((r) => r.trim())
			.filter((r) => r.length > 0);
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit Knowledge Nugget</th>
							<th class="text-end">
								<a href={viewRoute} class="cancel-btn">
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
									class="input {form?.errors?.topicName ? 'input-text-error' : ''}"
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
									class="input {form?.errors?.briefInformation
										? 'input-text-error'
										: ''}"
								></textarea>
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
									class="input {form?.errors?.detailedInformation
										? 'input-text-error'
										: ''}"
								></textarea>
								{#if form?.errors?.detailedInformation}
									<p class="text-error">{form?.errors?.detailedInformation[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Additional Resources</td>
							<td>
								<input
									onchange={addResource}
									type="text"
									name="additionalResources"
									bind:value={newResource}
									class="input"
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
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								{#if form?.errors?.tags}
									<p class="text-error">{form?.errors?.tags[0]}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="table-btn variant-soft-secondary">Reset</button
					>
					{#await promise}
						<button type="submit" class="table-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="table-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
