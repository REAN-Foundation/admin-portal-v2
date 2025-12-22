import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getUserActiveEnrollments } from '$routes/api/services/lms/enrollments';
import {
	getCourseCompletionState,
	getLearningPathCompletionState
} from '$routes/api/services/lms/user-learnings';
import { getUserById } from '$routes/api/services/reancare/user';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const sessionUser = event.locals?.sessionUser ?? null;
	const learnerId = event.params.learnerId;
	event.depends('app:learning-journey');
	event.depends('app:enrollment');
	event.depends('app:user-learning');

	// Defaults (match other +page.server files structure)
	let learner: any = null;
	let activeEnrollments: any = { CourseEnrollments: [], LearningPathEnrollments: [] };
	const courseProgressById: Record<string, any> = {};
	const learningPathProgressById: Record<string, any> = {};

	if (sessionId && learnerId) {
		const [learnerRes, enrollmentsRes] = await Promise.allSettled([
			getUserById(sessionId, learnerId),
			getUserActiveEnrollments(sessionId, learnerId)
		]);

		if (learnerRes.status === 'fulfilled') {
			learner = learnerRes.value;
		}

		if (enrollmentsRes.status === 'fulfilled') {
			activeEnrollments =
				enrollmentsRes.value?.Data ??
				enrollmentsRes.value ??
				{ CourseEnrollments: [], LearningPathEnrollments: [] };
		}

		const courseItems: any[] = activeEnrollments?.CourseEnrollments ?? [];
		const learningItems: any[] = activeEnrollments?.LearningPathEnrollments ?? [];

		// Pull completion/progress per enrolled entity so the cards can show %.
		const progressTasks: Array<Promise<void>> = [];

		for (const e of courseItems.slice(0, 50)) {
			const courseId =
				e?.CourseId ?? e?.Course?.id ?? e?.Course?.CourseId ?? e?.Course?.Id ?? e?.Course?.courseId;
			if (!courseId) continue;
			progressTasks.push(
				(async () => {
					const r = await getCourseCompletionState(sessionId, learnerId, courseId);
					courseProgressById[courseId] = r;
				})()
			);
		}

		for (const e of learningItems.slice(0, 50)) {
			const learningPathId =
				e?.LearningPathId ??
				e?.LearningPath?.id ??
				e?.LearningPath?.LearningPathId ??
				e?.LearningPath?.Id ??
				e?.LearningPath?.learningPathId;
			if (!learningPathId) continue;
			progressTasks.push(
				(async () => {
					const r = await getLearningPathCompletionState(sessionId, learnerId, learningPathId);
					learningPathProgressById[learningPathId] = r;
				})()
			);
		}

		// Don't fail the whole page if a few progress calls fail.
		await Promise.allSettled(progressTasks);
	}

	return {
		sessionUser,
		sessionId,
		learnerId,
		learner,
		activeEnrollments,
		courseProgressById,
		learningPathProgressById,
		title: 'Educational-Learning Journey-Learner Enrollments'
	};
};
