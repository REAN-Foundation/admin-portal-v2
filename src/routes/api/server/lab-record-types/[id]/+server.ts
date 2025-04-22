import type { RequestEvent } from '@sveltejs/kit';
import { deleteLabRecordType } from '../../../services/reancare/lab-record-types';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { redirect } from 'sveltekit-flash-message/server';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';

//////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.request.headers.get('session-id');
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}
		// const request = event.request;
		// const data = await request.json();
		// console.log('Inside lab record type server endpoints');
		// let response;

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

		const response = await deleteLabRecordType(sessionId, id);
		return ResponseHandler.success(response);
		// throw redirect(successMessage('Lab record deleted successfully!'), event);
	} catch (error) {
		// throw redirect(errorMessage('Error deleting lab record type.'), event);
		console.error('Error deleting health system:', error);

		return ResponseHandler.handleError(500, null, error);
	}
};

// export const DELETE = async (event: RequestEvent) => {
// 	// const request = event.request;
// 	// const url = event.url
// 	// console.log('@@@',event.url.searchParams.get('sessionId'))
// 	// console.log('@@@',event.url.searchParams.get('labRecordTypeId'))
// 	// const params = event.params
// 	// console.log('PARAMS',params)
// 	// const data = await request.json();
// 	console.log('Inside lab record type server endpoints');
// 	let response;
// 	try{
// 		response = await deleteLabRecordType(event.url.searchParams.get('sessionId'), event.url.searchParams.get('labRecordTypeId'));
// 		console.log('Response =>',response)
// 	}catch(error){
// 		throw redirect(
// 			errorMessage('Error deleting lab record type.'),
// 			event
// 			);
// 	}
// 	throw redirect(
// 		successMessage(response.Message),
// 		event
// 		);
// };
