<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import { createOrUpdateSchema } from '$lib/validation/symptoms.schema.js';
	import type { SymptomCreateModel } from '$lib/types/symptoms.types.js';
	import InputChips from '$lib/components/input-chips.svelte';
	import Button from '$lib/components/button/button.svelte';

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
				const imageUrl = response.Data.FileResources[0].url;
				console.log('imageResourceId', imageUrl);
				const imageResourceId_ = response.Data.FileResources[0].id;
				console.log('ImageResource', imageResourceId_);
				if (imageResourceId_) {
					imageResourceId = imageResourceId_;
					errorMessage.Text = 'File uploaded successfully';
					errorMessage.Colour = 'text-success-500';
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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

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

	const onUpdateKeywords = (e: any) => {
		keywords = e.detail;
		keywordsStr = keywords?.join(', ');
	};

	$inspect(errors);
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create Symptom</th>
							<th class="text-end">
								<a href={symptomRoute} class="form-cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Symptom <span class="text-red-700">*</span></td>
							<td>
								<input
									bind:value={symptom}
									type="text"
									name="symptom"
									placeholder="Enter symptom here..."
									class="health-system-input"
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
									bind:value={description}
									name="description"
									placeholder="Enter description here..."
									class="health-system-input"
								></textarea>
							</td>
						</tr>
						<tr>
							<td>Tags</td>
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
							<td>Language <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="language"
									placeholder="Enter language here..."
									bind:value={language}
									class="health-system-input"
								/>
								{#if errors?.Language}
									<p class="text-error">{errors?.Language}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Image</td>
							<td>
								<input
									name="fileinput"
									type="file"
									class="true health-system-input"
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
				<div class="btn-container mr-5 mb-2">
					{#await promise}
						<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
					{:then data}
						<Button size="md" type="submit" text="Submit" variant="primary" />
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
