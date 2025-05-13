import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getWordPowerById } from '../../../../../../../api/services/careplan/assets/word-power';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const wordPowerId = event.params.id;
	const response = await getWordPowerById(sessionId, wordPowerId);

	const wordPower = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		wordPower,
		message: response?.Message || 'Word Power retrieved successfully',
		title: 'Word Power Edit'
	};
};
