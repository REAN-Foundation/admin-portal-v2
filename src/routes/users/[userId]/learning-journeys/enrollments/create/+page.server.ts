import { type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from '../../$types';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const userId = event.params.userId;

	try {
		return {
			sessionId,
			userId
		};
	} catch (error) {
		console.error(`Error loading enrollment creation page: ${error.message}`);
		throw redirect(
			303,
			`/users/${userId}/home`,
			errorMessage('Error loading enrollment creation page'),
			event
		);
	}
};

