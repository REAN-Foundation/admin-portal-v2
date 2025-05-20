import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCheckupsById } from '$routes/api/services/careplan/assets/checkups';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const checkupsId = event.params.id;
	const response = await getCheckupsById(sessionId, checkupsId);

	const checkups = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		checkups,
		message: response?.Message || 'checkups retrieved successfully',
		title: 'Checkups Edit'
	};
};

