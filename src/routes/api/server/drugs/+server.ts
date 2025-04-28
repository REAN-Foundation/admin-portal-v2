import type { DrugCreateModel } from "$lib/types/drug.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/drugs.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { createDrug } from "../../services/reancare/drugs";

//////////////////////////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside drugs server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: DrugCreateModel = await request.json();

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

        const response = await createDrug(
            sessionId,
            data.DrugName,
            data.GenericName,
            data.Ingredients,
            data.Strength,
            data.OtherCommercialNames,
            data.Manufacturer,
            data.OtherInformation
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating drugs:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

