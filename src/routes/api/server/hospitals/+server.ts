import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import type { HospitalCreateModel } from "$lib/types/hospital.types";
import { createHospital } from "../../services/reancare/hospitals";
import { createOrUpdateSchema } from "$lib/validation/hospital.schemas";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside hospitals server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: HospitalCreateModel = await request.json();

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

        const response = await createHospital(sessionId, data.Name, data.HealthSystemId, data.Tags);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

