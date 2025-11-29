<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import type { PageServerData } from './$types';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { ModuleUpdateModel } from '$lib/types/lms/modules';
	import { createOrUpdateSchema } from '$lib/validation/lms/modules.schema';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema';

	///////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let moduleName = $state(data.module?.Name || '');
	let description = $state(data.module?.Description || undefined) ;
	let imageUrl = $state(data.module?.ImageUrl ?? undefined);
	let imageResourceId = $state(data.module?.ImageResourceId ?? undefined);
	let moduleImage = $state();
	let durationInMins = $state(data.module?.DurationInMins != null ? data.module.DurationInMins.toString() : '');
	let sequence = $state(data.module?.Sequence != null ? data.module.Sequence.toString() : '');
	let errors: Record<string, string> = $state({});
	let promise = $state();
	let previewUrl = $state<string | undefined>(undefined);

	const userId = page.params.userId;
	const courseId = page.params.courseId;
	var moduleId = page.params.moduleId;

	const editRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/edit`;
	const viewRoute = `/users/${userId}/courses/${courseId}/modules/${moduleId}/view`;
	const modulesRoute = `/users/${userId}/courses/${courseId}/modules`;
	const courseRoute = `/users/${userId}/courses`;

	const breadCrumbs = [
		{ name: 'Courses', path: courseRoute },
		{ name: 'Modules', path: modulesRoute },
		{ name: 'Edit', path: editRoute }
	];

	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};	

	const handleReset = () => {
		moduleId = page.params.moduleId;
		moduleName = data?.module?.Name || '';
		description = data?.module?.Description || undefined;
		imageUrl = data?.module?.ImageUrl || undefined;
		imageResourceId = data?.module?.ImageResourceId || undefined;
		durationInMins = data?.module?.DurationInMins != null ? data.module.DurationInMins.toString() : '';
		sequence = data?.module?.Sequence != null ? data.module.Sequence.toString() : '';
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

			const moduleUpdateModel: ModuleUpdateModel = {
				Name: moduleName,
				Description: description,
				DurationInMins: durationInMins ? parseFloat(durationInMins) : undefined,
				ImageUrl: imageResourceId,
				Sequence: sequence ? parseFloat(sequence) : undefined
			};

			const validationResult = createOrUpdateSchema.safeParse(moduleUpdateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/lms/modules/${moduleId}`, {
				method: 'PUT',
				body: JSON.stringify(moduleUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					previewUrl = undefined;
				}
				toastMessage(response);
				const updatedModuleId = response?.Data?.CourseModule?.id || moduleId;
				goto(`${modulesRoute}/${updatedModuleId}/view`);
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
			<h2 class="form-titles">Edit Module</h2>
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
							name="moduleName"
							placeholder="Enter name here..."
							bind:value={moduleName}
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
				<tr class="tables-row">
					<td class="table-label">Image</td>
					<td class="table-data">
						{#if imageUrl == undefined || imageUrl == null}
							<input
								name="fileinput"
								type="file"
								required
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
								bind:this={moduleImage}
								placeholder="Image"
								onchange={async (e) => await onFileSelected(e)}
							/>
							{#if errorMessage}
								<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
							{/if}
						{/if}
						<input type="hidden" name="imageUrl" value={imageUrl} />
						{#if errors?.ImageUrl}
							<p class="text-error">{errors?.ImageUrl}</p>
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
							placeholder="Enter sequence..."
							bind:value={sequence}
						/>
						{#if errors?.Sequence}
							<p class="text-error">{errors?.Sequence}</p>
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

