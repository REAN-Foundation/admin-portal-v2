import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMedicationById } from '$routes/api/services/careplan/assets/medications';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const medicationsId = event.params.id;
	const response = await getMedicationById(sessionId, medicationsId);

	const medications = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		medications,
		message: response?.Message || 'medications retrieved successfully',
		title: 'Medications Edit'
	};
};

