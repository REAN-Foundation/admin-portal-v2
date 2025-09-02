import { getAnimationById } from '$routes/api/services/careplan/assets/animation';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const animationId = event.params.id;

	const response = await getAnimationById(sessionId, animationId);

	const animation = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		animation,
		message: response?.Message || 'Animation retrieved successfully',
		title: 'Animation View'
	};
};
