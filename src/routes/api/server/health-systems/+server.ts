import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createHealthSystem } from "../../services/rean-care/health.systems";
import type { HealthSystemCreateModel } from "$lib/types/health.system.types";
import { createOrUpdateSchema } from "$lib/validation/health.system.schema";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside health system server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: HealthSystemCreateModel = await request.json();

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

        const response = await createHealthSystem(sessionId, data.Name, data.Tags);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

