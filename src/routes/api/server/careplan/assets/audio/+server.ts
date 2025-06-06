import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createAudio } from "../../../../services/careplan/assets/audio";
import { createOrUpdateSchema } from "$lib/validation/audio.schema";
import type { AudioCreateModel } from "$lib/types/audio.type";


export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside audio POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: AudioCreateModel = await request.json();

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

        const response = await createAudio(
            sessionId,
            data.Name,
            data.Transcript,     
            data.PathUrl,
            data.Tags,
            data.TenantId,
            data.Version ?? '');

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating audio:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

