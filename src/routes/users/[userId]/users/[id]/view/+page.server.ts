import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserById } from '../../../../../api/services/reancare/user';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const userId = event.params.id;
	const response = await getUserById(sessionId, userId);
	// if (response.Status === 'failure' || response.HttpCode !== 200) {
	// 	throw error(response.HttpCode, response.Message);
	// }
	const user = response?.Data?.user;
	const id = response?.Data?.user?.id;
	return {
		location: `${id}/edit`,
		user,
		message: response.Message,
		title: 'Administration-Users View'
	};
};
