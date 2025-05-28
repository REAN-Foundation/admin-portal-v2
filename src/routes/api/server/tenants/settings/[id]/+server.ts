import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import { TenantSettingsSchema } from "$lib/validation/tenant.settings.schema";
import { getTenantSettings, updateTenantSettings } from "$routes/api/services/reancare/tenant-settings";
import type { RequestEvent } from "@sveltejs/kit";

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.request.headers.get("session-id");
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
        }

        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(
                Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
            );
            return ResponseHandler.handleError(400, data, new Error("Validation failed"));
        }

        const id = event.params.id;

        const response = await getTenantSettings(sessionId, id);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error fetching tenant settings by tenant id:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        console.log('Inside update tenants setting by id - PUT endpoints');
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
        }

        const id = event.params.id;
        const request = event.request;
        const data = await request.json();
        console.log('data', data);      

        const validationResult = TenantSettingsSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(
                    Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
                        key,
                        val?.[0] || ''
                    ])
                )
            });
        }

        const response = await updateTenantSettings(sessionId, id, data);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error updating tenants:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};
