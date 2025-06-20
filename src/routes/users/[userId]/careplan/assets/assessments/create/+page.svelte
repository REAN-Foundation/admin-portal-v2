<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import type { AssessmentCreateModel } from '$lib/types/assessments.type.js';
	import { createOrUpdateSchema } from '$lib/validation/assessments.schema.js';
	import Button from '$lib/components/button/button.svelte';

	/////////////////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state('');
	let description = $state('');
	let template = $state('');
	let referenceTemplateCode = $state('');
	let version = $state('');
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');
	// let assessmentTemplates = $state([]);
	
	 let assessmentTemplates = data.assessmentTemplates ?? [];
	console.log('assessmentTemplates', assessmentTemplates);

	data.title = 'Create Assessment';
	const userId = page.params.userId;
	// const tenantId = data?.sessionUser?.tenantId;
	const tenantId = data?.tenantId;

	const assetRoute = `/users/${userId}/careplan/assets`;
	const createRoute = `/users/${userId}/careplan/assets/assessments/create`;
	const assessmentRoute = `/users/${userId}/careplan/assets/assessments`;

	const breadCrumbs = [
		{ name: 'Assets', path: assetRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const assessmentCreateModel: AssessmentCreateModel = {
				Name: name,
				Description: description,
				Template: template,
				ReferenceTemplateCode: referenceTemplateCode,
				Version: version,
				Tags: keywords,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(assessmentCreateModel);
			console.log("Validation result", validationResult)

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}
			// console.log(assessmentCreateModel); 
			const res = await fetch(`/api/server/careplan/assets/assessments`, {
				method: 'POST',
				body: JSON.stringify(assessmentCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// console.log('Full response:', response);
			    goto(`${assessmentRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Assessment</h2>
			<a href={assetRoute} class="form-cancel-btn">
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
							class="input {errors?.Name ? 'input-text-error' : ''}"
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
							class="input resize-none {errors?.Description ? 'border-error-300' : 'border-primary-200'}"
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
				<tr class="tables-row">
	<td class="table-label">Reference Template Code <span class="important-field">*</span></td>
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
</tr>

<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips
							bind:keywords
							name="keywords"
							id="keywords"
							keywordsChanged={onUpdateKeywords}
						/>
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Version</td>
					<td class="table-data">
						<input
							type="text"
							bind:value={version}
							class="input {errors?.Version ? 'input-text-error' : ''}"
							placeholder="V 1.0"
							name="version"
						/>
						{#if errors?.Version}
							<p class="error-text">{errors?.Version}</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>

		<div class="btn-container">
			{#await promise}
				<button type="submit" class="table-btn variant-soft-secondary" disabled>
					Submitting
				</button>
			{:then data}
				<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
			{/await}
		</div>
	</form>
</div>

