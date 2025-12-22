<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { PageServerData } from './$types';

	///////////////////////////////////////////////////////////////////////////////

	const props = $props<{ data?: PageServerData | null }>();
	const data = props.data ?? null;

	const adminUserId = page.params.userId;
	const learnerId = page.params.learnerId;

	const baseRoute = `/users/${adminUserId}/learning-journeys/enrollments`;
	const learnerRoute = `${baseRoute}/user/${learnerId}`;

	const breadCrumbs = [
		{ name: 'Enrollments', path: baseRoute },
		{ name: 'Learner', path: learnerRoute }
	];

	const learnerData = data?.learner?.Data ?? data?.learner ?? null;
	const learnerName =
		`${learnerData?.FirstName ?? ''} ${learnerData?.LastName ?? ''}`.trim() ||
		learnerData?.FullName ||
		learnerData?.Email ||
		learnerId;

	const enrollmentsPayload = data?.activeEnrollments?.Data ?? data?.activeEnrollments ?? null;

	const courseEnrollments: any[] =
		enrollmentsPayload?.CourseEnrollments?.Items ??
		enrollmentsPayload?.CourseEnrollments ??
		enrollmentsPayload?.CourseEnrollmentRecords?.Items ??
		enrollmentsPayload?.CourseEnrollmentRecords ??
		[];
	const learningEnrollments: any[] =
		enrollmentsPayload?.LearningPathEnrollments?.Items ??
		enrollmentsPayload?.LearningPathEnrollments ??
		enrollmentsPayload?.LearningPathEnrollmentRecords?.Items ??
		enrollmentsPayload?.LearningPathEnrollmentRecords ??
		[];

	const courseProgressById: Record<string, any> = data?.courseProgressById ?? {};
	const learningPathProgressById: Record<string, any> = data?.learningPathProgressById ?? {};

	let activeTab = $state<'courses' | 'learning'>('courses');

	const progressPercentFrom = (x: any) =>
		Math.max(
			0,
			Math.min(
				100,
				Math.round(
					x?.ProgressPercent ?? x?.CompletionPercent ?? x?.Percentage ?? x?.Progress ?? 0
				)
			)
		);

	const viewCourseRoute = (courseId: string) =>
		`${learnerRoute}/courses/${courseId}`;
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 pb-8">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<div class="text-sm font-semibold text-gray-800">Learner Enrollments</div>
			<div class="text-xs text-gray-500">{learnerName}</div>
		</div>
	</div>

	<div class="mb-4 mt-3 flex flex-wrap gap-3">
		<button
			type="button"
			class={`min-w-[140px] rounded-md border px-4 py-2 text-center text-sm font-semibold shadow ${
				activeTab === 'courses'
					? 'border-[#2ea3f2] bg-[#2ea3f2] text-white'
					: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
			}`}
			onclick={() => (activeTab = 'courses')}
		>
			Courses ({courseEnrollments?.length ?? 0})
		</button>
		<button
			type="button"
			class={`min-w-[140px] rounded-md border px-4 py-2 text-center text-sm font-semibold shadow ${
				activeTab === 'learning'
					? 'border-[#2ea3f2] bg-[#2ea3f2] text-white'
					: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
			}`}
			onclick={() => (activeTab = 'learning')}
		>
			Learning Journeys ({learningEnrollments?.length ?? 0})
		</button>
	</div>

	{#if activeTab === 'courses'}
		{#if !courseEnrollments || courseEnrollments.length === 0}
			<div class="rounded-md border bg-white p-4 text-sm text-gray-600">No courses found</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
				{#each courseEnrollments as enrollment (enrollment.id)}
					{@const courseId = enrollment?.CourseId ?? enrollment?.Course?.id ?? enrollment?.Course?.Id}
					{@const course = enrollment?.Course ?? enrollment}
					{@const progressObj = courseId ? (courseProgressById[courseId]?.Data ?? courseProgressById[courseId]) : null}
					{@const pct = progressPercentFrom(progressObj ?? course)}
					<div class="rounded-xl border bg-white shadow-sm">
						<div class="h-28 rounded-t-xl bg-gradient-to-r from-sky-400 to-cyan-400"></div>
						<div class="p-4">
							<div class="mb-2 text-sm font-semibold text-gray-700">{pct}% Completed</div>
							<div class="mb-3 text-lg font-semibold text-gray-900">
								{course?.Name || course?.name || 'Not specified'}
							</div>

							<div class="mb-4 h-2 w-full rounded bg-gray-200">
								<div class="h-2 rounded bg-blue-600" style={`width:${pct}%`}></div>
							</div>

							<div class="flex items-center justify-between gap-2">
								<div class="text-xs text-gray-500">
									{#if pct >= 100}
										Course completed
									{:else if pct > 0}
										In progress
									{:else}
										Not started
									{/if}
								</div>
								{#if courseId}
									<Button href={viewCourseRoute(courseId)} text="View Course" variant="primary" size="sm" />
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		{#if !learningEnrollments || learningEnrollments.length === 0}
			<div class="rounded-md border bg-white p-4 text-sm text-gray-600">
				No learning journeys found
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
				{#each learningEnrollments as enrollment (enrollment.id)}
					{@const learningPathId = enrollment?.LearningPathId ?? enrollment?.LearningPath?.id ?? enrollment?.LearningPath?.Id}
					{@const lp = enrollment?.LearningPath ?? enrollment}
					{@const progressObj = learningPathId ? (learningPathProgressById[learningPathId]?.Data ?? learningPathProgressById[learningPathId]) : null}
					{@const pct = progressPercentFrom(progressObj ?? lp)}
					<div class="rounded-xl border bg-white shadow-sm">
						<div class="h-28 rounded-t-xl bg-gradient-to-r from-fuchsia-400 to-rose-400"></div>
						<div class="p-4">
							<div class="mb-2 text-sm font-semibold text-gray-700">{pct}% Completed</div>
							<div class="mb-3 text-lg font-semibold text-gray-900">
								{lp?.Name || lp?.name || 'Not specified'}
							</div>

							<div class="mb-4 h-2 w-full rounded bg-gray-200">
								<div class="h-2 rounded bg-green-600" style={`width:${pct}%`}></div>
							</div>

							<div class="text-xs text-gray-500">
								{#if pct >= 100}
									Learning journey completed
								{:else if pct > 0}
									In progress
								{:else}
									Not started
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>


