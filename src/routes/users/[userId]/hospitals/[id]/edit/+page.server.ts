import { error, fail, type RequestEvent } from '@sveltejs/kit';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getHospitalById, updateHospital } from '../../../../../api/services/reancare/hospitals';
import { searchHealthSystems } from '../../../../../api/services/reancare/health.systems';
import { updateHospitalSchema } from '$lib/validation/hospital.schemas';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const hospitalId = event.params.id;
	const response = await getHospitalById(sessionId, hospitalId);

	const hospital = response?.Data?.Hospital;
	const id = response?.Data?.Hospital?.id;
	const healthSystems_ = await searchHealthSystems(sessionId, {
		itemsPerPage: 200
	});
	const healthSystems = healthSystems_.Data.HealthSystems.Items;
	return {
		location: `${id}/edit`,
		hospital,
		healthSystems,
		message: response?.Message || 'HOspitals retrieved successfully',
		title: 'Hospital Systems-Hospitals Edit'
	};
};

export const actions = {
	updateHospitalAction: async (event: RequestEvent) => {
		const userId = event.params.userId;
		const hospitalId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await event.request.formData();
		const result = await updateHospitalSchema.safeParseAsync(Object.fromEntries(data));

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

		let response;
		try {
			response = await updateHospital(
				sessionId,
				hospitalId,
				result?.data?.hospitalName,
				result?.data?.healthSystemId,
				result?.data?.tags
			);
		} catch (error: any) {
			const errorMessageText = error?.body?.message || 'An error occurred';
			throw redirect(303, `/users/${userId}/hospitals`, errorMessage(errorMessageText), event);
		}
		const id = response.Data.Hospital.id;
		throw redirect(
			303,
			`/users/${userId}/hospitals/${id}/view`,
			successMessage(`Hospital updated successfully!`),
			event
		);
	}
};
