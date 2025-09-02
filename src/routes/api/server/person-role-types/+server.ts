import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createPersonRoleType } from "../../services/reancare/person-role-types";
import type { PersonRoleCreateModel } from "$lib/types/person.role.types";
import { createOrUpdateSchema } from "$lib/validation/person.role.schemas";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside user roles POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: PersonRoleCreateModel = await request.json();

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

        const response = await createPersonRoleType(sessionId, data.Name, data.Description);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating user roles:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

