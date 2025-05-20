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
								<input type="file" name="name" required class="health-system-input" />
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
