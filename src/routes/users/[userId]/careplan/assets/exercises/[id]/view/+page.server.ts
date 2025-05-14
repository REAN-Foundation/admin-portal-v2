import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getExerciseById } from '$routes/api/services/careplan/assets/exercises';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const exerciseId = event.params.id;
	const response = await getExerciseById(sessionId, exerciseId);

	const exercise = response?.Data;
	const id = exercise?.id;

	return {
		location: `${id}/edit`,
		exercise,
		message: response?.Message || 'exercise retrieved successfully',
		title: 'exercise Edit'
	};
};

