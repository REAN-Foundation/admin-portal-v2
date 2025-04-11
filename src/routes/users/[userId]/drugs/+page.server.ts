import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchDrugs } from '../../../api/services/reancare/drugs';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:drugs');
	const response = await searchDrugs(sessionId, {
		orderBy: 'DrugName',
		order: 'ascending'
	});
	// if (response.Status === 'failure' || response.HttpCode !== 200) {
	//     throw error(response.HttpCode, response.Message);
	// }
	const drugs = response?.Data?.Drugs || [];
	return {
		drugs,
		sessionId,
		message: response?.Message || 'Drugs retrieved successfully',
		title: 'Clinical-Drugs'
	};
};
