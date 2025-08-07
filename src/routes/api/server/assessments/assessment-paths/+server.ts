import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';
import { 
	createAssessmentPath,
	searchAssessmentPaths,
	updateAssessmentPath,
	deleteAssessmentPath
} from '$routes/api/services/reancare/assessments/assessment-paths';
import { createPathSchema, updatePathSchema } from '$lib/validation/assessment-path.schema';

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const templateId = event.url.searchParams.get('templateId');
		if (!templateId) {
			return ResponseHandler.handleError(400, null, new Error('Template ID is required.'));
		}

		const searchFilters = createSearchFilters(event, {
			templateId: templateId
		});

		const response = await searchAssessmentPaths(sessionId, templateId, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving assessment paths:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const templateId = event.url.searchParams.get('templateId');
		if (!templateId) {
			return ResponseHandler.handleError(400, null, new Error('Template ID is required.'));
		}

		const request = event.request;
		const data = await request.json();

		const validationResult = createPathSchema.safeParse(data);
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

		const response = await createAssessmentPath(sessionId, templateId, data);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating assessment path:', error);
		return ResponseHandler.handleError(500, null, error);
	}
}; 