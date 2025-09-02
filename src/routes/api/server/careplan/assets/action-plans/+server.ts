import type { ActionPlanCreateModel } from '$lib/types/action.plan';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/action.plan.schema';
import type { RequestEvent } from '@sveltejs/kit';
import { createActionPlan } from '../../../../services/careplan/assets/action-plan';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Action plan server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: ActionPlanCreateModel = await request.json();

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

		const response = await createActionPlan(
			sessionId,
			data.Name,
			data.Description,
			data.Tags,
			data.Version,
			data.TenantId
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Action plan:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
