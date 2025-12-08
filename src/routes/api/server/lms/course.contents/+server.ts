import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import type { ContentCreateModel } from "$lib/types/lms/content";
import { createOrUpdateSchema } from "$lib/validation/lms/content.schema";
import { createContent } from "$routes/api/services/lms/course.contents";

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside content server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: ContentCreateModel = await request.json();

        console.log("data", data);
        
        const moduleId = data.CourseModuleId;
        if (!moduleId) {
            return ResponseHandler.handleError(400, null, new Error("ModuleId is required."));
        }

        const validationResult = createOrUpdateSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await createContent(
            sessionId,
            data.Title,
            data.ContentType,
            data.CourseModuleId,
            data.Description,
            data.Sequence,
            data.ResourceLink,
            data.ImageUrl,
            data.DurationInMins
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating contents:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

