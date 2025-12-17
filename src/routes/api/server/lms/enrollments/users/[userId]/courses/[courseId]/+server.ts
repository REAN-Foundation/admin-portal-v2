import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import type { EnrollToCourseModel } from "$lib/types/lms/enrollment";
import { enrollToCourseSchema } from "$lib/validation/lms/enroll.course.schema";
import { enrollToCourse } from "$routes/api/services/lms/enrollments";

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside enrollment server POST endpoint - enrollToCourse");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const userId = event.params.userId;
		const courseId = event.params.courseId;

		const paramsResult = await z.object({
			userId: z.string().uuid(),
			courseId: z.string().uuid()
		}).safeParseAsync({ userId, courseId });

		if (!paramsResult.success) {
			const data = Object.fromEntries(
				Object.entries(paramsResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
			);
			return ResponseHandler.handleError(400, data, new Error("Validation failed"));
		}

		const request = event.request;
		const data: EnrollToCourseModel = await request.json();
		data.UserId = userId;
		data.CourseId = courseId;

		console.log("data", data);
		const validationResult = enrollToCourseSchema.safeParse(data);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
			});
		}

		const response = await enrollToCourse(
			sessionId,
			userId,
			courseId,
			data.StartDate,
			data.ExpectedEndDate,
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error enrolling to course:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

