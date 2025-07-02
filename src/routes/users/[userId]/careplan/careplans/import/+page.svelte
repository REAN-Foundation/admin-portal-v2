<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';

	///////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	let fileinput = $state();
	let fileName = $state(undefined);
	let selectFile = $state(undefined);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const importRoute = `/users/${userId}/careplan/careplans/import`;
	const careplanRoute = `/users/${userId}/careplan/careplans`;

	const breadCrumbs = [
		{ name: 'Careplans', path: careplanRoute },
		{ name: 'Import', path: importRoute }
	];

	const upload = async (imgBase64, file) => {
		const data = {};

		const imgData = imgBase64.split(',');
		data['image'] = imgData[1];

		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch(`/api/server/file-resources/upload/careplan`, {
			method: 'POST',
			body: formData
		});

		const response = await res.json();

		if (response.Status === 'success' && response.HttpCode === 200) {
			return { success: true, resourceId: response.Data?.id, response };
		}
		if (response.Errors) {
			errors = response?.Errors || {};

			return response;
		} else {
			return { success: false, error: response.Message };
		}
	};

	const onFileSelected = async (e) => {
		let f = e.target.files[0];
		if (!f) return;
		if (f.size === 0) {
			errors = { UploadFile: 'Selected file is empty. Please choose a valid file.' };

			return;
		}

		const isJson =
			f.name.toLowerCase().endsWith('.json') &&
			(f.type === 'application/json' || f.type === '' || f.type === 'text/json');
		if (!isJson) {
			errors = { UploadFile: 'Only JSON files are allowed. Please select a valid .json file.' };
			return;
		}
		fileName = f.name;
		selectFile = f;
		let reader = new FileReader();
		reader.readAsDataURL(f);
		reader.onload = async (e) => {
			fileinput = e.target.result;
		};
	};

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			if (!selectFile || selectFile.size === 0) {
				errors = { UploadFile: 'Selected file is empty. Please choose a valid file.' };
				return;
			}

			const uploadResult = await upload(fileinput, selectFile);

			if (uploadResult.response.HttpCode === 201 || uploadResult.response.HttpCode === 200) {
				toastMessage(uploadResult.response);
				goto(`${careplanRoute}/`);
				return;
			}

			if (uploadResult.response.Errors) {
				errors = uploadResult?.response.Errors || {};
			} else {
				toastMessage(uploadResult.response);
			}
		} catch (error) {
			toastMessage();
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Import template</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<div class="flex items-center space-x-4">
									<label class="health-system-btn variant-filled-secondary">
										Select File
										<input type="file" class="hidden" onchange={onFileSelected} />
									</label>

									<input
										type="text"
										class="health-system-input bg-gray-100 text-gray-700 focus:outline-none"
										value={fileName}
										readonly
										placeholder="No file selected"
									/>
								</div>

								<!-- Validation Error -->
								{#if errors?.UploadFile}
									<p class="text-error">{errors?.UploadFile}</p>
								{/if}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
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
