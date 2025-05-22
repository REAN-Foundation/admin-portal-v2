<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';

	///////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;

	const importRoute = `/users/${userId}/assessment-templates/import`;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'Import', path: importRoute }
	];

	let assessmentTemplateFile;

	let templateUrlId = $state(undefined);
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'border-b-surface-700'
	};
	const MAX_FILE_SIZE = 1024 * 150;

	const onFileSelected = async (e) => {
		let file = e.target.files[0];
		const fileSize = file.size;
		if (fileSize > MAX_FILE_SIZE) {
			errorMessage.Text = 'File should be less than 150 KB';
			errorMessage.Colour = 'text-error-500';
			assessmentTemplateFile.value = null;
			return;
		}

		errorMessage.Text = 'Please wait, file upload is in progress';
		errorMessage.Colour = 'text-error-500';

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', file.name);

		try {
			const res = await fetch(`/api/server/assessments/assessment-template/import`, {

				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText);
			}

			const response = await res.json();

			if (response.Status === 'success' && response.HttpCode === 201) {
				const templateUrl = response.Data.FileResources[0].url;
				
				const templateUrlId_ = response.Data.FileResources[0].id;
				
				if (templateUrlId_) {
					templateUrlId = templateUrlId_;
					errorMessage.Text = 'File uploaded successfully';
					errorMessage.Colour = 'text-success-500';
					return true;
				}
				
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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/importAssessment" use:enhance enctype="multipart/form-data">
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Import assessment template</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="text-center">
								<!-- <input type="file" name="name" required class="health-system-input" /> -->
								<input
								name="assessmentTemplateFile"
								type="file"
								class="true health-system-input"
								placeholder="Select file"
								bind:this={assessmentTemplateFile}
								onchange={async (e) => await onFileSelected(e)}
							/>
							{#if errorMessage}
								<p class={`${errorMessage.Colour}`}>{errorMessage.Text}</p>
							{/if}
							<input type="hidden" name="assessmentTemplateFile" value={assessmentTemplateFile} />
							</td>
						</tr>

						<!-- <tr>
							<td class="text-center">
								<button type="submit" class="health-system-btn variant-soft-secondary">Upload</button>
							</td>
						</tr> -->
					</tbody>
				</table>
				<div class="button-container">
					<button type="submit" class="health-system-btn variant-soft-secondary">Upload</button>
				</div>
			</form>
		</div>
	</div>
</div>

<!-- <form method="post" 
    action="?/importAssessment"
    use:enhance enctype="multipart/form-data"
	>
    <div>
      <label for="file">Import Assessment template</label>
      <input type="file" 
      name="name" 
      required  
      class="true input w-full"
    />
	  <button type="submit" class="btn variant-filled-secondary">Upload</button>
	  
    </div>
</form> -->
