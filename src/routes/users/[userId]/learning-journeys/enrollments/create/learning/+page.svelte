<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/button/button.svelte';
	import SearchDropdown from '$lib/components/search-dropdown.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';

	//////////////////////////////////////////////////////////////////////////////

	let errors: Record<string, string> = $state({});
	let promise = $state();
	let selectedLearningPathId = $state('');
	let selectedLearningPathName = $state('');
	let startDate = $state('');
	let expectedEndDate = $state('');

	const userId = page.params.userId;
	const enrollmentsRoute = `/users/${userId}/learning-journeys/enrollments`;
	const createRoute = `/users/${userId}/learning-journeys/enrollments/create/learning`;

	const breadCrumbs = [
		{ name: 'Enrollments', path: enrollmentsRoute },
		{ name: 'Create Learning Enrollment', path: createRoute }
	];

	const handleLearningPathSelect = (lp: any) => {
		if (lp) {
			selectedLearningPathId = lp.id;
			selectedLearningPathName = lp.Name;
		} else {
			selectedLearningPathId = '';
			selectedLearningPathName = '';
		}
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		if (!selectedLearningPathId) {
			errors.learningPath = 'Please select a learning journey.';
			return;
		}

		const body = {
			StartDate: startDate || undefined,
			ExpectedEndDate: expectedEndDate || undefined
		};

		try {
			const res = await fetch(
				`/api/server/lms/enrollments/users/${userId}/learning-paths/${selectedLearningPathId}`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(body)
				}
			);

			const response = await res.json();
			if (response.HttpCode === 200 || response.HttpCode === 201) {
				toastMessage(response);
				goto(enrollmentsRoute);
				return;
			}

			if (response.Errors) {
				errors = response.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Learning enrollment creation failed:', error);
			toastMessage();
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Learning Enrollment</h2>
			<a href={enrollmentsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Learning Journey <span class="important-field">*</span></td>
					<td class="table-data">
						<SearchDropdown
							placeholder="Search learning journeys..."
							searchUrl="/api/server/lms/learning.journeys/search"
							searchField="name"
							displayField="Name"
							valueField="id"
							bind:selectedValue={selectedLearningPathId}
							bind:selectedDisplay={selectedLearningPathName}
							onSelect={handleLearningPathSelect}
						/>
						{#if errors?.learningPath}
							<p class="error-text">{errors.learningPath}</p>
						{/if}
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Start Date</td>
					<td class="table-data">
						<input
							type="date"
							class="input"
							bind:value={startDate}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<td class="table-label">Expected End Date</td>
					<td class="table-data">
						<input
							type="date"
							class="input"
							bind:value={expectedEndDate}
						/>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="form-actions">
			<Button type="submit" text="Create Enrollment" variant="primary" />
			<a href={enrollmentsRoute} class="secondary-btn"></a>
		</div>
	</form>
</div>

