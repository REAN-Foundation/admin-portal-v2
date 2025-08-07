import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { 
	getAssessmentPathById,
	updateAssessmentPath,
	deleteAssessmentPath
} from '$routes/api/services/reancare/assessments/assessment-paths';
import { updatePathSchema } from '$lib/validation/assessment-path.schema';

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const templateId = event.url.searchParams.get('templateId');
		const pathId = event.params.pathId;

		if (!templateId) {
			return ResponseHandler.handleError(400, null, new Error('Template ID is required.'));
		}

		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error('Path ID is required.'));
		}

		const response = await getAssessmentPathById(sessionId, templateId, pathId);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving assessment path:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const templateId = event.url.searchParams.get('templateId');
		const pathId = event.params.pathId;

		if (!templateId) {
			return ResponseHandler.handleError(400, null, new Error('Template ID is required.'));
		}

		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error('Path ID is required.'));
		}

		const request = event.request;
		const data = await request.json();

		const validationResult = updatePathSchema.safeParse(data);
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

		const response = await updateAssessmentPath(sessionId, templateId, pathId, data);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating assessment path:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const templateId = event.url.searchParams.get('templateId');
		const pathId = event.params.pathId;

		if (!templateId) {
			return ResponseHandler.handleError(400, null, new Error('Template ID is required.'));
		}

		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error('Path ID is required.'));
		}

		const response = await deleteAssessmentPath(sessionId, templateId, pathId);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting assessment path:', error);
		return ResponseHandler.handleError(500, null, error);
	}
}; 