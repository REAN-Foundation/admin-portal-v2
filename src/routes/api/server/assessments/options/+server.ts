import type { RequestEvent } from '@sveltejs/kit';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { redirect } from 'sveltekit-flash-message/server';
import { deleteOption } from '$routes/api/services/reancare/assessments/assessment-nodes';

//////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	const request = event.request;
	const data = await request.json();
	console.log('Inside node options server endpoints');
	let response;
	try{
		response = await deleteOption(
			data.sessionId,
			data.templateId,
			data.nodeId,
			data.optionId
			);
	}catch(error){
		throw redirect(
			errorMessage('Error deleting option.'),
			event
			);
	}
	throw redirect(
		successMessage('Option deleted successfully!'),
		event
		);
};
