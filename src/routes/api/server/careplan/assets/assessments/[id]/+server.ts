import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { createOrUpdateSchema } from "$lib/validation/assessments.schema";
import { deleteAssessment, getAssessmentById, updateAssessment } from "$routes/api/services/careplan/assets/assessments";
import type { AssessmentUpdateModel } from "$lib/types/assessments.type";

///////////////////////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {

    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
        }

        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || '']));
            return ResponseHandler.handleError(400, data, new Error('Validation failed'));
         }

        const id = event.params.id;

        const response = await deleteAssessment(
            sessionId,
            id
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error deleting assessment:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.request.headers.get("session-id");
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
        }

        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(
                Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
            );
            return ResponseHandler.handleError(400, data, new Error("Validation failed"));
        }

        const id = event.params.id;

        const response = await getAssessmentById(sessionId, id);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error Assessment:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        console.log("Inside Assessment PUT endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const assessmentId = event.params.id;
        const request = event.request;
        const data: AssessmentUpdateModel = await request.json();

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

        const response = await updateAssessment(
            sessionId,
            assessmentId,
            data.Name,
            data.Description,     
            data.Template,
            data.ReferenceTemplateCode,
            data.Tags,
            data.Version ?? '',
            data.TenantId,
            data.Metadata
            );
        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error updating assessment:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
