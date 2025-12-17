import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { enrollToLearningPath } from "$routes/api/services/lms/enrollments";

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside enrollment server POST endpoint - enrollToLearningPath");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const userId = event.params.userId;
		const learningPathId = event.params.learningPathId;

		const paramsResult = await z.object({
			userId: z.string().uuid(),
			learningPathId: z.string().uuid()
		}).safeParseAsync({ userId, learningPathId });

		if (!paramsResult.success) {
			const data = Object.fromEntries(
				Object.entries(paramsResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
			);
			return ResponseHandler.handleError(400, data, new Error("Validation failed"));
		}

		const response = await enrollToLearningPath(
			sessionId,
			userId,
			learningPathId,
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error enrolling to learning path:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

