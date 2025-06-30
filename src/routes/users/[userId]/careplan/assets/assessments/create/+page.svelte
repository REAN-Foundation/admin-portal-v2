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
	import Input from '$lib/components/input/input.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

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
			console.log('Validation result', validationResult);

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

	$effect(() => {
		keywordsStr = keywords?.join(', ');
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create Assessment" />
			<a href={assetRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="Name" required={true} />
					<td class="table-data">
						<Input
							name="assessmentName"
							type="text"
							placeholder="Enter name here..."
							bind:value={name}
							error={errors?.Name}
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
					<Label text="Template" />
					<td class="table-data">
						<Input
							name="template"
							type="text"
							placeholder="Enter template..."
							bind:value={template}
							error={errors?.Template}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Reference Template Code" required={true} />
					<td class="table-data">
						<select
							name="referenceTemplateCode"
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
					<Label text="Tags" />
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Version" />
					<td class="table-data">
						<Input
							name="version"
							type="text"
							placeholder="V 1.0"
							bind:value={version}
							error={errors?.Version}
						/>
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
