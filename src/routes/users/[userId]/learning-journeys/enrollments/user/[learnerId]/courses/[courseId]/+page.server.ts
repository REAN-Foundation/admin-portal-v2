import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getCourseById } from '$routes/api/services/lms/courses';
import { searchModules } from '$routes/api/services/lms/course.modules';
import { searchContents } from '$routes/api/services/lms/course.contents';
import { getCourseCompletionState, getModuleCompletionState } from '$routes/api/services/lms/user-learnings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const sessionUser = event.locals?.sessionUser ?? null;
	const tenantId = event.locals?.sessionUser?.tenantId ?? null;
	const roleName = event.locals?.sessionUser?.roleName ?? null;
	const learnerId = event.params.learnerId;
	const courseId = event.params.courseId;

	let course: any = null;
	let courseCompletion: any = null;
	let modules: any[] = [];
	const moduleCompletion: Record<string, any> = {};
	const moduleContentCounts: Record<string, number> = {};

	if (sessionId && learnerId && courseId) {
		const isSystemAdminUser = roleName === 'System admin' || roleName === 'System user';

		const [courseResult, courseCompletionResult] = await Promise.allSettled([
			getCourseById(sessionId, courseId),
			getCourseCompletionState(sessionId, learnerId, courseId)
		]);

		course =
			courseResult.status === 'fulfilled' ? (courseResult.value?.Data ?? courseResult.value) : null;
		courseCompletion =
			courseCompletionResult.status === 'fulfilled' ? courseCompletionResult.value : null;

		const nestedModulesForCourse = (course?.Modules || course?.modules || []).filter(
			(module: any) => module?.CourseId === courseId || module?.courseId === courseId
		);

		if (nestedModulesForCourse.length) {
			modules = nestedModulesForCourse;
		} else {
			const moduleSearchResults = await Promise.allSettled([
				searchModules(sessionId, {
					courseId,
					tenantId: !isSystemAdminUser ? tenantId : undefined,
					itemsPerPage: 200,
					pageIndex: 0,
					orderBy: 'Name',
					order: 'ascending'
				})
			]);

			if (moduleSearchResults[0].status === 'fulfilled') {
				const moduleRecords = (moduleSearchResults[0].value as any)?.Data?.CourseModuleRecords;
				const moduleList = moduleRecords?.Items ?? (Array.isArray(moduleRecords) ? moduleRecords : []);
				modules = (moduleList ?? []).filter(
					(module: any) => module?.CourseId === courseId || module?.courseId === courseId
				);
			}
		}

		const perModuleRequests: Promise<any>[] = [];
		for (const module of modules) {
			const moduleId = module?.id ?? module?.Id ?? module?.ModuleId ?? module?.CourseModuleId;
			if (!moduleId) continue;

			perModuleRequests.push(getModuleCompletionState(sessionId, learnerId, moduleId));
			perModuleRequests.push(
				searchContents(sessionId, {
					courseModuleId: moduleId,
					tenantId: !isSystemAdminUser ? tenantId : undefined,
					itemsPerPage: 1,
					pageIndex: 0,
					orderBy: 'Title',
					order: 'ascending'
				})
			);
		}

		const perModuleResults = await Promise.allSettled(perModuleRequests);
		let resultIndex = 0;
		for (const module of modules) {
			const moduleId = module?.id ?? module?.Id ?? module?.ModuleId ?? module?.CourseModuleId;
			if (!moduleId) continue;

			const completionResult = perModuleResults[resultIndex++];
			if (completionResult?.status === 'fulfilled') moduleCompletion[moduleId] = completionResult.value;

			const contentCountResult = perModuleResults[resultIndex++];
			if (contentCountResult?.status === 'fulfilled') {
				moduleContentCounts[moduleId] =
					(contentCountResult.value as any)?.Data?.CourseContentRecords?.TotalCount ?? 0;
			}
		}
	}

	return {
		sessionUser,
		learnerId,
		courseId,
		course,
		courseCompletion,
		modules,
		moduleCompletion,
		moduleContentCounts,
		title: 'Course Progress'
	};
};


