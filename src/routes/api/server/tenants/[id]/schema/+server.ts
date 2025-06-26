import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createTenantSchema } from '../../../../services/reancare/tenants';

export const POST = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
        }

        const request = event.request;
        const data = await request.json();
        const tenantId = event.params.id;
        const tenantCode = data.tenantCode;

        if (!tenantCode) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'tenantCode is required',
                Errors: { tenantCode: 'Required' }
            });
        }
        const response = await createTenantSchema(
            sessionId,
            tenantId,
            tenantCode
        );

        console.log('This is response from schema server ==================>', response);
        return ResponseHandler.success(response);
    } catch (error) {
        return ResponseHandler.handleError(500, null, error);
    }
};
