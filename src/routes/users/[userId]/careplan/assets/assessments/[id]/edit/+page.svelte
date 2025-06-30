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
	import Input from '$lib/components/input/input.svelte';
	import Textarea from '$lib/components/textarea/textarea.svelte';
	import Label from '$lib/components/label/label.svelte';
	import Heading from '$lib/components/heading/heading.svelte';
	///////////////////////////////////////////////////////////////////////////////////////
	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.assessment.Name);
	let description = $state(data.assessment.Description || undefined);
	let template = $state(data.assessment.Template);
	let templateCode = $state(data.assessment.ReferenceTemplateCode);
	let version = $state(data.assessment.Version);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	const assessmentTemplates = data.assessmentTemplates || [];
	const assessmentTemplate = assessmentTemplates.find(
		(template) => template.DisplayCode === templateCode
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
		templateCode = data?.assessment?.TemplateCode;
		version = data?.assessment?.Version;
		keywords = data?.assessment?.Tags;
		errors = {};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const assessmentUpdateModel: AssessmentUpdateModel = {
				Name: name,
				Description: description,
				Template: template,
				ReferenceTemplateCode: templateCode,
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
			<Heading text="Edit Assessment" />
			<a href={viewRoute} class="form-cancel-btn">
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
					<Label text="Template Code" required={true} />
					<td class="table-data">
						<select
							name="templateCode"
							bind:value={templateCode}
							class="input {errors?.TemplateCode ? 'input-text-error' : ''}"
						>
							<option value="" disabled selected>
								{assessmentTemplates?.length > 0 ? 'Select a template' : 'No templates available'}
							</option>
							{#each assessmentTemplate as template}
								<option value={template.DisplayCode}>
									{template.Title}
								</option>
							{/each}
						</select>
						{#if errors?.TemplateCode}
							<p class="error-text">{errors?.TemplateCode}</p>
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
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
