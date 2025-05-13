import type { MessageCreateModel } from "$lib/types/message.type";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/message.schema";
import { createMessage } from "$routes/api/services/careplan/assets/messages";
import type { RequestEvent } from "@sveltejs/kit";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside message POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: MessageCreateModel = await request.json();

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

        const response = await createMessage(
            sessionId,
            data.Name,
            data.Description, 
            data.MessageType, 
            data.TemplateName,   
            data.PathUrl,
            data.Tags,
            data.Version ?? '');

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating messages:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

