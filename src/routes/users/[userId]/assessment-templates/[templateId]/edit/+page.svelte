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
	import Button from '$lib/components/button/button.svelte';

	////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let title = $state(data.assessmentTemplate.Title),
		description = $state(data.assessmentTemplate.Description || ''),
		displayCode = $state(data.assessmentTemplate.DisplayCode),
		assessmentType = $state(data.assessmentTemplate.Type),
		provider = $state(data.assessmentTemplate.Provider || undefined),
		providerAssessmentCode = $state(data.assessmentTemplate.ProviderAssessmentCode || undefined),
		serveListNodeChildrenAtOnce = $state(data.assessmentTemplate.ServeListNodeChildrenAtOnce),
		scoringApplicable = $state(data.assessmentTemplate.ScoringApplicable),
		keywords: string[] = $state(data.assessmentTemplate.Tags || []);

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
	$effect(() => {
		keywordsStr = keywords?.join(', ');
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Template</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Title <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="title"
							required
							bind:value={title}
							placeholder="Enter title here..."
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
							bind:value={description}
							placeholder="Enter description here..."
							class="input {errors?.description ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Type <span class="text-red-600">*</span></td>
					<td class="table-data">
						<select
							name="type"
							bind:value={assessmentType}
							placeholder="Select type here..."
							class="input {errors?.assessmentType ? 'input-text-error' : ''}"
						>
							<option selected>{assessmentType}</option>
							{#if assessmentType !== 'Daily Update'}
								<option>Daily Update</option>
							{/if}
							{#if assessmentType !== 'Survey'}
								<option>Survey</option>
							{/if}
							{#if assessmentType !== 'Protocol'}
								<option>Protocol</option>
							{/if}
							{#if assessmentType !== 'Custom'}
								<option>Custom</option>
							{/if}
						</select>
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
							bind:value={provider}
							placeholder="Enter provider here"
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
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.serveListNodeChildrenAtOnce ? 'input-text-error' : ''}"
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
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {errors?.scoringApplicable ? 'input-text-error' : ''}"
							bind:checked={scoringApplicable}
						/>
						{#if errors?.ScoringApplicable}
							<p class="text-error">{errors?.ScoringApplicable}</p>
						{/if}
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
			<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
