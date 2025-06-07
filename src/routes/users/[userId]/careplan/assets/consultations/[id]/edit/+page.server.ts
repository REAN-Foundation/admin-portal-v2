import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getConsultationById } from '$routes/api/services/careplan/assets/consultations';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const consultationId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getConsultationById(sessionId, consultationId);

	const consultation = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		consultation,
		tenantId,
		message: response?.Message || 'consultation retrieved successfully',
		title: 'Consultation Edit'
	};
};

