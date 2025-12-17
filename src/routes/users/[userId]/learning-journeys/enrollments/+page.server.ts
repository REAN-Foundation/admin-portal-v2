import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchEnrollments } from '$routes/api/services/lms/enrollments';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const sessionUser = event.locals?.sessionUser ?? null;
	const tenantId = event.locals?.sessionUser?.tenantId ?? null;
	event.depends('app:learning-journey');

	// Tenant active enrollments (across tenant's users)
	let tenantCourseEnrollments: any = { Items: [], TotalCount: 0 };
	let tenantLearningPathEnrollments: any = { Items: [], TotalCount: 0 };
	if (tenantId) {
		try {
			const tenantSearchFilters = {
				tenantId: tenantId,
				order: 'descending',
				orderBy: 'CreatedAt',
				itemsPerPage: 25,
				pageIndex: 0
			};
			const tenantResponse = await searchEnrollments(sessionId, tenantSearchFilters);
			tenantCourseEnrollments = tenantResponse?.Data?.CourseEnrollments ?? { Items: [], TotalCount: 0 };
			tenantLearningPathEnrollments =
				tenantResponse?.Data?.LearningPathEnrollments ?? { Items: [], TotalCount: 0 };
		} catch (e) {
			tenantCourseEnrollments = { Items: [], TotalCount: 0 };
			tenantLearningPathEnrollments = { Items: [], TotalCount: 0 };
		}
	}

    return {
		tenantCourseEnrollments,
		tenantLearningPathEnrollments,
		sessionUser,
        sessionId,
        title:'Educational-Learning Journey'
    };
		
};

