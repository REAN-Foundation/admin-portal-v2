import type { VideoCreateModel } from '$lib/types/video';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/video.schema';
import { createVideo } from '$routes/api/services/careplan/assets/video';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Video server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const userId = event.locals?.sessionUser?.userId;

		console.log('userId', userId);
		console.log(event.params, 'event');

		const data: VideoCreateModel = await request.json();

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

		const response = await createVideo(
			sessionId,
			data.Name,
			data.Transcript,
			data.PathUrl,
			userId,
			data.Tags,
			data.Version
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Video:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
