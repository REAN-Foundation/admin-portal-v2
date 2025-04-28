import type { KnowledgeNuggetsCreateModel } from "$lib/types/knowledge.nuggets.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/knowledge.nuggets.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { createKnowledgeNugget } from "../../services/reancare/knowledge-nuggets";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside knowledge nuggets POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: KnowledgeNuggetsCreateModel = await request.json();

        console.log("data ==>", data);
        const validationResult = createOrUpdateSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await createKnowledgeNugget(sessionId, data.Name, data.BriefInformation, data.DetailedInformation, data.AdditionalResources, data.Tags);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating knowledge nuggets:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

