import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { deleteAssessmentNode, getAssessmentNodeById, updateAssessmentNode } from "../../../../services/reancare/assessments/assessment-nodes";
import type { AssessmentNodeUpdateModel } from "$lib/types/assessment-node.types";
import { createOrUpdateSchema } from "$lib/validation/assessment-node.schema";

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

        const nodeId = event.params.id;
        const templateId = event.url.searchParams.get('templateId');
        const response = await deleteAssessmentNode(
            sessionId,
            templateId,
            nodeId
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error deleting health system:', error);
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

        const nodeId = event.params.id;
        const templateId = event.url.searchParams.get('templateId');

        const response = await getAssessmentNodeById(sessionId, templateId, nodeId);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error fetching health system:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        console.log("Inside health system server PUT endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const nodeId = event.params.id;
        const request = event.request;
        const data: AssessmentNodeUpdateModel = await request.json();

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
        const templateId = event.url.searchParams.get('templateId');


        const response = await updateAssessmentNode(
            sessionId,
            templateId,
            nodeId,
            // data.ParentNodeId,
            data.NodeType,
            data.Title,
            data.Description,
            data.Tags,
            data.QueryType,
            data.Options,
            data.Message,
            data.Sequence,
            data.ServeListNodeChildrenAtOnce,
            data.CorrectAnswer,
            data.RawData,
            data.ScoringApplicable,
            data.Score,
            data.ProviderAssessmentCode,
            data.FieldIdentifier,
            data.FieldIdentifierUnit,
            data.Required
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error updating assessment template:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
