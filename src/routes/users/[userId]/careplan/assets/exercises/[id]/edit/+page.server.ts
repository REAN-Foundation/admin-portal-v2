import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getExerciseById } from '$routes/api/services/careplan/assets/exercises';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const exerciseId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getExerciseById(sessionId, exerciseId);

	const exercise = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		exercise,
		tenantId,
		message: response?.Message || 'Exercise retrieved successfully',
		title: 'Exercise Edit'
	};
};

