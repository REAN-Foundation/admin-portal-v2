import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createHealthSystem } from "../../services/rean-care/health.systems";
import type { HealthSystemCreateModel } from "$lib/types/health.system.types";
import { createOrUpdateSchema } from "$lib/validation/symptoms.schema";
import { createSymptom } from "../../services/reancare/symptoms";
import type { SymptomCreateModel } from "$lib/types/symptoms.types";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside symptoms server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: SymptomCreateModel = await request.json();

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

        const response = await createSymptom(sessionId, data.Symptom, data.Description, data.Tags, data.Language, data.ImageResourceId);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

