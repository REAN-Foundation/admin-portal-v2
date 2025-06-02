import { ResponseHandler } from "$lib/utils/response.handler";
import { ChatBotSettingsSchema, CommonSettingsSchema, ConsentSettingsSchema, FollowupSettingsSchema, FormsSettingsSchema, tenantSettingTypeSchema } from "$lib/validation/tenant.settings.schema";
import { getTenantSettingsByType, updateTenantSettingsByType } from "$routes/api/services/reancare/tenant-settings";
import type { RequestEvent } from "@sveltejs/kit";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.request.headers.get("session-id");
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
        }

        const result = await tenantSettingTypeSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(
                Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
            );
            return ResponseHandler.handleError(400, data, new Error("Validation failed"));
        }

        const id = event.params.id;
        const type = event.params.type;

        const response = await getTenantSettingsByType(sessionId, id, type);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error fetching tenant settings by type:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        console.log('Inside tenants setting server PUT endpoints');
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
        }

        const id = event.params.id;
        const type = event.params.type;
        const request = event.request;
        const data = await request.json();

        const validationResult = validateRequestData(data, type);
        console.log('Validation result:', validationResult.error);
        console.log('Validation result:', JSON.stringify(validationResult, null, 2));
        console.log('Data to be updated:', JSON.stringify(data, null, 2));
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


        const formData = { [type]: data };

        const response = await updateTenantSettingsByType(sessionId, id, type, formData);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error updating tenants:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};

const validateRequestData = (data: any, type: string) => {
    switch (type) {
        case 'Common':
            console.log('Validating ChatBot settings');
            console.log('Data:', data);
            return CommonSettingsSchema.safeParse(data);
        case 'ChatBot':
            return ChatBotSettingsSchema.safeParse(data);
        case 'Followup':
            return FollowupSettingsSchema.safeParse(data);
        case 'Forms':
            return FormsSettingsSchema.safeParse(data);
        case 'Consent':
            return ConsentSettingsSchema.safeParse(data);
    }
}
