import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPhysiotherapyById } from '$routes/api/services/careplan/assets/physiotherapy';
////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const physiotherapyId = event.params.id;
	const response = await getPhysiotherapyById(sessionId, physiotherapyId);

	const physiotherapy = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		physiotherapy,
		message: response?.Message || 'Physiotherapy retrieved successfully',
		title: 'Physiotherapy Edit'
	};
};

