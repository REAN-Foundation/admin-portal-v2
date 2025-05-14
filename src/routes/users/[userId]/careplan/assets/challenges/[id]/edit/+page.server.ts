import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getChallengesById } from '$routes/api/services/careplan/assets/challenges';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const challengesId = event.params.id;
	const response = await getChallengesById(sessionId, challengesId);

	const challenges = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		challenges,
		message: response?.Message || 'audio retrieved successfully',
		title: 'Challenges Edit'
	};
};

