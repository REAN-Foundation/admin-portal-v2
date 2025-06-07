import type { PhysiotherapyCreateModel } from "$lib/types/physiotherapy.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/physiotherapy.schema";
import { createPhysiotherapy } from "$routes/api/services/careplan/assets/physiotherapy";
import type { RequestEvent } from "@sveltejs/kit";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside physiotherapy POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: PhysiotherapyCreateModel = await request.json();

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

        const response = await createPhysiotherapy(
            sessionId,
            data.Name,
            data.Description ?? '',  
            data.RecommendedDurationMin,
            data.Tags,
            data.TenantId,
            data.Version ?? '');

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating physiotherapy:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

