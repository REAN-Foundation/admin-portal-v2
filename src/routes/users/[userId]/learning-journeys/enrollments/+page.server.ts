import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchEnrollments } from '$routes/api/services/lms/enrollments';
import { getUserById } from '$routes/api/services/reancare/user';

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

			// Enrich with user names for initial render (avoid showing only UUIDs).
			try {
				const courseItems: any[] = tenantCourseEnrollments?.Items ?? [];
				const learningItems: any[] = tenantLearningPathEnrollments?.Items ?? [];
				const userIds = Array.from(
					new Set(
						[...courseItems, ...learningItems]
							.map((e: any) => e?.UserId ?? e?.User?.id ?? e?.User?.UserId)
							.filter(Boolean)
					)
				);

				const userMap = new Map<string, any>();
				const results = await Promise.allSettled(userIds.map((id: string) => getUserById(sessionId, id)));
				for (let idx = 0; idx < userIds.length; idx++) {
					const res = results[idx];
					if (res.status === 'fulfilled') userMap.set(userIds[idx], res.value?.Data?.user ?? res.value?.Data ?? res.value);
				}

				const attach = (enrollment: any) => {
					const id = enrollment?.UserId ?? enrollment?.User?.id ?? enrollment?.User?.UserId;
					const u = id ? userMap.get(id) : null;
					if (!u) return enrollment;
					const firstName = u?.FirstName ?? u?.Person?.FirstName ?? '';
					const lastName = u?.LastName ?? u?.Person?.LastName ?? '';
					const fullName = u?.Person?.DisplayName ?? `${firstName} ${lastName}`.trim();
					enrollment.User = {
						...(enrollment.User ?? {}),
						id,
						FirstName: firstName,
						LastName: lastName,
						Person: u?.Person ?? enrollment?.User?.Person,
						FullName: fullName || enrollment?.User?.FullName || enrollment?.User?.Name || enrollment?.User?.Email
					};
					return enrollment;
				};

				if (tenantCourseEnrollments?.Items) {
					tenantCourseEnrollments.Items = tenantCourseEnrollments.Items.map(attach);
				}
				if (tenantLearningPathEnrollments?.Items) {
					tenantLearningPathEnrollments.Items = tenantLearningPathEnrollments.Items.map(attach);
				}
			} catch {
				// non-blocking
			}
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

