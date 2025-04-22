import type { PageServerLoad } from './$types';
import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { validateFormData } from '$lib/utils/formValidation';
import {
	getLabRecordTypeById,
	updateLabRecordType
} from '../../../../../api/services/reancare/lab-record-types';
import { updateLabRecordSchema } from '$lib/validation/lab.records.schema';
/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const labRecordTypeId = event.params.id;
	const response = await getLabRecordTypeById(sessionId, labRecordTypeId);

	// if (response.Status === 'failure' || response.HttpCode !== 200) {
	//     throw error(response.HttpCode, response.Message);
	// }
	const labRecordType = response?.Data?.LabRecordType;
	const id = response?.Data?.LabRecordType?.id;
	return {
		location: `${id}/edit`,
		labRecordType,
		message: response.Message,
		title: 'Clinical-Lab Records Edit'
	};
};

export const actions = {
	updateLabRecordTypeAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const labRecordTypeId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const { result, errors } = await validateFormData(request, updateLabRecordSchema);
		if (errors) {
			return { data: result, errors };
		}
		let response;
		try {
			response = await updateLabRecordType(
				sessionId,
				labRecordTypeId,
				result.typeName,
				result.displayName,
				result.snowmedCode,
				result.loincCode,
				result.normalRangeMin,
				result.normalRangeMax,
				result.unit
			);
		} catch (error: any) {
			const errorMessageText = error?.body?.message || 'An error occurred';
			throw redirect(303, `/users/${userId}/lab-records`, errorMessage(errorMessageText), event);
		}
		const id = response.Data.LabRecordType.id;
		throw redirect(
			303,
			`/users/${userId}/lab-records/${id}/view`,
			successMessage(`Lab record updated successfully!`),
			event
		);
	}
};
