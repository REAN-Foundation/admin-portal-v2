<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { SymptomUpdateModel, SymptomUploadModel } from '$lib/types/symptoms.types';
	import { createOrUpdateSchema } from '$lib/validation/symptoms.schema';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let symptomImage = $state();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywords: string[] = $state(data.symptom.Tags);
	let keywordsStr: string = $state('');

	let id = data.symptom.id;

	let symptom = $state(data.symptom.Symptom);
	let description = $state(data.symptom.Description || undefined);

	let language = $state(data.symptom.Language);
	let imageUrl = data.symptom.ImageUrl ?? undefined;
	let imageResourceId = $state(data.symptom.ImageResourceId ?? undefined);

	var symptomId = page.params.id;
	const userId = page.params.userId;
	const editRoute = `/users/${userId}/symptoms/${id}/edit`;
	const viewRoute = `/users/${userId}/symptoms/${id}/view`;
	const symptomRoute = `/users/${userId}/symptoms`;

	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};

	function handleReset() {
		symptomId = page.params.id;
		symptom = data?.symptom?.Symptom;
		description = data?.symptom?.Description;
		keywords = data?.symptom?.Tags;
		language = data?.symptom?.Language;
		imageResourceId = data?.symptom?.ImageResourceId;
		errors = {};
	}

	const breadCrumbs = [
		{
			name: 'Symptoms',
			path: symptomRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
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

			const symptomUpdateModel: SymptomUpdateModel = {
				Symptom: symptom,
				Description: description,
				Tags: keywords,
				Language: language,
				ImageResourceId: imageResourceId
			};

			const validationResult = createOrUpdateSchema.safeParse(symptomUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/symptoms/${symptomId}`, {
				method: 'PUT',
				body: JSON.stringify(symptomUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log(response, 'response');
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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Symptom</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Symptom <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="symptom"
							bind:value={symptom}
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
					<td class="table-label align-top">Tags</td>
					<td class="table-data">
						<InputChips bind:keywords name="keywords" id="keywords" />
						<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Language <span class="text-red-600">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="language"
							bind:value={language}
							placeholder="Enter language here..."
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
						{#if imageUrl === 'undefined'}
							<input
								name="fileinput"
								type="file"
								required
								class="input"
								placeholder="Image"
								onchange={async (e) => await onFileSelected(e)}
							/>
						{:else}
							<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
							<input
								name="fileinput"
								type="file"
								class="input"
								bind:this={symptomImage}
								placeholder="Image"
								onchange={async (e) => await onFileSelected(e)}
							/>
							{#if errorMessage}
								<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
							{/if}
						{/if}
						<input type="hidden" name="imageResourceId" value={imageResourceId} />
						{#if errors?.ImageResourceId}
							<p class="text-error">{errors?.ImageResourceId}</p>
						{/if}
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
