<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import { createOrUpdateSchema } from '$lib/validation/educational/course.schema.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { CourseCreateModel, CourseImageUploadModel } from '$lib/types/educational/course.js';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';

	///////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	let errors: Record<string, string> = $state({});
	let courseName = $state(undefined);
	let description = $state(undefined);
	let durationInDays = $state(undefined);
	let promise = $state();
	let imageResourceId = $state(undefined);
	let fileName = $state('');
	const formData = new FormData();
	let courseImage;
	let previewUrl = $state<string | undefined>(undefined);
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};

	data.title = 'Educational-Learning Journey-Courses Create';
	const userId = page.params.userId;
	const createRoute = `/users/${userId}/courses/create`;
	const coursesRoute = `/users/${userId}/courses`;

	const breadCrumbs = [
		{ name: 'Courses', path: coursesRoute },
		{ name: 'Create', path: createRoute }
	];

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		
		fileName = file.name;

		const fileCreateModel: CourseImageUploadModel = {
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

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		previewUrl = URL.createObjectURL(file);

		formData.delete('file');
		formData.delete('filename');
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
					}
				} else {
					errorMessage.Text = fileJson.Message;
					errorMessage.Colour = 'text-error-500';
					return;
				}
			}

			const courseCreateModel: CourseCreateModel = {
				Name: courseName,
				Description: description,
				ImageResourceId: imageResourceId,
				DurationInDays: durationInDays ? parseFloat(durationInDays) : undefined
			};

			const validationResult = createOrUpdateSchema.safeParse(courseCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/educational/course`, {
				method: 'POST',
				body: JSON.stringify(courseCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					previewUrl = undefined;
				}
				toastMessage(response);
				goto(`${coursesRoute}/${response?.Data?.Course?.id}/view`);
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
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Course</h2>
			<a href={coursesRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				
				<tr class="tables-row">
					<td class="table-label">Name <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.Name ? 'input-text-error' : ''}"
							name="courseName"
							placeholder="Enter name here..."
							bind:value={courseName}
						/>
						{#if errors?.Name}
							<p class="text-error">{errors?.Name}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Description</td>
					<td class="table-data">
						<textarea
							class="input {errors?.Description ? 'input-text-error' : ''}"
							name="description"
							placeholder="Enter description here..."
							bind:value={description}
							rows="4"
						></textarea>
						{#if errors?.Description}
							<p class="text-error">{errors?.Description}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Image</td>
					<td class="table-data">
						{#if previewUrl}
							<Image cls="flex h-24 w-24 rounded-lg mb-2" source={previewUrl} w="24" h="24" />
						{/if}
						<input
							name="fileinput"
							type="file"
							accept="image/*"
							class="input"
							placeholder="Image"
							bind:this={courseImage}
							onchange={async (e) => await onFileSelected(e)}
						/>
						{#if errorMessage}
							<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
						{/if}
						<input type="hidden" name="imageResourceId" value={imageResourceId} />
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Duration (Days)</td>
					<td class="table-data">
						<input
							type="number"
							step="0.01"
							min="0"
							class="input {errors?.DurationInDays ? 'input-text-error' : ''}"
							name="durationInDays"
							placeholder="Enter duration in days..."
							bind:value={durationInDays}
						/>
						{#if errors?.DurationInDays}
							<p class="text-error">{errors?.DurationInDays}</p>
						{/if}
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

