import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchEnrollments } from "$routes/api/services/lms/enrollments";
import { getUserById } from "$routes/api/services/reancare/user";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const searchParams = event.url.searchParams;
		const additionalFilters: Record<string, any> = {
			userId: searchParams.get("userId") ?? undefined,
			tenantId: searchParams.get("tenantId") ?? undefined,
			courseId: searchParams.get("courseId") ?? undefined,
			learningPathId: searchParams.get("learningPathId") ?? undefined,
			courseName: searchParams.get("courseName") ?? undefined,
			learningPathName: searchParams.get("learningPathName") ?? undefined,
			displayId: searchParams.get("displayId") ?? undefined,
			startDate: searchParams.get("startDate") ?? undefined,
			endDate: searchParams.get("endDate") ?? undefined,
			isActive: searchParams.get("isActive") ?? undefined
		};
		
		const orderBy = searchParams.get("orderBy");
		const order = searchParams.get("order");
		if (orderBy) additionalFilters.orderBy = orderBy;
		if (order) additionalFilters.order = order;
		
		const searchFilters = createSearchFilters(event, additionalFilters);
		
		const response = await searchEnrollments(sessionId, searchFilters);
		try {
			const courseItems: any[] = response?.Data?.CourseEnrollments?.Items ?? [];
			const learningItems: any[] = response?.Data?.LearningPathEnrollments?.Items ?? [];
			const userIds = Array.from(
				new Set(
					[...courseItems, ...learningItems]
						.map((e: any) => e?.UserId ?? e?.User?.id ?? e?.User?.UserId)
						.filter(Boolean)
				)
			);

			const userMap = new Map<string, any>();
			await Promise.all(
				userIds.map(async (id: string) => {
					try {
						const u = await getUserById(sessionId, id);
						// getUserById() returns { Data: { user: ... } } in this codebase.
						userMap.set(id, u?.Data?.user ?? u?.Data ?? u);
					} catch {
						// ignore individual failures
					}
				})
			);

			const attach = (enrollment: any) => {
				const id = enrollment?.UserId ?? enrollment?.User?.id ?? enrollment?.User?.UserId;
				const u = id ? userMap.get(id) : null;
				if (!u) return enrollment;
				const firstName = u?.FirstName ?? u?.firstName ?? u?.Person?.FirstName ?? '';
				const lastName = u?.LastName ?? u?.lastName ?? u?.Person?.LastName ?? '';
				const fullName =
					u?.Person?.DisplayName ??
					u?.Person?.FullName ??
					`${firstName} ${lastName}`.trim();
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

			if (response?.Data?.CourseEnrollments?.Items) {
				response.Data.CourseEnrollments.Items = response.Data.CourseEnrollments.Items.map(attach);
			}
			if (response?.Data?.LearningPathEnrollments?.Items) {
				response.Data.LearningPathEnrollments.Items =
					response.Data.LearningPathEnrollments.Items.map(attach);
			}
		} catch (e) {
			console.warn("Enrollment user enrichment failed (non-blocking):", e);
		}
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error retrieving enrollments:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

