<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import { enhance } from '$app/forms';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { KnowledgeNuggetsCreateModel } from '$lib/types/knowledge.nuggets.types.js';
	import { createOrUpdateSchema } from '$lib/validation/knowledge.nuggets.schema.js';

	/////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let topicName = $state(undefined);
	let additionalResources: string[]  =  $state([]);
	let newResource = $derived(additionalResources.join(', '));

	let briefInformation =  $state(undefined);
	let detailedInformation =  $state(undefined);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');


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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const knowledgeNuggetsCreateModel: KnowledgeNuggetsCreateModel = {
				Name: topicName,
				BriefInformation: briefInformation,
				DetailedInformation:detailedInformation,
				AdditionalResources: additionalResources,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(knowledgeNuggetsCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/knowledge-nuggets`, {
				method: 'POST',
				body: JSON.stringify(knowledgeNuggetsCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log(response);
			

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
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Create Knowledge Nugget</th>
							<th class="text-end">
								<a href={knowledgeNuggetsRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
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
									placeholder="Enter name here..."
									class="input"
									bind:value={topicName}

								/>
								{#if errors?.Name}
									<p class="text-error">{errors?.Name}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Brief Information</td>
							<td>
								<textarea
									name="briefInformation"
									placeholder="Enter  brief information here..."
									class="input"
									bind:value={briefInformation}
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Detailed Information</td>
							<td>
								<textarea
									name="detailedInformation"
									placeholder="Enter detailed information here..."
									class="input"
									bind:value={detailedInformation}
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Additional Resources</td>
							<td>
								<input
									type="text"
									name="additionalResources"
									class="input"
									placeholder="Enter additional resource here..."
									bind:value={newResource}
									onchange={addResource}
								/>
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
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags"  /> -->
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
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
