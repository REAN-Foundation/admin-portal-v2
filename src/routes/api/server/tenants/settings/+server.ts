import { ResponseHandler } from "$lib/utils/response.handler";
import { getTenantSettingsTypes } from "$routes/api/services/reancare/tenant-settings";
import type { RequestEvent } from "@sveltejs/kit";

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.request.headers.get("session-id");
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
        }

        const response = await getTenantSettingsTypes(sessionId);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error fetching tenant settings types:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
