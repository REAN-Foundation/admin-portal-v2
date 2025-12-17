import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { getUserActiveEnrollments } from "$routes/api/services/lms/enrollments";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
		}

		const userId = event.params.userId;

		const result = await z.object({
			userId: z.string().uuid()
		}).safeParseAsync({ userId });

		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
			);
			return ResponseHandler.handleError(400, data, new Error("Validation failed"));
		}

		const response = await getUserActiveEnrollments(sessionId, userId);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error fetching user active enrollments:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

