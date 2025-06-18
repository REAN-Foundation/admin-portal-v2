import type { BiometricsCreateModel } from "$lib/types/biometrics.type";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/biometrics.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { createBiometrics } from "../../../../services/careplan/assets/biometrics";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside biometrics POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: BiometricsCreateModel = await request.json();

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

        const response = await createBiometrics(
            sessionId,
            data.Name,
            data.Description ?? '',     
            data.BiometricsType,
            data.MeasurementUnit,
            data.Tags,
            data.Version,
            data.TenantId
        )

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating biometrics:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

