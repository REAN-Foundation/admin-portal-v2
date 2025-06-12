import type { MeditationCreateModel } from "$lib/types/meditations.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/meditations.schema";
import { createMeditation } from "$routes/api/services/careplan/assets/meditations";
import type { RequestEvent } from "@sveltejs/kit";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside meditation POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: MeditationCreateModel = await request.json();

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

        const response = await createMeditation(
            sessionId,
            data.Name,
            data.Description ?? '',     
            data.MeditationType,
            data.RecommendedDurationMin,
            data.Tags,
            data.Version,
            data.TenantId
            );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating meditation:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

