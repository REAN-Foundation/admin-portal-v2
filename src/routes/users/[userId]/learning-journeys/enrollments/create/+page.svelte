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
	let selectedCourseId = $state('');
	let selectedCourseName = $state('');
	let startDate = $state('');
	let expectedEndDate = $state('');

	const userId = page.params.userId;
	const enrollmentsRoute = `/users/${userId}/learning-journeys/enrollments`;
	const createRoute = `/users/${userId}/learning-journeys/enrollments/create`;

	const breadCrumbs = [
		{ name: 'Enrollments', path: enrollmentsRoute },
		{ name: 'Create', path: createRoute }
	];

	const handleCourseSelect = (course: any) => {
		if (course) {
			selectedCourseId = course.id;
			selectedCourseName = course.Name;
		} else {
			selectedCourseId = '';
			selectedCourseName = '';
		}
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		errors = {};

		if (!selectedCourseId) {
			errors.course = 'Please select a course.';
			return;
		}

		// Build body object, only including fields that have values
		const body: Record<string, string> = {};
		if (startDate) {
			body.StartDate = startDate;
		}
		if (expectedEndDate) {
			body.ExpectedEndDate = expectedEndDate;
		}

		try {
			const res = await fetch(
				`/api/server/lms/enrollments/users/${userId}/courses/${selectedCourseId}`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(body)
				}
			);

			const response = await res.json();
			console.log('Enrollment response:', response);
			
			if (response.HttpCode === 200 || response.HttpCode === 201) {
				toastMessage(response);
				goto(enrollmentsRoute);
				return;
			}

			// Handle authorization errors specifically
			if (response.Message && response.Message.includes('not allowed')) {
				toastMessage({
					HttpCode: response.HttpCode || 403,
					Message: response.Message || 'You are not authorized to enroll this user.',
					Status: 'failure'
				});
				return;
			}

			if (response.Errors) {
				errors = response.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Enrollment creation failed:', error);
			toastMessage({
				HttpCode: 500,
				Message: 'Failed to create enrollment. Please try again.',
				Status: 'failure'
			});
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create Enrollment</h2>
			<a href={enrollmentsRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">Course <span class="important-field">*</span></td>
					<td class="table-data">
						<SearchDropdown
							placeholder="Search courses..."
							searchUrl="/api/server/lms/courses/search"
							searchField="name"
							displayField="Name"
							valueField="id"
							bind:selectedValue={selectedCourseId}
							bind:selectedDisplay={selectedCourseName}
							onSelect={handleCourseSelect}
						/>
						{#if errors?.course}
							<p class="error-text">{errors.course}</p>
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
			<a href={enrollmentsRoute} class="secondary-btn">Cancel</a>
		</div>
	</form>
</div>

