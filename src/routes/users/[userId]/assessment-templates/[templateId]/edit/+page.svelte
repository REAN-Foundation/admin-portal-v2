<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import InputChip from '$lib/components/input-chips.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/assessment.template.schema';
	import type { AssessmentTemplateUpdateModel } from '$lib/types/assessment-template.types';
	import InputChips from '$lib/components/input-chips.svelte';

	////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let title = $state(data.assessmentTemplate.Title),
		description = $state(data.assessmentTemplate.Description),
		displayCode = $state(data.assessmentTemplate.DisplayCode),
		assessmentType = $state(data.assessmentTemplate.Type),
		provider = $state(data.assessmentTemplate.Provider||undefined),
		providerAssessmentCode = $state(data.assessmentTemplate.ProviderAssessmentCode||undefined),
		serveListNodeChildrenAtOnce = $state(data.assessmentTemplate.ServeListNodeChildrenAtOnce),
		scoringApplicable = $state(data.assessmentTemplate.ScoringApplicable),
		keywords: string[] = $state(data.assessmentTemplate.Tags);

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywordsStr: string = $state('');

	function handleReset() {
		title = data.assessmentTemplate.Title;
		description = data.assessmentTemplate.Description;
		displayCode = data.assessmentTemplate.DisplayCode;
		assessmentType = data.assessmentTemplate.Type;
		provider = data.assessmentTemplate.Provider;
		providerAssessmentCode = data.assessmentTemplate.ProviderAssessmentCode;
		serveListNodeChildrenAtOnce = data.assessmentTemplate.ServeListNodeChildrenAtOnce;
		scoringApplicable = data.assessmentTemplate.ScoringApplicable;
		keywords = data?.assessmentTemplate?.Tags;
		errors = {};
	}

	const userId = page.params.userId;
	const templateId = page.params.templateId;
	const editRoute = `/users/${userId}/assessment-templates/${templateId}/edit`;
	const viewRoute = `/users/${userId}/assessment-templates/${templateId}/view`;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'Edit', path: editRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const assessmentTemplateUpdateModel: AssessmentTemplateUpdateModel = {
				Title: title,
				Description: description,
				Type: assessmentType,
				Provider: provider,
				ProviderAssessmentCode: providerAssessmentCode,
				ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
				ScoringApplicable: scoringApplicable,
				Tags: keywords
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentTemplateUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/assessments/assessment-templates/${templateId}`, {
				method: 'PUT',
				body: JSON.stringify(assessmentTemplateUpdateModel),
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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Template</th>
							<th class="text-end">
								<a href={viewRoute} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Title <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="title"
									required
									bind:value={title}
									placeholder="Enter title here..."
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
									bind:value={description}
									placeholder="Enter description here..."
									class="health-system-input {form?.errors?.description ? 'input-text-error' : ''}"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Type *</td>
							<td>
								<select
									name="type"
									bind:value={assessmentType}
									placeholder="Select type here..."
									class="health-system-input {form?.errors?.assessmentType
										? 'input-text-error'
										: ''}"
								>
									<option selected>{assessmentType}</option>
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
									bind:value={provider}
									placeholder="Enter provider here"
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
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {form
										?.errors?.serveListNodeChildrenAtOnce
										? 'input-text-error'
										: ''}"
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
									class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {form
										?.errors?.scoringApplicable
										? 'input-text-error'
										: ''}"
									bind:checked={scoringApplicable}
								/>
								{#if errors?.ScoringApplicable}
									<p class="text-error">{errors?.ScoringApplicable}</p>
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
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
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
