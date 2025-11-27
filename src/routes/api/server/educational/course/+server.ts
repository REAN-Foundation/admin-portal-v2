import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import type { CourseCreateModel } from "$lib/types/lms/course";
import { createOrUpdateSchema } from "$lib/validation/lms/course.schema";
import { createCourse } from "$routes/api/services/reancare/educational/course";

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside course server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: CourseCreateModel = await request.json();

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

        const response = await createCourse(
            sessionId,
            data.Name,
            data.Description,
            data.ImageResourceId,
            data.DurationInDays,
            data.TenantId
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating course:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

