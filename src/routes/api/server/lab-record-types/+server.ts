import type { LabRecordCreateModel } from "$lib/types/lab.records.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/lab.records.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { createLabRecordType } from "../../services/reancare/lab-record-types";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside lab record server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: LabRecordCreateModel = await request.json();

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

        const response = await createLabRecordType(sessionId, data.TypeName,
            data.DisplayName,
            data.SnowmedCode,
            data.LoincCode,
            data.NormalRangeMin,
            data.NormalRangeMax,
            data.Unit,);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating lab records:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

