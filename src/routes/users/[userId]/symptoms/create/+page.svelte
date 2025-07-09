<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/symptoms.schema.js';
	import type { SymptomCreateModel, SymptomUploadModel } from '$lib/types/symptoms.types.js';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';

	////////////////////////////////////////////////////////////////////////

	let { data, form } = $props();
	let errors: Record<string, string> = $state({});
	let symptom = $state(undefined);
	let description = $state(undefined);
	let tags = $state(undefined);
	let language = $state(undefined);
	let imageResourceId = $state(undefined);

	let promise = $state();
	let keywords: string[] = $state([]);
	let keywordsStr = $state('');

	data.title = 'Clinical-Symptoms Create';
	const userId = page.params.userId;

	let symptomImage;

	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};
	const MAX_FILE_SIZE = 1024 * 150;
	const createRoute = `/users/${userId}/symptoms/create`;
	const symptomRoute = `/users/${userId}/symptoms`;

	const breadCrumbs = [
		{ name: 'Symptoms', path: symptomRoute },
		{ name: 'Create', path: createRoute }
	];

	let fileName = $state('');
	const formData = new FormData();

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		fileName = file.name;

		const fileCreateModel: SymptomUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		formData.append('file', file);
		formData.append('filename', file.name);
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			if (formData.has('file')) {
				const fileRes = await fetch(`/api/server/file-resources/upload/reancare`, {
					method: 'POST',
					body: formData
				});

				const fileJson = await fileRes.json();

				if (fileJson.Status === 'success' && fileJson.HttpCode === 201) {
					const imageResourceId_ = fileJson.Data.FileResources[0].id;
					if (imageResourceId_) {
						imageResourceId = imageResourceId_;
						errorMessage.Text = 'File uploaded successfully';
						errorMessage.Colour = 'text-success-500';
						// return true;
					}
					console.log(imageResourceId);
				} else {
					errorMessage.Text = fileJson.Message;
					errorMessage.Colour = 'text-error-500';
				}
			}

			const symptomCreateModel: SymptomCreateModel = {
				Symptom: symptom,
				Description: description,
				Tags: keywords,
				Language: language,
				ImageResourceId: imageResourceId
			};

			const validationResult = createOrUpdateSchema.safeParse(symptomCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/symptoms`, {
				method: 'POST',
				body: JSON.stringify(symptomCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log(response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${symptomRoute}/${response?.Data?.SymptomType?.id}/view`);
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

	$inspect(errors);
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Symptom</h2>
			<a href={symptomRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Symptom <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							bind:value={symptom}
							type="text"
							name="symptom"
							placeholder="Enter symptom here..."
							class="input {errors?.symptom ? 'input-text-error' : ''}"
						/>
						{#if errors?.Symptom}
							<p class="text-error">{errors?.Symptom}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							bind:value={description}
							name="description"
							placeholder="Enter description here..."
							class="input {errors?.description ? 'input-text-error' : ''}"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
						{#if errors?.Tags}
							<p class="text-error">{errors?.Tags}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Language <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="language"
							placeholder="Enter language here..."
							bind:value={language}
							class="input {errors?.language ? 'input-text-error' : ''}"
						/>
						{#if errors?.Language}
							<p class="text-error">{errors?.Language}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Image</td>
					<td class="table-data">
						<input
							name="fileinput"
							type="file"
							class="input"
							placeholder="Image"
							bind:this={symptomImage}
							onchange={async (e) => await onFileSelected(e)}
						/>
						{#if errorMessage}
							<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
						{/if}
						<input type="hidden" name="imageResourceId" value={imageResourceId} />
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>
