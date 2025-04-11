import type { RequestEvent } from '@sveltejs/kit';
// import { page } from '$app/stores';
import { searchSymptoms } from '../../../services/reancare/symptoms';
import { ResponseHandler } from '$lib/utils/response.handler';
// import { BACKEND_API_URL } from '$env/static/private';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	const sessionId = event.locals?.sessionUser?.sessionId;
	if (!sessionId) {
		return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
	}

	const searchParams: URLSearchParams = event.url.searchParams;
	const searchFilters = {
		symptom: searchParams.get('symptom') ?? undefined,
		tags: searchParams.get('tags') ?? undefined,
		sortBy: searchParams.get('sortBy') ?? 'CreatedAt',
		sortOrder: searchParams.get('sortOrder') ?? 'ascending',
		itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
		pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
	};


		console.log('Search parms: ', searchParams);
		const response = await searchSymptoms(sessionId, searchFilters);
		const symptoms = response.Data.SymptomTypes;

		// for (const symptom of symptoms.Items) {
		// 	if (symptom.ImageResourceId) {
		// 		symptom['ImageUrl'] =
		// 			BACKEND_API_URL +
		// 			`/file-resources/${symptom.ImageResourceId}/download?disposition=inline`;
		// 	} else {
		// 		symptom['ImageUrl'] = null;
		// 	}
		// }

		return new Response(JSON.stringify(symptoms));
	} catch (err) {
		console.error(`Error retriving symptom: ${err.message}`);
		return new Response(err.message);
	}
};
