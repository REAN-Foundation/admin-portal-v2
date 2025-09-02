import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAnimationById } from '$routes/api/services/careplan/assets/animation';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const animationId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getAnimationById(sessionId, animationId);

	const animation = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		animation,
		tenantId,
		message: response?.Message || 'Animation retrieved successfully',
		title: 'Animation Edit'
	};
};
