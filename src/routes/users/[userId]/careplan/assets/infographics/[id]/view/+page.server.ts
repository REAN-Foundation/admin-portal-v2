import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getInfographicsById } from '$routes/api/services/careplan/assets/infographics';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const infographicsId = event.params.id;
	const response = await getInfographicsById(sessionId, infographicsId);

	const infographics = response?.Data;
	const id = infographics?.id;

	return {
		location: `${id}/edit`,
		infographics,
		message: response?.Message || 'infographics retrieved successfully',
		title: 'infographics Edit'
	};
};

