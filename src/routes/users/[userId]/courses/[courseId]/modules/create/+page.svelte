<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Image from '$lib/components/image.svelte';
	import { createOrUpdateSchema } from '$lib/validation/lms/modules.schema.js';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import type { ModuleCreateModel } from '$lib/types/lms/modules.js';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/button.svelte';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';

	///////////////////////////////////////////////////////////////////////////

	let { data } = $props();

	let errors: Record<string, string> = $state({});
	let moduleName = $state(undefined);
	let description = $state(undefined);
	let durationInMins = $state(undefined);
	let sequence = $state(undefined);
	let promise = $state();
	let imageResourceId = $state(undefined);
	let fileName = $state('');
	const formData = new FormData();
	let moduleImage;
	let previewUrl = $state<string | undefined>(undefined);
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};

	data.title = 'Educational-Learning Journey-Courses-Modules Create';
	const userId = page.params.userId;
	const courseId = page.params.courseId;
	const createRoute = `/users/${userId}/courses/${courseId}/modules/create`;
	const courseRoute = `/users/${userId}/courses`;
	const modulesRoute = `/users/${userId}/courses/${courseId}/modules`;

	const breadCrumbs = [
		{ name: 'Courses', path: courseRoute },
		{ name: 'Modules', path: modulesRoute },
		{ name: 'Create', path: createRoute }
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

			const moduleCreateModel: ModuleCreateModel = {
				Name: moduleName,
				Description: description,
				DurationInMins: durationInMins ? parseFloat(durationInMins) : undefined,
				ImageUrl: imageResourceId,
				Sequence: sequence ? parseFloat(sequence) : undefined,
				CourseId: courseId // Include courseId from URL params
			};

			const validationResult = createOrUpdateSchema.safeParse(moduleCreateModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/educational/modules`, {
				method: 'POST',
				body: JSON.stringify(moduleCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log("Create module response:", response);

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					previewUrl = undefined;
				}
				toastMessage(response);
				const moduleId = response?.Data?.id;
				console.log("Extracted moduleId:", moduleId);
				if (moduleId) {
					goto(`${modulesRoute}/${moduleId}/view`);
				} else {
					console.warn("Module ID not found in response, redirecting to modules list");
					goto(modulesRoute);
				}
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
			<h2 class="form-titles">Create Module</h2>
			<a href={modulesRoute} class="form-cancel-btn">
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
						{#if previewUrl}
							<Image cls="flex h-24 w-24 rounded-lg mb-2" source={previewUrl} w="24" h="24" />
						{/if}
						<input
							name="fileinput"
							type="file"
							accept="image/*"
							class="input"
							placeholder="Image"
							bind:this={moduleImage}
							onchange={async (e) => await onFileSelected(e)}
						/>
						{#if errorMessage}
							<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
						{/if}
						<input type="hidden" name="imageResourceId" value={imageResourceId} />
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
			{#await promise}
				<Button type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>

