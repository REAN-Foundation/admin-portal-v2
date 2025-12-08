import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import type { LearningPathCreateModel } from "$lib/types/lms/learning.journey";
import { createOrUpdateSchema } from "$lib/validation/lms/learning.journey.schema";
import { createLearningPath } from "$routes/api/services/lms/learning.journeys";

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside learning path server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: LearningPathCreateModel = await request.json();

        console.log("data", data);
        const validationResult = createOrUpdateSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await createLearningPath(
            sessionId,
            data.TenantId,
            data.Name,
            data.Description,
            data.ImageUrl,
            data.DurationInDays,
            data.PreferenceWeight,
            data.Enabled,
            data.CourseIds
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating learning path:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

