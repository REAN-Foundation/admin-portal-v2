import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { z } from "zod";
import { getActiveEnrollments } from "$routes/api/services/lms/enrollments";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
		}

		const tenantId = event.params.tenantId;

		const result = await z
			.object({
				tenantId: z.string().uuid(),
			})
			.safeParseAsync({ tenantId });

		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
			);
			return ResponseHandler.handleError(400, data, new Error("Validation failed"));
		}

		const response = await getActiveEnrollments(sessionId, tenantId);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error fetching tenant active enrollments:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};


