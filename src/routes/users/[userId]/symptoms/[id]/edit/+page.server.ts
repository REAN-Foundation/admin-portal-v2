import { type ServerLoadEvent } from '@sveltejs/kit';
// import { redirect } from 'sveltekit-flash-message/server';
// import { errorMessage, successMessage } from '$lib/utils/message.utils';
// import { z } from 'zod';
// import { zfd } from 'zod-form-data';
import { BACKEND_API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { getSymptomById } from '../../../../../api/services/reancare/symptoms';
// import { updateSymptomSchema } from '$lib/validation/symptoms.schema';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const symptomId = event.params.id;
	const response = await getSymptomById(sessionId, symptomId);

	// if (response.Status === 'failure' || response.HttpCode !== 200) {
	//     throw error(response.HttpCode, response.Message);
	// }
	const symptom = response?.Data?.SymptomType;
	const id = response?.Data?.SymptomType.id;
	const imageResourceId = symptom?.ImageResourceId;
	if (imageResourceId) {
		symptom['ImageUrl'] =
			BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
	} else {
		symptom['ImageUrl'] = null;
	}
	return {
		location: `${id}/edit`,
		symptom,
		message: response?.Message || 'Symptom retrieved successfully',
		title: 'Clinical-Symptoms Edit'
	};
};

// export const actions = {
// 	updateSymptomAction: async (event: RequestEvent) => {
// 		// const request = event.request;
// 		const userId = event.params.userId;
// 		const sessionId = event.cookies.get('sessionId');
// 		const symptomId = event.params.id;
// 		const data = await event.request.formData();
// 		// const formData = Object.fromEntries(data);

// 		const result = await updateSymptomSchema.safeParseAsync(Object.fromEntries(data));
// 		if (!result.success) {
// 			return fail(400, {
// 				errors: Object.fromEntries(
// 					Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
// 						key,
// 						val?.[0] || ''
// 					])
// 				)
// 			});
// 		}

// 		// const tags = data.has('tags') ? data.getAll('tags') : [];
// 		// const formDataValue = { ...formData, tags: tags };

// 		// type SymptomSchema = z.infer<typeof updateSymptomSchema>;

// 		// let result: SymptomSchema = {};
// 		// try {
// 		// 	result = updateSymptomSchema.parse(formDataValue);
// 		// 	console.log('result', result);
// 		// } catch (err: any) {
// 		// 	const { fieldErrors: errors } = err.flatten();
// 		// 	console.log(errors);
// 		// 	const { ...rest } = formData;
// 		// 	return {
// 		// 		data: rest,
// 		// 		errors
// 		// 	};
// 		// }

// 		let response;
// 		try {
// 			response = await updateSymptom(
// 				sessionId,
// 				symptomId,
// 				result?.data?.symptom,
// 				result?.data?.description,
// 				result?.data?.tags,
// 				result?.data?.language,
// 				result?.data?.imageResourceId
// 			);
// 		} catch (error: any) {
// 			const errorMessageText = error?.body?.message || 'An error occurred';
// 			throw redirect(303, `/users/${userId}/symptoms`, errorMessage(errorMessageText), event);
// 		}
// 		const id = response.Data.SymptomType.id;

// 		throw redirect(
// 			303,
// 			`/users/${userId}/symptoms/${id}/view`,
// 			successMessage(`Symptom updated successfully!`),
// 			event
// 		);
// 	}
// };
