import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import type { RequestEvent } from "@sveltejs/kit";
// import { createOrUpdateSchema } from "$lib/validation/health.system.schema";
import { deleteAudio, getAudioById, updateAudio } from "../../../../../services/careplan/assets/audio";
import type { AudioUpdateModel } from "$lib/types/audio.type";
import { createOrUpdateSchema } from "$lib/validation/audio.schema";

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

        const response = await deleteAudio(
            sessionId,
            id
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error deleting audio:', error);
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

        const response = await getAudioById(sessionId, id);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error biometrics:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        console.log("Inside audio PUT endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const audioId = event.params.id;
        const request = event.request;
        const data: AudioUpdateModel = await request.json();

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

        const response = await updateAudio(sessionId,
            audioId,
            data.Name,
            data.Transcript,     
            data.PathUrl,
            data.Tags,
            data.Version,
            data.TenantId
            );
        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error updating audio:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
