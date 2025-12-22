import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import type { UpdateUserLearningModel } from '$lib/types/lms/user-learning';
import {
	updateUserLearningBodySchema,
	updateUserLearningParamSchema
} from '$lib/validation/lms/user.learning.schema';
import { updateUserLearning } from '$routes/api/services/lms/user-learnings';

///////////////////////////////////////////////////////////////////////////////

export const PUT = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId || event.request.headers.get('session-id');
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const paramsResult = await updateUserLearningParamSchema.safeParseAsync(event.params);
		if (!paramsResult.success) {
			const data = Object.fromEntries(
				Object.entries(paramsResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const { userId, learningPathId, contentId } = paramsResult.data;
		const data: Partial<UpdateUserLearningModel> = await event.request.json();

		const body: UpdateUserLearningModel = {
			UserId: userId,
			ContentId: contentId,
			LearningPathId: (data.LearningPathId ?? learningPathId) as string,
			CourseId: data.CourseId ?? null,
			ModuleId: data.ModuleId ?? null,
			ProgressStatus: data.ProgressStatus ?? null
		};

		const validationResult = updateUserLearningBodySchema.safeParse(body);
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

		const response = await updateUserLearning(sessionId, userId, learningPathId, contentId, body);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating user learning:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};





