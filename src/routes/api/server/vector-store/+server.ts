import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { createVector } from '$routes/api/services/bot-content/vectorStore';
import type { VectorStoreCreateModel } from '$lib/types/vector.store.types';
import { createSchema } from '$lib/validation/vector.store.schema';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside vector store server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const TenantId = event.locals?.sessionUser?.tenantCode;


		const request = event.request;
		const data: VectorStoreCreateModel = await request.json();

		console.log('data ==>', data);
		const validationResult = createSchema.safeParse(data);
		console.log('validation result of publish', validationResult);

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

		const response = await createVector(sessionId, data.id, data.TenantId, data.Version);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating health systems:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
