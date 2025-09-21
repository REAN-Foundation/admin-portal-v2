import type { AssessmentCreateModel } from "$lib/types/assessments.type";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/assessments.schema";
import { createAssessment } from "$routes/api/services/careplan/assets/assessments";
import type { RequestEvent } from "@sveltejs/kit";


export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside assessment POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: AssessmentCreateModel = await request.json();

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

        console.log("ReferenceTemplateCode:", data.ReferenceTemplateCode);
        const response = await createAssessment(
            sessionId,
            data.Name,
            data.Description,     
            data.Template,
            data.ReferenceTemplateCode,
            data.Tags, 
            data.Version ?? '',
            data.TenantId,
            data.MetaData);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating assessment:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

