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
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let title = $state(data.assessmentTemplate.Title),
		description = $state(data.assessmentTemplate.Description),
		displayCode = $state(data.assessmentTemplate.DisplayCode),
		assessmentType = $state(data.assessmentTemplate.Type),
		provider = $state(data.assessmentTemplate.Provider),
		providerAssessmentCode = $state(data.assessmentTemplate.ProviderAssessmentCode),
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

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Edit Template" />
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Title" required={true} />
					<td class="table-data">
						<Input
							name="title"
							type="text"
							bind:value={title}
							placeholder="Enter title here..."
							error={errors?.Title}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							bind:value={description}
							placeholder="Enter description here..."
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Type" required={true} />
					<td class="table-data">
						<select
							name="type"
							bind:value={assessmentType}
							placeholder="Select type here..."
							class="health-system-input {form?.errors?.assessmentType ? 'input-text-error' : ''}"
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

				<tr class="tables-row">
					<Label text="Provider" />
					<td class="table-data">
						<Input
							name="provider"
							type="text"
							bind:value={provider}
							placeholder="Enter provider here..."
							error={errors?.Provider}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Provider Assessment Code" />
					<td class="table-data">
						<Input
							name="providerAssessmentCode"
							type="text"
							bind:value={providerAssessmentCode}
							placeholder="Enter provider assessment code here..."
							error={errors?.ProviderAssessmentCode}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Serve List Node Children At Once" />
					<td class="table-data">
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

				<tr class="tables-row">
					<Label text="Scoring Applicable" />
					<td class="table-data">
						<input
							type="checkbox"
							name="scoringApplicable"
							bind:checked={scoringApplicable}
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2 {form
								?.errors?.scoringApplicable
								? 'input-text-error'
								: ''}"
						/>
						{#if errors?.ScoringApplicable}
							<p class="text-error">{errors?.ScoringApplicable}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<Input name="keywordsStr" type="hidden" bind:value={keywordsStr} />
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container flex gap-4">
			<Button type="button" text="Reset" variant="primary" onclick={handleReset} />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
