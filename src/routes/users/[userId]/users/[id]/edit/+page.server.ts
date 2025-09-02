import { redirect } from 'sveltekit-flash-message/server';
import { error, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getUserById, updateUser } from '../../../../../api/services/reancare/user';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const usreId = event.params.id;
	const response = await getUserById(sessionId, usreId);

	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const user = response.Data.user;
	const id = response.Data.user.id;
	return {
		location: `${id}/edit`,
		user,
		message: response.Message,
		title:'Administration-Users Edit'
	};
	
};

