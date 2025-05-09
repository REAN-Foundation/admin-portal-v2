import { getWordPowerById } from '$routes/api/services/careplan/assets/word-power';
import type { PageServerLoad } from './$types';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	try {
		const wordPowerId = event.params.id;
		const response = await getWordPowerById(sessionId, wordPowerId);
		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const wordPower = response.Data;
		const id = response.Data.id;
		return {
			location: `${id}/edit`,
			wordPower,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving word power ${error.message}`);
		throw redirect(303, '/');
	}
};
