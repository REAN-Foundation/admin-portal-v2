<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import type { AssessmentTemplateCreateModel } from '$lib/types/assessment-template.types.js';
	import { createOrUpdateSchema } from '$lib/validation/assessment.template.schema.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	let errors: Record<string, string> = $state({});
	let promise = $state();

	let title = $state(undefined);
	let description = $state(undefined);
	let type = $state(undefined);
	let provider = $state(undefined);
	let providerAssessmentCode = $state(undefined);
	let serveListNodeChildrenAtOnce = $state(undefined);
	let scoringApplicable = $state(undefined);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Clinical-Assessments Create';
	const userId = $page.params.userId;
	const createRoute = `/users/${userId}/assessment-templates/create`;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const assessmentTemplateCreateModel: AssessmentTemplateCreateModel = {
				Title: title,
				Description: description,
				Type: type,
				Provider: provider,
				ProviderAssessmentCode: providerAssessmentCode,
				ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
				ScoringApplicable: scoringApplicable,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentTemplateCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/assessments/assessment-templates`, {
				method: 'POST',
				body: JSON.stringify(assessmentTemplateCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${assessmentsRoutes}/${response?.Data?.AssessmentTemplate?.id}/view`);
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

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Template</h2>
			<a href={assessmentsRoutes} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Title <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="title"
							placeholder="Enter title here..."
							bind:value={title}
							class="input {errors?.title ? 'input-text-error' : ''}"
						/>
						{#if errors?.Title}
							<p class="text-error">{errors?.Title}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label align-top">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							rows="4"
							cols="50"
							class="input {errors?.description ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Type <span class="text-red-700">*</span></td>
					<td class="table-data">
						<div class="relative">
						<select
							name="type"
							placeholder="Select type here..."
							bind:value={type}
							class="select {errors?.type ? 'input-text-error' : ''}"
						>
							<option>Daily Update</option>
							<option>Careplan</option>
							<option>Survey</option>
							<option>Protocol</option>
							<option>Custom</option>
							
						</select>
						<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
							<Icon icon="mdi:chevron-down" class="text-info h-5 w-5" />
						</div>
					</div>
						{#if errors?.Type}
							<p class="text-error">{errors?.Type}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Provider</td>
					<td class="table-data">
						<input
							type="text"
							name="provider"
							placeholder="Enter provider here"
							bind:value={provider}
							class="input {errors?.provider ? 'input-text-error' : ''}"
						/>
						{#if errors?.Provider}
							<p class="text-error">{errors?.Provider}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Provider Assessment Code</td>
					<td class="table-data">
						<input
							type="text"
							name="providerAssessmentCode"
							bind:value={providerAssessmentCode}
							placeholder="Enter provider assessment code here..."
							class="input {errors?.providerAssessmentCode ? 'input-text-error' : ''}"
						/>
						{#if errors?.ProviderAssessmentCode}
							<p class="text-error">{errors?.ProviderAssessmentCode}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Serve List Node Children At Once</td>
					<td class="table-data">
						<input
							type="checkbox"
							name="serveListNodeChildrenAtOnce"
							bind:checked={serveListNodeChildrenAtOnce}
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.serveListNodeChildrenAtOnce
								? 'input-text-error'
								: ''}"
						/>
						{#if errors?.ServeListNodeChildrenAtOnce}
							<p class="text-error">{errors?.ServeListNodeChildrenAtOnce}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Scoring Applicable</td>
					<td class="table-data">
						<input
							type="checkbox"
							name="scoringApplicable"
							bind:checked={scoringApplicable}
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.scoringApplicable
								? 'input-text-error'
								: ''}"
						/>
						{#if errors?.ScoringApplicable}
							<p class="text-error">{errors?.ScoringApplicable}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label !py-3 align-top">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
						{#if errors?.Tags}
							<p class="text-error">{errors?.Tags}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
