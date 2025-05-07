import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/tenants.schema';
import type { TenantsCreateModel } from '$lib/types/tenants.types';
import { createTenant } from '../../services/rean-care/tenants';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside tenants server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: TenantsCreateModel = await request.json();

		console.log('data', data);
		const validationResult = createOrUpdateSchema.safeParse(data);
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

		const response = await createTenant(
			sessionId,
			data.Name,
			data.Description,
			data.Code,
			data.Phone,
			data.Email
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating tenants:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
