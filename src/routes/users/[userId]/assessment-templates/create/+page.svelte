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
	import Heading from '$lib/components/heading/heading.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
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
			<Heading text="Create Template" />
			<a href={assessmentsRoutes} class="form-cancel-btn">
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
							placeholder="Enter title here..."
							bind:value={title}
							error={errors?.Title}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Description" />
					<td class="table-data">
						<Textarea
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							error={errors?.Description}
							resize={false}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Type" required={true} />
					<td class="table-data">
						<div class="relative">
						<select
							name="type"
							placeholder="Select type here..."
							bind:value={type}
							class="select {errors?.type ? 'input-text-error' : ''}"
						>
							<option>Daily Update</option>
							<option>Symptoms</option>
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
					<Label text="Provider" />
					<td class="table-data">
						<Input
							name="provider"
							type="text"
							placeholder="Enter provider here..."
							bind:value={provider}
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
							placeholder="Enter provider assessment code here..."
							bind:value={providerAssessmentCode}
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
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2
							{form?.errors?.serveListNodeChildrenAtOnce ? 'input-text-error' : ''}"
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
							class="checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md ml-2
							{form?.errors?.scoringApplicable ? 'input-text-error' : ''}"
						/>
						{#if errors?.ScoringApplicable}
							<p class="text-error">{errors?.ScoringApplicable}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<Input name="keywordsStr" type="hidden" bind:value={keywordsStr} />
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
