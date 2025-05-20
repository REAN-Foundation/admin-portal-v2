<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { SymptomUpdateModel } from '$lib/types/symptoms.types';
	import { createOrUpdateSchema } from '$lib/validation/symptoms.schema';
	import InputChips from '$lib/components/input-chips.svelte';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	const MAX_FILE_SIZE = 1024 * 150;
	let symptomImage = $state();

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let keywords: string[] = $state(data.symptom.Tags);
	let keywordsStr: string = $state('');

	let id = data.symptom.id;

	let symptom = $state(data.symptom.Symptom);
	let description = $state(data.symptom.Description);

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

	const onFileSelected = async (e) => {
		let file = e.target.files[0];
		const fileSize = file.size;
		if (fileSize > MAX_FILE_SIZE) {
			errorMessage.Text = 'File should be less than 150 KB';
			errorMessage.Colour = 'text-error-500';
			symptomImage.value = null;
			return;
		}

		errorMessage.Text = 'Please wait, file upload is in progress';
		errorMessage.Colour = 'text-error-500';

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', file.name);

		try {
			const res = await fetch(`/api/server/file-resources/upload`, {
				// 	headers: {
				// 	'Content-Type': 'application/json',
				// 	Accept: 'application/json',
				// },
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText);
			}

			const response = await res.json();

			if (response.Status === 'success' && response.HttpCode === 201) {
				errorMessage.Text = 'File uploaded successfully';
				errorMessage.Colour = 'text-success-500';
				const imageUrl = response.Data.FileResources[0].url;
				// console.log('imageResourceId', imageUrl);
				const imageResourceId_ = response.Data.FileResources[0].id;
				// console.log('ImageResource', imageResourceId_);
				if (imageResourceId_) {
					imageResourceId = imageResourceId_;
					return true;
				}
				console.log(imageResourceId);
			} else {
				errorMessage.Text = response.Message;
				errorMessage.Colour = 'text-error-500';
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			errorMessage.Text = 'Error uploading file: ' + error.message;
			errorMessage.Colour = 'text-error-500';
		}
	};

	$inspect('this is keywords', keywords);
	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const symptomUpdateModel: SymptomUpdateModel = {
				Symptom: symptom,
				Description: description,
				Tags: keywords,
				Language: language,
				ImageResourceId: imageResourceId
			};

			console.log(symptomUpdateModel, 'symptomUpdateModel');
			const validationResult = createOrUpdateSchema.safeParse(symptomUpdateModel);

			console.log(validationResult, 'validationResult');
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

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit Symptom</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Symptom <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="symptom"
									bind:value={symptom}
									placeholder="Enter symptom here..."
									class="health-system-input "
								/>
								{#if errors?.Symptom}
									<p class="text-error">{errors?.Symptom}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Description</td>
							<td>
								<textarea
									name="description"
									bind:value={description}
									placeholder="Enter description here..."
									class="health-system-input {form?.errors?.description ? 'input-text-error' : ''}"
								></textarea>
								{#if errors?.Description}
									<p class="text-error">{errors?.Description}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Tags</td>
							<td>
								<InputChips
									bind:keywords
									name="keywords"
									id="keywords"
									keywordsChanged={onUpdateKeywords}
								/>
								<input type="hidden" name="keywordsStr" id="keywordsStr" bind:value={keywordsStr} />
								
							</td>
						</tr>
						<tr>
							<td>Language <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="language"
									bind:value={language}
									placeholder="Enter language here..."
									class="health-system-input"
								/>
								{#if errors?.Language}
									<p class="text-error">{errors?.Language}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Image <span class=" text-red-600">*</span></td>
							<td>
								{#if imageUrl === 'undefined'}
									<input
										name="fileinput"
										type="file"
										required
										class="health-system-input"
										placeholder="Image"
										onchange={async (e) => await onFileSelected(e)}
									/>
								{:else}
									<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
									<input
										name="fileinput"
										type="file"
										class="health-system-input"
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
