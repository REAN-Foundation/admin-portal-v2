import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';
import { searchCareplanCategories } from '$routes/api/services/careplan/scheduling';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const response = await searchCareplanCategories(sessionId);

		const careplanCategories = response.Data.Items;

		return {
			careplanCategories
		};
	} catch (error) {
		console.error(`Error retriving care plan: ${error.message}`);
	}
};