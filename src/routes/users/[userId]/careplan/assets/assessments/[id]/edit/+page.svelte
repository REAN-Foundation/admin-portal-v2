<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/assessments.schema';
	import type { AssessmentUpdateModel } from '$lib/types/assessments.type';
	import Button from '$lib/components/button/button.svelte';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.assessment.Name);
	let description = $state(data.assessment.Description || undefined);
	let template = $state(data.assessment.Template);
	let referenceTemplateCode = $state(data.assessment.ReferenceTemplateCode);
	let version = $state(data.assessment.Version);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	const assessmentTemplates = data.assessmentTemplates || [];
	const assessmentTemplate = assessmentTemplates.find(
		(template) => template.DisplayCode === referenceTemplateCode
	);

	const userId = page.params.userId;
	const tenantId = data.tenantId;
	var assessmentId = page.params.id;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const editRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/view`;
	const assessmentRoute = `/users/${userId}/careplan/assets/assessments`;

	const breadCrumbs = [
		{ name: 'Asset', path: assetRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset = () => {
		name = data?.assessment?.Name;
		assessmentId = page.params.id;
		description = data?.assessment?.Description;
		template = data?.assessment?.Template;
		referenceTemplateCode = data?.assessment?.TemplateCode;
		version = data?.assessment?.Version;
		keywords = data?.assessment?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};
			if (assessmentTemplates.length === 0) {
				errors = {
					ReferenceTemplateCode:
						'No assessment templates available. Please create clinical assessments first.'
				};
				return;
			}
			if (!referenceTemplateCode || referenceTemplateCode.trim() === '') {
				errors = {
					ReferenceTemplateCode: 'Please select a reference template from the dropdown.'
				};
				return;
			}

			const assessmentUpdateModel: AssessmentUpdateModel = {
				Name: name,
				Description: description,
				Template: template,
				ReferenceTemplateCode: referenceTemplateCode,
				Version: version,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/careplan/assets/assessments/${assessmentId}`, {
				method: 'PUT',
				body: JSON.stringify(assessmentUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log("Redirecting to:", response?.Data?.id);
				console.log('Full response:', response);
				await goto(`${assessmentRoute}/${response?.Data?.id}/view`);
			} else if (response.Errors) {
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
			<h2 class="form-titles">Edit Assessment</h2>
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
							class="input {form?.errors?.Name ? 'input-text-error' : ''}"
							name="assessmentName"
							placeholder="Enter name here..."
							bind:value={name}
						/>
						{#if errors?.Name}
							<p class="error-text">{errors?.Name}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							name="description"
							class="input resize-none {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
							bind:value={description}
							placeholder="Enter description here..."
						></textarea>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Template</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={template}
							placeholder="Enter template..."
							class="input {errors?.Template ? 'input-text-error' : ''}"
						/>
						{#if errors?.Template}
							<p class="error-text">{errors?.Template}</p>
						{/if}
					</td>
				</tr>

				<!-- <tr class="tables-row">
					<td class="table-label">Template Code</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={templateCode}
							placeholder="Enter template code..."
							class="input {errors?.TemplateCode ? 'input-text-error' : ''}"
						/>
						{#if errors?.TemplateCode}
							<p class="error-text">{errors?.TemplateCode}</p>
						{/if}
					</td>
				</tr> -->

				<tr class="tables-row">
					<td class="table-label">Reference Assessment<span class="important-field">*</span></td>
					<td class="table-data">
						{#if assessmentTemplates.length === 0}
							<div class="flex items-center space-x-4">
								<Button
									type="button"
									text="Add Assessment"
									variant="primary"
									onclick={() => goto(`/users/${userId}/assessment-templates/create`)}
								/>
								<div class="text-gray-500 italic">No assessment available</div>
							</div>
						{:else}
							<div class="relative">
								<select
									bind:value={referenceTemplateCode}
									class="select {errors?.ReferenceTemplateCode ? 'input-text-error' : ''}"
								>
									<option value="" disabled selected> Select a assessment </option>
									{#each assessmentTemplates as template}
										<option value={template.DisplayCode}>
											{template.Title}
										</option>
									{/each}
								</select>
								<div class="select-icon-container">
									<Icon icon="mdi:chevron-down" class="select-icon" />
								</div>
							</div>
							{#if errors?.ReferenceTemplateCode}
								<p class="error-text">{errors?.ReferenceTemplateCode}</p>
							{/if}
						{/if}
					</td>
				</tr>

				<!-- <tr class="tables-row">
					<td class="table-label">Reference Template<span class="important-field">*</span></td>
					<td class="table-data">
						<select
							bind:value={referenceTemplateCode}
							class="input {errors?.ReferenceTemplateCode ? 'input-text-error' : ''}"
						>
							<option disabled selected value="">Select reference template here...</option>
							{#each assessmentTemplates as template}
								<option value={template.DisplayCode}>{template.Title}</option>
							{/each}
						</select>
						{#if errors?.ReferenceTemplateCode}
							<p class="error-text">{errors?.ReferenceTemplateCode}</p>
						{/if}
					</td>
				</tr> -->

				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={version}
							class="input {form?.errors?.Version ? 'input-text-error' : ''}"
							name="version"
							placeholder="V 1.0"
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
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
				<Button
					type="submit"
					text="Submit"
					variant="primary"
					disabled={assessmentTemplates.length === 0}
				/>
			{/await}
		</div>
	</form>
</div>
