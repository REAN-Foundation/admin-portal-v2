import { getAnimationById } from '../../../../../../../api/services/careplan/assets/animation';
import type { PageServerLoad } from './$types';
import { error, type RequestEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId', sessionId);
	try {
		const animationId = event.params.id;
		const response = await getAnimationById(sessionId, animationId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const animation = response.Data;
		const id = response.Data.id;
		return {
			location: `${id}/edit`,
			animation,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving animation ${error.message}`);
	}
};
