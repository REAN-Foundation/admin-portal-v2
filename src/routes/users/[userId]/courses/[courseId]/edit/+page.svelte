<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { CourseImageUploadModel, CourseUpdateModel } from '$lib/types/lms/course';
	import { createOrUpdateSchema } from '$lib/validation/lms/course.schema';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();
	const tenantId = data.tenantId;

	let courseName = $state(data.course.Name);
	let description = $state(data.course.Description || undefined) ;
	let imageUrl = $state(data.course.ImageUrl ?? undefined);
	let imageResourceId = $state(data.course.ImageResourceId ?? undefined);
	let courseImage = $state();
	let durationInDays = $state(data.course.DurationInDays?.toString());
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let previewUrl = $state<string | undefined>(undefined);

	const userId = page.params.userId;
	var courseId = page.params.courseId;

	const editRoute = `/users/${userId}/courses/${courseId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/view`;
	const coursesRoute = `/users/${userId}/courses`;

	const breadCrumbs = [
		{ name: 'Courses', path: coursesRoute },
		{ name: 'Edit', path: editRoute }
	];

	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};	

	const handleReset = () => {
		courseId = page.params.courseId;
		courseName = data?.course?.Name;
		description = data?.course?.Description;
		imageUrl = data?.course?.ImageUrl;
		imageResourceId = data?.course?.ImageResourceId;
		durationInDays = data?.course?.DurationInDays?.toString();
		errors = {};
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = undefined;
		}
	};

	let fileName = $state('');
	const formData = new FormData();

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
		imageUrl = previewUrl;

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
					console.log("imageResourceId...",imageResourceId);
				} else {
					errorMessage.Text = fileJson.Message;
					errorMessage.Colour = 'text-error-500';
				}
			}

			const courseUpdateModel: CourseUpdateModel = {
				Name: courseName,
				Description: description,
				ImageResourceId: imageResourceId,
				DurationInDays: durationInDays ? parseFloat(durationInDays) : undefined,
				TenantId: tenantId
			};

			const validationResult = createOrUpdateSchema.safeParse(courseUpdateModel);
			console.log('validationResult', validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/educational/course/${courseId}`, {
				method: 'PUT',
				body: JSON.stringify(courseUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					previewUrl = undefined;
				}
				toastMessage(response);
				goto(`${coursesRoute}/${response?.Data?.id}/view`);
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
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Course</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Name <span class=" text-red-700">*</span></td>
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
						{#if imageUrl == undefined || imageUrl == null}
							<input
								name="fileinput"
								type="file"
								class="input"
								placeholder="Image"
								onchange={async (e) => await onFileSelected(e)}
							/>
						{:else}
							<Image cls="flex h-24 w-24 rounded-lg mb-2" source={imageUrl} w="24" h="24" />
							<input
								name="fileinput"
								type="file"
								accept="image/*"
								class="input"
								bind:this={courseImage}
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
			<Button type="button" onclick={handleReset} text="Reset" variant="primary" />
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>

