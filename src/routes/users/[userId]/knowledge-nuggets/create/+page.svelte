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
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();

	let topicName = $state(undefined);
	let additionalResources: string[] = $state([]);
	let newResource = $derived(additionalResources.join(', '));

	let briefInformation = $state(undefined);
	let detailedInformation = $state(undefined);

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
				DetailedInformation: detailedInformation,
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
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Knowledge Nugget</h2>
			<a href={knowledgeNuggetsRoute} class="form-cancel-btn">
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
							class="input {errors?.topicName ? 'input-text-error' : ''}"
							placeholder="Enter name here..."
							bind:value={topicName}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Brief Information</td>
					<td class="table-data">
						<textarea
							name="briefInformation"
							class="input resize-none"
							placeholder="Enter brief information here..."
							bind:value={briefInformation}
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Detailed Information</td>
					<td class="table-data">
						<textarea
							name="detailedInformation"
							class="input resize-none"
							placeholder="Enter detailed information here..."
							bind:value={detailedInformation}
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Additional Resources</td>
					<td class="table-data">
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

				<tr class="tables-row">
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
