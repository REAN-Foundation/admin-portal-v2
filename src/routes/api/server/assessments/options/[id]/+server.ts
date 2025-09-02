import type { AssessmentNodeOptionUpdateModel } from "$lib/types/assessment-node-option.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/assessment-node-option.schema";
import { uuidSchema } from "$lib/validation/common.schema";
import { deleteOption, updateOption } from "../../../../services/reancare/assessments/assessment-nodes";
import type { RequestEvent } from "@sveltejs/kit";

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

        const optionId = event.params.id;
        const templateId = event.url.searchParams.get('templateId');
        const nodeId = event.url.searchParams.get('nodeId');

        const response = await deleteOption(
            sessionId,
            templateId,
            nodeId,
            optionId
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error deleting health system:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};

// export const GET = async (event: RequestEvent) => {
//     try {
//         const sessionId = event.request.headers.get("session-id");
//         if (!sessionId) {
//             return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
//         }

//         const result = await uuidSchema.safeParseAsync(event.params);
//         if (!result.success) {
//             const data = Object.fromEntries(
//                 Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
//             );
//             return ResponseHandler.handleError(400, data, new Error("Validation failed"));
//         }

//         const nodeId = event.params.id;
//         const templateId = event.url.searchParams.get('templateId');

//         const response = await getAssessmentNodeById(sessionId, templateId, nodeId);

//         return ResponseHandler.success(response);
//     } catch (error) {
//         console.error("Error fetching health system:", error);
//         return ResponseHandler.handleError(500, null, error);
//     }
// };

export const PUT = async (event: RequestEvent) => {
    try {
        console.log("Inside health system server PUT endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const optionId = event.params.id;
        const templateId = event.url.searchParams.get('templateId');
        const nodeId = event.url.searchParams.get('nodeId');
        const request = event.request;
        const data: AssessmentNodeOptionUpdateModel = await request.json();

        console.log("data", data);
        const validationResult = createOrUpdateSchema.safeParse(data);
        console.log("validation from server", validationResult);

        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await updateOption(
            sessionId,
            templateId,
            nodeId,
            optionId,
            data.Text,
            data.Sequence,
            data.ProviderGivenCode
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error updating assessment template:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
