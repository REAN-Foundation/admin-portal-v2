import { getReflectionById } from '$routes/api/services/careplan/assets/reflection';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const reflectionId = event.params.id;

	const response = await getReflectionById(sessionId, reflectionId);

	const reflection = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		reflection,
		message: response?.Message || 'Reflection retrieved successfully',
		title: 'Reflection View'
	};
};
