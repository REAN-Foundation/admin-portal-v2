import { error, fail, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getDrugById, updateDrug } from '../../../../../api/services/reancare/drugs';
import { validateFormData } from '$lib/utils/formValidation';
import { updateDrugSchema } from '$lib/validation/drugs.schema';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const drugId = event.params.id;
	const response = await getDrugById(sessionId, drugId);

	// if (response.Status === 'failure' || response.HttpCode !== 200) {
	//     throw error(response.HttpCode, response.Message);
	// }
	const drug = response?.Data?.Drug;
	const id = response?.Data?.Drug?.id;
	return {
		location: `${id}/edit`,
		drug,
		message: response.Message,
		title: 'Clinical-Drugs Edit'
	};
};

// const updateDrugSchema = zfd.formData({
//     drugName: z.string().max(128),
//     genericName: z.string().optional(),
//     ingredients: z.string().optional(),
//     strength: z.string().optional(),
//     otherCommercialNames: z.string().optional(),
//     manufacturer: z.string().optional(),
//     otherInformation: z.string().optional()
// });

export const actions = {
	updateDrugAction: async (event: RequestEvent) => {
		// const request = event.request;
		const userId = event.params.userId;
		const drugId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await event.request.formData();

		// const { result, errors } = await validateFormData(request, updateDrugSchema);

		const result = await updateDrugSchema.safeParseAsync(Object.fromEntries(data));
		if (!result.success) {
			return fail(400, {
				errors: Object.fromEntries(
					Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || ''
					])
				)
			});
		}
		// if (errors) {
		// 	return { data: result, errors };
		// }
		let response;
		try {
			response = await updateDrug(
				sessionId,
				drugId,
				result?.data?.drugName,
				result?.data?.genericName,
				result?.data?.ingredients,
				result?.data?.strength,
				result?.data?.otherCommercialNames,
				result?.data?.manufacturer,
				result?.data?.otherInformation
			);
		} catch (error: any) {
			const errorMessageText = error?.body?.message || 'An error occurred';
			throw redirect(303, `/users/${userId}/drugs`, errorMessage(errorMessageText), event);
		}
		const id = response.Data.Drug.id;
		throw redirect(
			303,
			`/users/${userId}/drugs/${id}/view`,
			successMessage(`Drug updated successfully!`),
			event
		);
	}
};
