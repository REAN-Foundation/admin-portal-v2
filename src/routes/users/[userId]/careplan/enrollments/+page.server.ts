import { type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import { searchEnrollments } from '../../../../api/services/careplan/enrollments';
import type { PageServerLoad } from '../../../../$types';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const userId = event.params.userId;
	console.log('sessionId', sessionId);

	try {
		const response = await searchEnrollments(sessionId, {
			itemsPerPage: 10
		});
		const enrollments = response.Data;
		return {
			enrollments,
			sessionId
		};
	} catch (error) {
		console.error(`Error retrieving enrollments: ${error.message}`);
		throw redirect(
			303,
			`/users/${userId}/home`,
			errorMessage('Error retrieving enrollments'),
			event
		);
	}
};
