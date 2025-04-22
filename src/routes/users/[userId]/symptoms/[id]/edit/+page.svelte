<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import Icon from '@iconify/svelte';
	import InputChip from '$lib/components/input-chips.svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';

	const MAX_FILE_SIZE = 1024 * 150;
	let symptomImage = $state();

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let id = data.symptom.id;
	let symptom = $state(data.symptom.Symptom);
	let description = $state(data.symptom.Description);
	let tags = $state(data.symptom.Tags);
	let language = $state(data.symptom.Language);
	let imageUrl = data.symptom.ImageUrl ?? undefined;
	let imageResourceId = $state(data.symptom.ImageResourceId ?? undefined);
	let isSubmitting = $state(false);

	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};

	//Original data
	let _symptom = $derived(symptom);
	let _description = $derived(description);
	let _tags = $derived(tags);
	let _language = $derived(language);
	let _imageResourceId = $derived(imageResourceId);

	function handleReset() {
		symptom = _symptom;
		description = _description;
		tags = _tags;
		language = _language;
		imageResourceId = _imageResourceId;
	}

	const userId = page.params.userId;
	const editRoute = `/users/${userId}/symptoms/${id}/edit`;
	const viewRoute = `/users/${userId}/symptoms/${id}/view`;
	const symptomRoute = `/users/${userId}/symptoms`;

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

	//   const onFileSelected = async (e) => {
	// 	let f = e.target.files[0];
	//       const fileSize = f.size;
	//       if (fileSize > MAX_FILE_SIZE) {
	//           errorMessage.Text = "File should be less than 150 KB";
	//           errorMessage.Colour = 'text-error-500'
	//           symptomImage.value = null;
	//           return;
	//       }
	//       errorMessage.Text = 'Please wait file upload is in progress';
	//       errorMessage.Colour = 'text-error-500';
	//       console.log(`File size: ${fileSize} bytes`);
	// 	const filename = f.name;
	// 	let reader = new FileReader();
	// 	reader.readAsDataURL(f);
	// 	reader.onload = async (e) => {
	// 		fileinput = e.target.result;
	// 		const isFileUploaded = await upload(e.target.result, filename);
	//           if (isFileUploaded) {
	//               errorMessage.Text = "File uploaded successfully";
	//               errorMessage.Colour = 'text-success-500'
	//               return;
	//           }
	//           errorMessage.Text = 'Error in file upload';
	//           errorMessage.Colour = 'text-error-500'
	//           symptomImage.value = null;
	//           return;
	// 	};
	// };

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
				console.log('imageResourceId', imageUrl);
				const imageResourceId_ = response.Data.FileResources[0].id;
				console.log('ImageResource', imageResourceId_);
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

	function handleSubmit() {
		isSubmitting = true;
	}

	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form
				method="post"
				action="?/updateSymptomAction"
				enctype="multipart/form-data"
				use:enhance
				onsubmit={handleSubmit}
			>
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
									required
									bind:value={symptom}
									placeholder="Enter symptom here..."
									class="health-system-input {form?.errors?.symptom ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.symptom}
									<p class="text-error">{form?.errors?.symptom[0]}</p>
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
								/>
								{#if form?.errors?.description}
									<p class="text-error">{form?.errors?.description[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td class="align-top">Tags</td>
							<td>
								<!-- <InputChip chips="variant-filled-error rounded-2xl" name="tags" bind:value={tags} /> -->
								{#if form?.errors?.tags}
									<p class="text-error">{form?.errors?.tags[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Language <span class=" text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="language"
									required
									bind:value={language}
									placeholder="Enter language here..."
									class="health-system-input {form?.errors?.language ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.language}
									<p class="text-error">{form?.errors?.language[0]}</p>
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
								{#if form?.errors?.imageResourceId}
									<p class="text-error">{form?.errors?.imageResourceId[0]}</p>
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
					<button
						type="submit"
						class="health-system-btn variant-soft-secondary"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
