<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import { showMessage } from '$lib/utils/message.utils';

	///////////////////////////////////////////////////////////////////////////////////////

	const userId = page.params.userId;
	let fileinput = $state();
	let fileName = $state(undefined);
	let selectFile = $state(undefined);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const importRoute = `/users/${userId}/assessment-templates/import`;
	const assessmentsRoutes = `/users/${userId}/assessment-templates`;

	const breadCrumbs = [
		{ name: 'Assessments', path: assessmentsRoutes },
		{ name: 'Import', path: importRoute }
	];

	const upload = async (imgBase64, file) => {
		const data = {};
		// console.log(imgBase64);

		const imgData = imgBase64.split(',');
		data['image'] = imgData[1];

		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch(`/api/server/assessments/assessment-templates/upload`, {
			method: 'POST',
			body: formData
		});

		const response = await res.json();
		console.log('response from api endpoint', response);

		if (response.Status === 'success' && response.HttpCode === 201) {
			toastMessage(response);
		}
		if (response.HttpCode === 400 && response.Message) {
			errors = response?.Errors || {};
			toastMessage(response);
		}
	};

	const onFileSelected = async (e) => {
		let f = e.target.files[0];
		fileName = f.name;
		selectFile = f;
		let reader = new FileReader();
		reader.readAsDataURL(f);
		reader.onload = async (e) => {
			fileinput = e.target.result;
		};
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		const uploadResult = await upload(fileinput, selectFile);
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
							Uploading...
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Upload </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>
