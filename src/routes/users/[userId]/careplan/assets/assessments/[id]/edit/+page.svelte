<script lang="ts">
	import { page } from '$app/state';
	import type { PageServerData } from './$types'
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import InputChips from '$lib/components/input-chips.svelte';
	import { createOrUpdateSchema } from '$lib/validation/assessments.schema';
	import type { AssessmentUpdateModel } from '$lib/types/assessments.type';

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let name = $state(data.assessment.Name);
	let description = $state(data.assessment.Description);
	let template = $state(data.assessment.Template);
	let templateCode = $state(data.assessment.TemplateCode);
	let version = $state(data.assessment.Version);
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	const userId = page.params.userId;
	var assessmentId = page.params.id;

	const editRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/edit`;
	const viewRoute = `/users/${userId}/careplan/assets/assessments/${assessmentId}/view`;
	const assessmentRoute = `/users/${userId}/careplan/assets/assessments`;

	const breadCrumbs = [
		{ name: 'Assessment', path:assessmentRoute },
		{ name: 'Edit', path: editRoute }
	];

	const handleReset =  () => {
		 name = data?.assessment?.Name;
		 assessmentId = page.params.id;
		 description = data?.assessment?.Description;
		 template = data?.assessment?.Template;
		 templateCode = data?.assessment?.TemplateCode;
		 version = data?.assessment?.Version;
		 keywords = data?.assessment?.Tags;
		 errors = {};
		}

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
				Tags: keywords
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
				console.log("Full response:", response);
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

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};

</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="table-container">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<table class="table-c">
			<thead>
					<tr>
						<th>Edit Assessment</th>
						<th class="text-end">
							<a href={viewRoute} class="health-system-btn variant-soft-secondary">
								<Icon icon="material-symbols:close-rounded" />
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Name </td>
						<td>
							<input
									type="text"
									class="input {form?.errors?.Name
										? 'input-text-error'
										: ''}"
									name="assessmentName"
									placeholder="Enter name here..."
									bind:value={name}
								/>
							{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
							{/if}
						</td>
					</tr>

					<tr>
						<td class="align-top">Description</td>
						<td>
							<textarea
								name="description"
								class="input w-full {errors?.Code ? 'border-error-300' : 'border-primary-200'}"
								bind:value={description}
								placeholder="Enter description here..."
							></textarea>
						</td>
					</tr>

					<tr>
						<td>Template</td>
						<td>
							<input
								type="text"
								bind:value={template}
								placeholder="Enter template..."
								class="input {errors?.Template ? 'input-text-error' : ''}"
							/>
							{#if errors?.Template}<p class="text-error">{errors?.Template}</p>{/if}
						</td>
					</tr>
					<tr>
						<td>Template Code </td>
						<td>
							<input
								type="text"
								bind:value={templateCode}
								placeholder="Enter template code..."
								class="input {errors?.TemplateCode ? 'input-text-error' : ''}"
							/>
							{#if errors?.TemplateCode}<p class="text-error">{errors?.TemplateCode}</p>{/if}
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
					<tr>
						<td>Version</td>
						<td>
							<input type="text" bind:value={version} class="input" placeholder="V 1.0" />
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
