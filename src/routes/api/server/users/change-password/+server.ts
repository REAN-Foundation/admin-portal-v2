import { ResponseHandler } from "$lib/utils/response.handler";
import { changePasswordSchema } from "$lib/validation/user.schemas";
import { changePassword } from "$routes/api/services/reancare/user";
import type { RequestEvent } from "@sveltejs/kit";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside change password server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;
        const { email, username, roleId } = event.locals?.sessionUser || {};
        
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data = await request.json();

        console.log("data", data);
        const validationResult = changePasswordSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await changePassword(sessionId, data.OldPassword, data.NewPassword, email, username, roleId);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};