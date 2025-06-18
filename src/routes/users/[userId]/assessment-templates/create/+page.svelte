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
	import Label from '$lib/components/label/label.svelte';
	import Select from '$lib/components/select/select.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

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

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};

	const options = ['Daily Update', 'Symptoms', 'Survey', 'Protocol', 'Custom'];
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Template</th>
							<th class="text-end">
								<a href={assessmentsRoutes} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Title <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="title"
									placeholder="Enter title here..."
									bind:value={title}
									class="health-system-input {form?.errors?.title ? 'input-text-error' : ''}"
								/>
								{#if errors?.Title}
									<p class="text-error">{errors?.Title}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Description</td>
							<td>
								<textarea
									name="description"
									placeholder="Enter description here..."
									bind:value={description}
									rows="4"
									cols="50"
									class="health-system-input {form?.errors?.description ? 'input-text-error' : ''}"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Type <span class="text-red-700">*</span></td>
							<td>
								<select
									name="type"
									placeholder="Select type here..."
									bind:value={type}
									class="health-system-input {form?.errors?.type ? 'input-text-error' : ''}"
								>
									<option>Daily Update</option>
									<option>Symptoms</option>
									<option>Survey</option>
									<option>Protocol</option>
									<option>Custom</option>
								</select>
								{#if errors?.Type}
									<p class="text-error">{errors?.Type}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Provider</td>
							<td>
								<input
									type="text"
									name="provider"
									placeholder="Enter provider here"
									bind:value={provider}
									class="health-system-input {form?.errors?.provider ? 'input-text-error' : ''}"
								/>
								{#if errors?.Provider}
									<p class="text-error">{errors?.Provider}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Provider Assessment Code</td>
							<td>
								<input
									type="text"
									name="providerAssessmentCode"
									bind:value={providerAssessmentCode}
									placeholder="Enter provider assessment code here..."
									class="health-system-input {form?.errors?.providerAssessmentCode
										? 'input-text-error'
										: ''}"
								/>
								{#if errors?.ProviderAssessmentCode}
									<p class="text-error">{errors?.ProviderAssessmentCode}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Serve List Node Children At Once</td>
							<td>
								<input
									type="checkbox"
									name="serveListNodeChildrenAtOnce"
									bind:checked={serveListNodeChildrenAtOnce}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2
									{form?.errors?.serveListNodeChildrenAtOnce ? 'input-text-error' : ''}"
								/>
								{#if errors?.ServeListNodeChildrenAtOnce}
									<p class="text-error">{errors?.ServeListNodeChildrenAtOnce}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Scoring Applicable</td>
							<td>
								<input
									type="checkbox"
									name="scoringApplicable"
									bind:checked={scoringApplicable}
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2
										{form?.errors?.scoringApplicable ? 'input-text-error' : ''}"
								/>
								{#if errors?.ScoringApplicable}
									<p class="text-error">{errors?.ScoringApplicable}</p>
								{/if}
							</td>
						</tr>
						<tr class="">
							<td class="!py-3 align-top">Tags</td>
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
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
