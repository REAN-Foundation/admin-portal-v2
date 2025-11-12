<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { ContentUpdateModel } from '$lib/types/educational/content';
	import { createOrUpdateSchema } from '$lib/validation/educational/content.schema';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let title = $state(data.content?.Title || '');
	let contentType = $state(data.content?.ContentType || '');
	let description = $state(data.content?.Description || undefined);
	let sequence = $state(data.content?.Sequence?.toString());
	let resourceLink = $state(data.content?.ResourceLink || undefined);
	let imageUrl = $state(data.content?.ImageUrl ?? undefined);
	let imageResourceId = $state(data.content?.ImageResourceId ?? undefined);
	let fileName = $state('');
	const formData = new FormData();
	let contentImage;
	let previewUrl = $state<string | undefined>(data.content?.ImageUrl ?? undefined);
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};
	let durationInMins = $state(data.content?.DurationInMins?.toString());
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const userId = page.params.userId;
	const courseId = page.params.courseId;
	const moduleId = page.params.moduleId;
	var contentId = page.params.contentId;

	const editRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents/${contentId}/view`;
	const contentsRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/contents`;
	const modulesRoute = `/users/${userId}/courses/${courseId}/modules`;
	const courseRoute = `/users/${userId}/courses`;

	const breadCrumbs = [
		{ name: 'Courses', path: courseRoute },
		{ name: 'Modules', path: modulesRoute },
		{ name: 'Contents', path: contentsRoute },
		{ name: 'Edit', path: editRoute }
	];

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		
		fileName = file.name;

		const fileCreateModel = {
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

	const handleReset = () => {
		contentId = page.params.contentId;
		title = data?.content?.Title || '';
		contentType = data?.content?.ContentType || '';
		description = data?.content?.Description || undefined;
		sequence = data?.content?.Sequence?.toString();
		resourceLink = data?.content?.ResourceLink || undefined;
		imageUrl = data?.content?.ImageUrl || undefined;
		imageResourceId = data?.content?.ImageResourceId || undefined;
		durationInMins = data?.content?.DurationInMins?.toString();
		errors = {};
		if (previewUrl && previewUrl !== data?.content?.ImageUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = data?.content?.ImageUrl ?? undefined;
		}
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

			const contentUpdateModel: ContentUpdateModel = {
				Title: title,
				ContentType: contentType,
				Description: description,
				Sequence: sequence ? parseFloat(sequence) : undefined,
				ResourceLink: resourceLink,
				ImageUrl: imageResourceId || imageUrl,
				DurationInMins: durationInMins ? parseFloat(durationInMins) : undefined
			};

			const validationResult = createOrUpdateSchema.safeParse(contentUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/educational/content/${contentId}`, {
				method: 'PUT',
				body: JSON.stringify(contentUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (previewUrl && previewUrl !== data?.content?.ImageUrl) {
					URL.revokeObjectURL(previewUrl);
					previewUrl = undefined;
				}
				toastMessage(response);
				const updatedContentId = response?.Data?.CourseContent?.id || response?.Data?.Content?.id || contentId;
				goto(`${contentsRoute}/${updatedContentId}/view`);
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
			if (previewUrl && previewUrl !== data?.content?.ImageUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={(event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Edit Content</h2>
			<a href={viewRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Title <span class=" text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.Title ? 'input-text-error' : ''}"
							name="title"
							placeholder="Enter title here..."
							bind:value={title}
						/>
						{#if errors?.Title}
							<p class="text-error">{errors?.Title}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Content Type <span class=" text-red-700">*</span></td>
					<td class="table-data">
						<div class="relative">
							<select required class="select" bind:value={contentType}>
								<option value="">Select Content Type</option>
								<option value="Text">Text</option>
								<option value="Pdf">Pdf</option>
								<option value="Video">Video</option>
								<option value="Assessment">Assessment</option>
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
						{#if errors?.ContentType}
							<p class="text-error">{errors?.ContentType}</p>
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
					<td class="table-label">Sequence</td>
					<td class="table-data">
						<input
							type="number"
							step="1"
							min="0"
							class="input {errors?.Sequence ? 'input-text-error' : ''}"
							name="sequence"
							placeholder="Enter sequence number..."
							bind:value={sequence}
						/>
						{#if errors?.Sequence}
							<p class="text-error">{errors?.Sequence}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Resource Link</td>
					<td class="table-data">
						<input
							type="text"
							class="input {errors?.ResourceLink ? 'input-text-error' : ''}"
							name="resourceLink"
							placeholder="Enter resource link here..."
							bind:value={resourceLink}
						/>
						{#if errors?.ResourceLink}
							<p class="text-error">{errors?.ResourceLink}</p>
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
							bind:this={contentImage}
							onchange={async (e) => await onFileSelected(e)}
						/>
						{#if errorMessage}
							<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
						{/if}
						<input type="hidden" name="imageResourceId" value={imageResourceId} />
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Duration (Minutes)</td>
					<td class="table-data">
						<input
							type="number"
							step="0.01"
							min="0"
							class="input {errors?.DurationInMins ? 'input-text-error' : ''}"
							name="durationInMins"
							placeholder="Enter duration in minutes..."
							bind:value={durationInMins}
						/>
						{#if errors?.DurationInMins}
							<p class="text-error">{errors?.DurationInMins}</p>
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

