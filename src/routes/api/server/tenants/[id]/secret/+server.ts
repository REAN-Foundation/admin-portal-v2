import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { createBotSecret, getBotSecret, updateBotSecret } from '$routes/api/services/reancare/tenants';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        console.log("I am in server of get")
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
        }
        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(
                Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
                    key,
                    val?.[0] || ''
                ])
            );
            return ResponseHandler.handleError(400, data, new Error('Validation failed'));
        }

        const id = event.params.id;
        const response = await getBotSecret(sessionId, id);
        return ResponseHandler.success(response);

        // Temporary mock response for testing
        // const mockResponse = {
        //     id: id,
        //     secret: 'test-bot-secret-12345',
        //     createdAt: new Date().toISOString(),
        //     status: 'active'
        // };
        // return ResponseHandler.success(mockResponse);
    } catch (error) {
        console.error('Error fetching bot secret:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const POST = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
        }
        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(
                Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
                    key,
                    val?.[0] || ''
                ])
            );
            return ResponseHandler.handleError(400, data, new Error('Validation failed'));
        }

        const id = event.params.id;
        const body = await event.request.json();
        const response = await createBotSecret(sessionId, id, body);
        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error creating bot secret:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const PUT = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
        }
        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(
                Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
                    key,
                    val?.[0] || ''
                ])
            );
            return ResponseHandler.handleError(400, data, new Error('Validation failed'));
        }

        const id = event.params.id;
        const body = await event.request.json();
        const response = await updateBotSecret(sessionId, id, body);
        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error updating bot secret:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};
