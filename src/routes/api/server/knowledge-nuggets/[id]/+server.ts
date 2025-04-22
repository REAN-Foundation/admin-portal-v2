import type { RequestEvent } from '@sveltejs/kit';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { redirect } from 'sveltekit-flash-message/server';
import { deleteKnowledgeNugget } from '../../../services/reancare/knowledge-nuggets';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';

//////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.request.headers.get('session-id');
		// const sessionId = event.locals?.sessionUser?.sessionId;

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

		const response = await deleteKnowledgeNugget(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting health system:', error);
		return ResponseHandler.handleError(500, null, error);
	}
	// const request = event.request;
	// const data = await request.json();
	// console.log('Inside knowledge nugget server endpoints');
	// let response;
	// try{
	// 	response = await deleteKnowledgeNugget(data.sessionId, data.knowledgeNuggetId);
	// }catch(error){
	// 	throw redirect(
	// 		errorMessage('Error deleting knowledge nugget.'),
	// 		event
	// 		);
	// }
	// throw redirect(
	// 	successMessage(response.Message),
	// 	event
	// 	);
};
