import type { RequestEvent } from '@sveltejs/kit';
import { deleteDrug } from '../../../services/reancare/drugs';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { redirect } from 'sveltekit-flash-message/server';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';

//////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.request.headers.get('session-id');
		console.log('delete event', event);

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

		const response = await deleteDrug(sessionId, id);

		return ResponseHandler.success(response);

		// const request = event.request;
		// const data = await request.json();
		// console.log('Inside drug server endpoints');
		// let response;
		// try{
		// 	response = await deleteDrug(data.sessionId, data.drugId);
		// }catch(error){
		// 	throw redirect(
		// 		errorMessage('Error deleting drug.'),
		// 		event
		// 		);
		// }
		// throw redirect(
		// 	successMessage('Drug deleted successfully!'),
		// 	event
		// 	);
	} catch (error) {
		console.error('Error deleting health system:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
